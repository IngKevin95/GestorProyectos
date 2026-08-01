import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { useAuthStore } from "../store/authStore";

export function NotFoundPage() {
  const { accessToken } = useAuthStore();

  if (!accessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#172E73" }}>
        <div className="text-center text-white">
          <p className="text-8xl font-bold mb-4" style={{ color: "#1CD9E8" }}>404</p>
          <p className="text-xl mb-6">Page not found</p>
          <Link to="/login" className="text-sm underline opacity-80 hover:opacity-100">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <p className="text-8xl font-bold mb-4" style={{ color: "#172E73" }}>404</p>
        <p className="text-xl text-gray-600 mb-6">Page not found</p>
        <Link
          to="/dashboard"
          className="px-6 py-2 rounded-lg text-white text-sm font-medium"
          style={{ backgroundColor: "#172E73" }}
        >
          ← Back to Dashboard
        </Link>
      </div>
    </Layout>
  );
}
