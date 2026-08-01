/**
 * WebSocket hook para notificaciones en tiempo real.
 * DECISIÓN 7: WebSocket, no polling.
 */
import { useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "../store/authStore";

interface WebSocketMessage {
  type: string;
  payload: Record<string, unknown>;
}

interface UseWebSocketOptions {
  onMessage?: (msg: WebSocketMessage) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

const WS_BASE = import.meta.env.VITE_WS_URL ?? `ws://${globalThis.location.host}/ws`;

export function useWebSocket({ onMessage, onConnected, onDisconnected }: UseWebSocketOptions = {}) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { accessToken } = useAuthStore();

  const connect = useCallback(() => {
    if (!accessToken) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(`${WS_BASE}?token=${accessToken}`);

    ws.onopen = () => {
      onConnected?.();
    };

    ws.onmessage = (event) => {
      try {
        const msg: WebSocketMessage = JSON.parse(event.data as string);
        onMessage?.(msg);
      } catch {
        // Ignore malformed messages
      }
    };

    ws.onclose = () => {
      onDisconnected?.();
      // Reconnect after 5s
      reconnectRef.current = setTimeout(() => connect(), 5000);
    };

    ws.onerror = () => {
      ws.close();
    };

    wsRef.current = ws;
  }, [accessToken, onMessage, onConnected, onDisconnected]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  return { send };
}
