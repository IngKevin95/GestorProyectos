/**
 * ProfilePage — Current user profile view with enhanced display.
 */
import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { Layout } from "../components/Layout";

export function ProfilePage() {
  const { user, fetchMe } = useAuthStore();

  useEffect(() => {
    if (!user) fetchMe();
  }, [user, fetchMe]);

  if (!user) {
    return (
      <Layout>
        <div className="max-w-lg mx-auto mt-16 text-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Cargando perfil...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Mi Perfil</h1>

        <div className="bg-white rounded-xl shadow divide-y">
          {/* Avatar + name section */}
          <div className="p-6 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold relative bg-indigo-500">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">{user.email}</p>
              <span className={`inline-flex items-center gap-1.5 mt-1 text-xs px-3 py-1 rounded-full font-medium ${
                user.role === "admin"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-blue-100 text-blue-700"
              }`}>
                <span className={`w-2 h-2 rounded-full ${user.role === "admin" ? "bg-purple-500" : "bg-blue-500"}`} />
                {user.role === "admin" ? "Administrador" : "Usuario"}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-4">
            <ProfileField label="Correo Electrónico" value={user.email} icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            <ProfileField label="Rol" value={user.role === "admin" ? "Administrador" : "Usuario"} icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            <ProfileField label="ID de Usuario" value={user.id} icon="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" mono />
          </div>

          {/* Actions */}
          <div className="p-6">
            <p className="text-xs text-gray-400">
              Miembro desde {user.created_at ? new Date(user.created_at).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" }) : "—"}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function ProfileField({ label, value, icon, mono }: Readonly<{ label: string; value: string; icon: string; mono?: boolean }>) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
        </svg>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <span className={`text-sm font-medium text-gray-900 ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}
