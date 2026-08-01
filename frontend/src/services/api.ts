/**
 * Axios client configurado con interceptores de autenticación.
 * Base URL: /api/v1 (Vite proxy → backend:8000)
 */
import axios, { type AxiosError, type InternalAxiosRequestConfig, type AxiosInstance } from "axios";
import { useAuthStore } from "../store/authStore";

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
  retryCount?: number;
}

const BASE_URL = import.meta.env.VITE_API_URL ?? "/api/v1";

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30_000,
});

// Request: attach access token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: handle 401 → refresh token flow
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: string) => void; reject: (reason: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else if (token) {
      p.resolve(token);
    }
  });
  failedQueue = [];
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequest;

    if (!originalRequest) throw error;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => { throw err; });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = useAuthStore.getState().refreshToken;

      if (!refreshToken) {
        isRefreshing = false;
        useAuthStore.getState().logout();
        throw error;
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });
        useAuthStore.getState().setTokens(data.access_token, data.refresh_token);
        processQueue(null, data.access_token);
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        throw refreshError;
      } finally {
        isRefreshing = false;
      }
    }

    // Retry logic for transient errors
    const status = error.response?.status;
    const isTransient =
      !error.response ||
      status === 408 ||
      status === 429 ||
      (status && status >= 500 && status < 600) ||
      error.code === 'ECONNABORTED' ||
      error.code === 'ENOTFOUND';

    if (isTransient && originalRequest.method?.toLowerCase() === 'get') {
      if (!originalRequest.retryCount) originalRequest.retryCount = 0;
      if (originalRequest.retryCount < MAX_RETRIES) {
        originalRequest.retryCount += 1;
        const delay = RETRY_DELAY * Math.pow(2, originalRequest.retryCount - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        return api(originalRequest);
      }
    }

    throw error;
  }
);

export default api;
