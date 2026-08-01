/**
 * AdminPage — User management, roles, and system overview.
 * Only accessible to admin users.
 */
import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { useAdminStore } from "../store/adminStore";
import { useAuthStore } from "../store/authStore";
import type { UserWithStatus, Role } from "../types";
import { Modal } from "../components/ui";
import { showToast, ToastContainer } from "../components/ui/Toast";

const ROLE_BADGE_CLASSES: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  user: "bg-blue-100 text-blue-700",
};

function getRoleBadgeClass(name: string): string {
  return ROLE_BADGE_CLASSES[name] ?? "bg-emerald-100 text-emerald-700";
}

function useRolePermissions(initial: string[] = []) {
  const [selectedPerms, setSelectedPerms] = useState<string[]>(initial);

  const togglePerm = (p: string) => {
    setSelectedPerms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const toggleGroup = (perms: string[]) => {
    const allSelected = perms.every(p => selectedPerms.includes(p));
    if (allSelected) {
      setSelectedPerms(prev => prev.filter(p => !perms.includes(p)));
    } else {
      setSelectedPerms(prev => [...new Set([...prev, ...perms])]);
    }
  };

  return { selectedPerms, setSelectedPerms, togglePerm, toggleGroup };
}

export function AdminPage() {
  const { user } = useAuthStore();
  const { users, summary, roles, isLoading, error, fetchUsers, fetchSummary, fetchRoles, fetchPermissions, clearError } = useAdminStore();
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<UserWithStatus | null>(null);
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [tab, setTab] = useState<"users" | "roles">("users");

  useEffect(() => {
    fetchUsers();
    fetchSummary();
    fetchRoles();
    fetchPermissions();
  }, [fetchUsers, fetchSummary, fetchRoles, fetchPermissions]);

  useEffect(() => {
    if (error) {
      showToast(error, "error");
      clearError();
    }
  }, [error, clearError]);

  if (user?.role !== "admin") {
    return (
      <Layout>
        <div className="max-w-lg mx-auto mt-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728l-12.728-12.728" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Acceso Denegado</h2>
          <p className="text-gray-500 mt-2">Solo los administradores pueden acceder a esta sección.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
            <p className="text-sm text-gray-500 mt-1">Gestión de usuarios, roles y permisos</p>
          </div>
          <button
            type="button"
            className="px-4 py-2 rounded-xl text-white text-sm font-bold flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 hover:-translate-y-0.5 active:translate-y-0"
            onClick={() => setShowCreate(true)}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-9-1a4 4 0 118 0 4 4 0 01-8 0zm-2 8a6 6 0 0112 0v1H4v-1z" />
            </svg>
            Nuevo Usuario
          </button>
        </div>

        {/* Summary cards */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <SummaryCard label="Total Usuarios" value={summary.total} icon="users" color="#4f46e5" />
            <SummaryCard label="Usuarios Activos" value={summary.active} icon="check" color="#10b981" />
            <SummaryCard label="Administradores" value={summary.admins} icon="shield" color="#8b5cf6" />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
          <TabButton active={tab === "users"} onClick={() => setTab("users")}>Usuarios</TabButton>
          <TabButton active={tab === "roles"} onClick={() => setTab("roles")}>Roles y Permisos</TabButton>
        </div>

        {/* Content */}
        {tab === "users" && (
          <UsersTable users={users} isLoading={isLoading} currentUserId={user.id} onEdit={setEditUser} roles={roles} />
        )}
        {tab === "roles" && <RolesPanel roles={roles} onCreateRole={() => setShowCreateRole(true)} onEditRole={setEditRole} />}
      </div>

      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} roles={roles} />}
      {editUser && <EditUserModal user={editUser} onClose={() => setEditUser(null)} currentUserId={user.id} roles={roles} />}
      {showCreateRole && <CreateRoleModal onClose={() => setShowCreateRole(false)} />}
      {editRole && <EditRoleModal role={editRole} onClose={() => setEditRole(null)} />}
      <ToastContainer />
    </Layout>
  );
}

/* ── Summary Card ─────────────────────────────── */

function SummaryCard({ label, value, icon, color }: Readonly<{ label: string; value: number; icon: string; color: string }>) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
        {icon === "users" && (
          <svg className="w-6 h-6" style={{ color }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )}
        {icon === "check" && (
          <svg className="w-6 h-6" style={{ color }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        {icon === "shield" && (
          <svg className="w-6 h-6" style={{ color }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

/* ── Tab Button ───────────────────────────────── */

function TabButton({ active, onClick, children }: Readonly<{ active: boolean; onClick: () => void; children: React.ReactNode }>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-sm rounded-lg font-bold transition-all ${
        active ? "bg-white shadow-sm text-indigo-700" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
      }`}
    >
      {children}
    </button>
  );
}

/* ── Users Table ──────────────────────────────── */

function UsersTable({ users, isLoading, currentUserId, onEdit, roles }: Readonly<{
  users: UserWithStatus[];
  isLoading: boolean;
  currentUserId: string;
  onEdit: (u: UserWithStatus) => void;
  roles: Role[];
}>) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#4f46e5", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="text-left px-5 py-3 font-medium text-gray-600">Usuario</th>
            <th className="text-left px-5 py-3 font-medium text-gray-600">Rol</th>
            <th className="text-left px-5 py-3 font-medium text-gray-600">Estado</th>
            <th className="text-left px-5 py-3 font-medium text-gray-600">Creado</th>
            <th className="text-right px-5 py-3 font-medium text-gray-600">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-inner"
                    style={{ backgroundColor: u.id === currentUserId ? "#06b6d4" : "#4f46e5" }}
                  >
                    {u.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{u.email}</p>
                    <p className="text-xs text-gray-400 font-mono">{u.id.slice(0, 8)}...</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4">
                <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${
                  u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                }`}>
                  {roles.find(r => r.name === u.role)?.display_name ?? u.role.toUpperCase()}
                </span>
              </td>
              <td className="px-5 py-4">
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                  u.is_active ? "text-green-600" : "text-red-500"
                }`}>
                  <span className={`w-2 h-2 rounded-full ${u.is_active ? "bg-green-500" : "bg-red-400"}`} />
                  {u.is_active ? "Activo" : "Inactivo"}
                </span>
              </td>
              <td className="px-5 py-4 text-gray-500">
                {new Date(u.created_at).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
              </td>
              <td className="px-5 py-4 text-right">
                <button
                  type="button"
                  onClick={() => onEdit(u)}
                  className="text-gray-400 hover:text-gray-700 transition p-1"
                  title="Editar usuario"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Roles Panel ──────────────────────────────── */

const PERMISSION_GROUPS: Record<string, { label: string; permissions: string[] }> = {
  projects: { label: "Proyectos", permissions: ["projects.create", "projects.read", "projects.update", "projects.delete"] },
  phases: { label: "Fases", permissions: ["phases.create", "phases.read", "phases.update", "phases.delete"] },
  departments: { label: "Departamentos", permissions: ["departments.create", "departments.read", "departments.update", "departments.delete"] },
  activities: { label: "Actividades", permissions: ["activities.create", "activities.read", "activities.update", "activities.delete", "activities.edit_estimates"] },
  kpi: { label: "KPI", permissions: ["kpi.read"] },
  audit: { label: "Auditoría", permissions: ["audit.read"] },
  data: { label: "Importar/Exportar", permissions: ["csv.import", "csv.export"] },
  webhooks: { label: "Webhooks", permissions: ["webhooks.manage"] },
  admin: { label: "Administración", permissions: ["users.manage", "roles.manage"] },
};

function permissionLabel(p: string): string {
  const map: Record<string, string> = {
    "projects.create": "Crear proyectos", "projects.read": "Ver proyectos", "projects.update": "Editar proyectos", "projects.delete": "Eliminar proyectos",
    "phases.create": "Crear fases", "phases.read": "Ver fases", "phases.update": "Editar fases", "phases.delete": "Eliminar fases",
    "departments.create": "Crear departamentos", "departments.read": "Ver departamentos", "departments.update": "Editar departamentos", "departments.delete": "Eliminar departamentos",
    "activities.create": "Crear actividades", "activities.read": "Ver actividades", "activities.update": "Editar actividades", "activities.delete": "Eliminar actividades", "activities.edit_estimates": "Editar estimados de actividades",
    "kpi.read": "Ver métricas KPI", "audit.read": "Ver auditoría",
    "csv.import": "Importar CSV", "csv.export": "Exportar PDF",
    "webhooks.manage": "Gestionar webhooks",
    "users.manage": "Gestionar usuarios", "roles.manage": "Gestionar roles",
  };
  return map[p] ?? p;
}

function RolesPanel({ roles, onCreateRole, onEditRole }: Readonly<{
  roles: Role[];
  onCreateRole: () => void;
  onEditRole: (r: Role) => void;
}>) {
  const { deleteRole } = useAdminStore();
  const [confirmDelete, setConfirmDelete] = useState<Role | null>(null);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteRole(confirmDelete.id);
      showToast("Rol eliminado", "success");
      setConfirmDelete(null);
    } catch {
      showToast("Error al eliminar rol", "error");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">Gestiona los roles del sistema y sus permisos</p>
        <button
          type="button"
          className="px-4 py-2 rounded-xl text-white text-sm font-bold flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 hover:-translate-y-0.5 active:translate-y-0"
          onClick={onCreateRole}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nuevo Rol
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((role) => (
          <div key={role.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className={`inline-block text-xs px-3 py-1 rounded-full font-bold ${getRoleBadgeClass(role.name)}`}>
                  {role.name.toUpperCase()}
                </span>
                <h3 className="text-lg font-semibold text-gray-900">{role.display_name}</h3>
                {role.is_system && (
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Sistema</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onEditRole(role)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
                  title="Editar rol"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                {!role.is_system && (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(role)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition"
                    title="Eliminar rol"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">{role.description}</p>
            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Permisos ({role.permissions.length})
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {role.permissions.map((p) => (
                <span key={p} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                  {permissionLabel(p)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <Modal open title="Eliminar Rol" onClose={() => setConfirmDelete(null)}>
          <div className="p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Eliminar Rol</h3>
            <p className="text-sm text-gray-600">
              ¿Estás seguro de que deseas eliminar el rol <strong>{confirmDelete.display_name}</strong>?
              Los usuarios asignados a este rol perderán sus permisos.
            </p>
            <div className="flex gap-3 pt-2">
              <button type="button" className="flex-1 px-4 py-2.5 rounded-lg border text-sm hover:bg-gray-50" onClick={() => setConfirmDelete(null)}>
                Cancelar
              </button>
              <button
                type="button"
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700"
                onClick={handleDelete}
              >
                Eliminar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ── Shared modal helpers ─────────────────────── */

function FormError({ message }: Readonly<{ message: string }>) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{message}</div>
  );
}

function ModalActions({ onClose, submitting, idleLabel, loadingLabel }: Readonly<{
  onClose: () => void;
  submitting: boolean;
  idleLabel: string;
  loadingLabel: string;
}>) {
  return (
    <div className="flex gap-3 pt-2">
      <button type="button" className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors" onClick={onClose}>
        Cancelar
      </button>
      <button
        type="submit"
        disabled={submitting}
        className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-60 bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 hover:-translate-y-0.5 active:translate-y-0"
      >
        {submitting ? loadingLabel : idleLabel}
      </button>
    </div>
  );
}

function PermissionsGrid({ selectedPerms, togglePerm, toggleGroup }: Readonly<{
  selectedPerms: string[];
  togglePerm: (p: string) => void;
  toggleGroup: (perms: string[]) => void;
}>) {
  return (
    <div className="space-y-3 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
      {Object.entries(PERMISSION_GROUPS).map(([key, group]) => {
        const allSelected = group.permissions.every(p => selectedPerms.includes(p));
        const someSelected = group.permissions.some(p => selectedPerms.includes(p));
        return (
          <div key={key} className="border-b border-gray-100 pb-2 last:border-0">
            <label className="flex items-center gap-2 cursor-pointer mb-1">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                onChange={() => toggleGroup(group.permissions)}
                className="accent-cyan-500"
              />
              <span className="text-sm font-medium text-gray-800">{group.label}</span>
            </label>
            <div className="ml-6 flex flex-wrap gap-1">
              {group.permissions.map(p => (
                <label key={p} className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPerms.includes(p)}
                    onChange={() => togglePerm(p)}
                    className="accent-cyan-500 w-3 h-3"
                  />
                  <span className="text-xs text-gray-600">{permissionLabel(p)}</span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Create User Modal ────────────────────────── */

function CreateUserModal({ onClose, roles }: Readonly<{ onClose: () => void; roles: Role[] }>) {
  const { createUser } = useAdminStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>("user");
  const [localError, setLocalError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    setSubmitting(true);
    try {
      await createUser({ email, password, role: role as "admin" | "user" });
      showToast("Usuario creado exitosamente", "success");
      onClose();
    } catch (err: any) {
      setLocalError(err?.response?.data?.detail?.message ?? "Error al crear usuario");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open title="Crear Nuevo Usuario" onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <h3 className="text-lg font-bold text-gray-900">Crear Nuevo Usuario</h3>

        {localError && <FormError message={localError} />}

        <div>
          <label htmlFor="new-user-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            id="new-user-email"
            type="email"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="new-user-password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <input
            id="new-user-password"
            type="password"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          <p className="text-xs text-gray-400 mt-1">Mínimo 8 caracteres</p>
        </div>

        <div>
          <label htmlFor="new-user-role" className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
          <select
            id="new-user-role"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            {roles.map(r => (
              <option key={r.name} value={r.name}>{r.display_name}</option>
            ))}
          </select>
        </div>

        <ModalActions onClose={onClose} submitting={submitting} idleLabel="Crear Usuario" loadingLabel="Creando..." />
      </form>
    </Modal>
  );
}

/* ── Edit User Modal ──────────────────────────── */

function EditUserModal({ user: targetUser, onClose, currentUserId, roles }: Readonly<{
  user: UserWithStatus;
  onClose: () => void;
  currentUserId: string;
  roles: Role[];
}>) {
  const { updateUser } = useAdminStore();
  const [role, setRole] = useState(targetUser.role);
  const [isActive, setIsActive] = useState(targetUser.is_active);
  const [newPassword, setNewPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isSelf = targetUser.id === currentUserId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    setSubmitting(true);
    const payload: Record<string, unknown> = {};
    if (role !== targetUser.role) payload.role = role;
    if (isActive !== targetUser.is_active) payload.is_active = isActive;
    if (newPassword.trim()) payload.password = newPassword;

    if (Object.keys(payload).length === 0) {
      onClose();
      return;
    }

    try {
      await updateUser(targetUser.id, payload);
      showToast("Usuario actualizado", "success");
      onClose();
    } catch (err: any) {
      setLocalError(err?.response?.data?.detail?.message ?? "Error al actualizar");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open title="Editar Usuario" onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <h3 className="text-lg font-bold text-gray-900">Editar Usuario</h3>
        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-inner"
            style={{ backgroundColor: "#4f46e5" }}
          >
            {targetUser.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{targetUser.email}</p>
            <p className="text-xs text-gray-400 font-mono">{targetUser.id.slice(0, 12)}...</p>
          </div>
        </div>

        {localError && <FormError message={localError} />}

        <div>
          <label htmlFor="edit-user-role" className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
          <select
            id="edit-user-role"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={isSelf}
          >
            {roles.map(r => (
              <option key={r.name} value={r.name}>{r.display_name}</option>
            ))}
          </select>
          {isSelf && <p className="text-xs text-amber-600 mt-1">No puedes cambiar tu propio rol</p>}
        </div>

        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 mb-2">Estado</legend>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="is_active"
                checked={isActive}
                onChange={() => setIsActive(true)}
                disabled={isSelf}
                className="accent-green-500"
              />
              <span className="text-sm text-gray-700">Activo</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="is_active"
                checked={!isActive}
                onChange={() => setIsActive(false)}
                disabled={isSelf}
                className="accent-red-500"
              />
              <span className="text-sm text-gray-700">Inactivo</span>
            </label>
          </div>
          {isSelf && <p className="text-xs text-amber-600 mt-1">No puedes desactivar tu propia cuenta</p>}
        </fieldset>

        <div>
          <label htmlFor="edit-user-password" className="block text-sm font-medium text-gray-700 mb-1">
            Nueva Contraseña <span className="text-gray-400">(dejar vacío para no cambiar)</span>
          </label>
          <input
            id="edit-user-password"
            type="password"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
            placeholder="••••••••"
          />
        </div>

        <ModalActions onClose={onClose} submitting={submitting} idleLabel="Guardar Cambios" loadingLabel="Guardando..." />
      </form>
    </Modal>
  );
}

/* ── Create Role Modal ────────────────────────── */

function CreateRoleModal({ onClose }: Readonly<{ onClose: () => void }>) {
  const { createRole, availablePermissions } = useAdminStore();
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const { selectedPerms, togglePerm, toggleGroup } = useRolePermissions([]);
  const [localError, setLocalError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    setSubmitting(true);
    try {
      await createRole({ name, display_name: displayName, description: description || undefined, permissions: selectedPerms });
      showToast("Rol creado exitosamente", "success");
      onClose();
    } catch (err: any) {
      setLocalError(err?.response?.data?.detail?.message ?? "Error al crear rol");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open title="Crear Nuevo Rol" onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-gray-900">Crear Nuevo Rol</h3>

        {localError && <FormError message={localError} />}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="role-name" className="block text-sm font-medium text-gray-700 mb-1">Identificador</label>
            <input
              id="role-name"
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
              value={name}
              onChange={(e) => setName(e.target.value.toLowerCase().replaceAll(/[^a-z0-9_]/g, ""))}
              placeholder="gerente_proyecto"
              required
              pattern="^[a-z][a-z0-9_]*$"
            />
            <p className="text-xs text-gray-400 mt-1">Solo letras minúsculas, números y guión bajo</p>
          </div>
          <div>
            <label htmlFor="role-display" className="block text-sm font-medium text-gray-700 mb-1">Nombre visible</label>
            <input
              id="role-display"
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Gerente de Proyecto"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="role-desc" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            id="role-desc"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción del rol..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Permisos ({selectedPerms.length} / {availablePermissions.length})
          </label>
          <PermissionsGrid selectedPerms={selectedPerms} togglePerm={togglePerm} toggleGroup={toggleGroup} />
        </div>

        <ModalActions onClose={onClose} submitting={submitting} idleLabel="Crear Rol" loadingLabel="Creando..." />
      </form>
    </Modal>
  );
}

/* ── Edit Role Modal ──────────────────────────── */

function EditRoleModal({ role, onClose }: Readonly<{ role: Role; onClose: () => void }>) {
  const { updateRole, availablePermissions } = useAdminStore();
  const [displayName, setDisplayName] = useState(role.display_name);
  const [description, setDescription] = useState(role.description ?? "");
  const { selectedPerms, togglePerm, toggleGroup } = useRolePermissions(role.permissions);
  const [localError, setLocalError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    setSubmitting(true);
    try {
      await updateRole(role.id, { display_name: displayName, description, permissions: selectedPerms });
      showToast("Rol actualizado", "success");
      onClose();
    } catch (err: any) {
      setLocalError(err?.response?.data?.detail?.message ?? "Error al actualizar rol");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open title="Editar Rol" onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-gray-900">Editar Rol</h3>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${getRoleBadgeClass(role.name)}`}>
            {role.name.toUpperCase()}
          </span>
          {role.is_system && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Sistema</span>}
        </div>

        {localError && <FormError message={localError} />}

        <div>
          <label htmlFor="edit-role-display" className="block text-sm font-medium text-gray-700 mb-1">Nombre visible</label>
          <input
            id="edit-role-display"
            type="text"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="edit-role-desc" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            id="edit-role-desc"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Permisos ({selectedPerms.length} / {availablePermissions.length})
          </label>
          <PermissionsGrid selectedPerms={selectedPerms} togglePerm={togglePerm} toggleGroup={toggleGroup} />
        </div>

        <ModalActions onClose={onClose} submitting={submitting} idleLabel="Guardar Cambios" loadingLabel="Guardando..." />
      </form>
    </Modal>
  );
}
