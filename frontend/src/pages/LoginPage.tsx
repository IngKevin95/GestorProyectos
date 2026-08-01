/**
 * Login page con XSS prevention (DOMPurify) y manejo de errores.
 */
import DOMPurify from "dompurify";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { useAuthStore } from "../store/authStore";
import { useT } from "../hooks/useT";

export function LoginPage() {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const t = useT();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // DOMPurify sanitiza input antes de usar
    const cleanEmail = DOMPurify.sanitize(email);
    setError("");
    setIsLoading(true);
    try {
      await login(cleanEmail, password);
      navigate("/dashboard");
    } catch (err: unknown) {
      let msg = t("login.error_default");
      if (err instanceof AxiosError && err.response?.data?.detail?.message) {
        msg = DOMPurify.sanitize(String(err.response.data.detail.message));
      } else if (err instanceof Error) {
        msg = DOMPurify.sanitize(err.message);
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#0D2E2B" }}>
      {/* Left panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full" style={{ backgroundColor: "#C69C6D" }} />
          <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full" style={{ backgroundColor: "#C69C6D" }} />
        </div>
        
        {/* Brand Icon (Replaces LogoTrycore) */}
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-8 relative z-10 shadow-lg" style={{ background: "linear-gradient(to bottom right, #C69C6D, #DFB17B)", boxShadow: "0 10px 15px -3px rgba(198, 156, 109, 0.3)" }}>
          <span className="text-5xl font-black text-white">G</span>
        </div>
        
        <h2 className="text-white text-2xl font-bold text-center relative z-10">GestorProyectos</h2>
        <p className="text-white/60 text-center mt-3 max-w-sm relative z-10">
          Sistema de gestión de proyectos operativo
        </p>
        <div className="flex items-center gap-3 mt-8 relative z-10">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#C69C6D" }} />
          <span className="text-white/50 text-sm">Vista única del estado de la cartera</span>
        </div>
        <div className="flex items-center gap-3 mt-2 relative z-10">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#C69C6D" }} />
          <span className="text-white/50 text-sm">Detección automática de riesgos y bloqueos</span>
        </div>
        <div className="flex items-center gap-3 mt-2 relative z-10">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#C69C6D" }} />
          <span className="text-white/50 text-sm">Priorización de atención diaria</span>
        </div>
      </div>

      {/* Right panel — Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 lg:rounded-l-3xl">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(to bottom right, #C69C6D, #DFB17B)", boxShadow: "0 10px 15px -3px rgba(198, 156, 109, 0.3)" }}>
              <span className="text-3xl font-black text-white">G</span>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{t("login.welcome")}</h1>
            <p className="text-gray-500 text-sm mt-2">{t("login.subtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1.5">{t("login.email")}</label>
              <input
                id="login-email"
                type="email"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C69C6D] focus:border-transparent transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="usuario@empresa.com"
                required
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1.5">{t("login.password")}</label>
              <input
                id="login-password"
                type="password"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C69C6D] focus:border-transparent transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg text-white font-semibold text-sm transition disabled:opacity-60 hover:opacity-90"
              style={{ backgroundColor: "#0D2E2B" }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t("login.loading")}
                </span>
              ) : t("login.submit")}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-8">
            © {new Date().getFullYear()} Kevin Orduz
          </p>
        </div>
      </div>
    </div>
  );
}
