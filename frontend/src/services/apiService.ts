/* API service — all backend endpoints centralised. */
import api from "./api";
import type {
  Project,
  Phase,
  Department,
  Activity,
  KPIIndicators,
  AuditLogEntry,
  Webhook,
  PaginationMeta,
  CSVImportResult,
  UserWithStatus,
  UserCreate,
  UserUpdate,
  UsersSummary,
  Role,
  RoleCreate,
  RoleUpdate,
  SystemSettings,
  ProjectTemplate,
  TemplateCreate,
  Profile,
  ProfileCreate,
  ProfileUpdate,
} from "../types";

/* ── Projects ────────────────────────────────────── */

export async function getProjects(limit = 50, cursor?: string) {
  const params: Record<string, string | number> = { limit };
  if (cursor) params.cursor = cursor;
  const { data } = await api.get<{ data: Project[]; pagination: PaginationMeta }>("/projects", { params });
  return data;
}

export async function getProject(id: string) {
  const { data } = await api.get<{ project: Project; kpi: KPIIndicators }>(`/projects/${id}`);
  return data;
}

export async function createProject(payload: { name: string; bac: number }) {
  const { data } = await api.post<Project>("/projects", payload);
  return data;
}

export async function updateProject(id: string, payload: { name?: string; bac?: number; state?: string; version: number }) {
  const { data } = await api.put<Project>(`/projects/${id}`, payload);
  return data;
}

export async function deleteProject(id: string) {
  await api.delete(`/projects/${id}`);
}

export async function getProjectKPI(id: string, asOf?: string) {
  const params: Record<string, string> = {};
  if (asOf) params.as_of = asOf;
  const { data } = await api.get<KPIIndicators>(`/projects/${id}/kpi`, { params });
  return data;
}

/* ── Phases ───────────────────────────────────────── */

export async function getPhases(projectId: string) {
  const { data } = await api.get<Phase[]>(`/projects/${projectId}/phases`);
  return data;
}

export async function createPhase(projectId: string, payload: { name: string; bac: number }) {
  const { data } = await api.post<Phase>(`/projects/${projectId}/phases`, payload);
  return data;
}

export async function updatePhase(projectId: string, phaseId: string, payload: { name?: string; bac?: number; version: number }) {
  const { data } = await api.put<Phase>(`/projects/${projectId}/phases/${phaseId}`, payload);
  return data;
}

export async function deletePhase(projectId: string, phaseId: string) {
  await api.delete(`/projects/${projectId}/phases/${phaseId}`);
}

export async function getPhaseKPI(projectId: string, phaseId: string) {
  const { data } = await api.get<KPIIndicators>(`/projects/${projectId}/phases/${phaseId}/kpi`);
  return data;
}

/* ── Departments ──────────────────────────────────── */

function deptBase(projectId: string, phaseId: string) {
  return `/projects/${projectId}/phases/${phaseId}/departments`;
}

export async function getDepartments(projectId: string, phaseId: string) {
  const { data } = await api.get<Department[]>(deptBase(projectId, phaseId));
  return data;
}

export async function createDepartment(projectId: string, phaseId: string, payload: { name: string; bac: number }) {
  const { data } = await api.post<Department>(deptBase(projectId, phaseId), payload);
  return data;
}

export async function updateDepartment(
  projectId: string, phaseId: string, deptId: string,
  payload: { name?: string; bac?: number; version: number },
) {
  const { data } = await api.put<Department>(`${deptBase(projectId, phaseId)}/${deptId}`, payload);
  return data;
}

export async function deleteDepartment(projectId: string, phaseId: string, deptId: string) {
  await api.delete(`${deptBase(projectId, phaseId)}/${deptId}`);
}

export async function getDepartmentKPI(projectId: string, phaseId: string, deptId: string) {
  const { data } = await api.get<KPIIndicators>(`${deptBase(projectId, phaseId)}/${deptId}/kpi`);
  return data;
}

/* ── Activities ───────────────────────────────────── */

function actBase(projectId: string, phaseId: string, deptId: string) {
  return `${deptBase(projectId, phaseId)}/${deptId}/activities`;
}

export async function getActivities(projectId: string, phaseId: string, deptId: string) {
  const { data } = await api.get<Activity[]>(actBase(projectId, phaseId, deptId));
  return data;
}

export async function createActivity(
  projectId: string, phaseId: string, deptId: string,
  payload: { name: string; bac: number; profile_id?: string; estimated_hours?: number; start_date?: string; end_date?: string; percentage_completed: number; actual_cost?: number },
) {
  const { data } = await api.post<Activity>(actBase(projectId, phaseId, deptId), payload);
  return data;
}

export async function updateActivity(
  projectId: string, phaseId: string, deptId: string, actId: string,
  payload: { name?: string; bac?: number; profile_id?: string; estimated_hours?: number; start_date?: string; end_date?: string; percentage_completed?: number; actual_cost?: number; version: number },
) {
  const { data } = await api.put<{ activity: Activity; kpi: KPIIndicators }>(
    `${actBase(projectId, phaseId, deptId)}/${actId}`, payload,
  );
  return data;
}

export async function deleteActivity(projectId: string, phaseId: string, deptId: string, actId: string) {
  await api.delete(`${actBase(projectId, phaseId, deptId)}/${actId}`);
}

export async function getActivityLogs(projectId: string, phaseId: string, deptId: string, actId: string) {
  const { data } = await api.get<import("../types").ActivityLog[]>(`${actBase(projectId, phaseId, deptId)}/${actId}/logs`);
  return data;
}

export async function createActivityLog(
  projectId: string, phaseId: string, deptId: string, actId: string,
  payload: import("../types").ActivityLogCreate,
) {
  const { data } = await api.post<import("../types").ActivityLog>(
    `${actBase(projectId, phaseId, deptId)}/${actId}/logs`, payload,
  );
  return data;
}

export async function deleteActivityLog(
  projectId: string, phaseId: string, deptId: string, actId: string, logId: string,
) {
  await api.delete(`${actBase(projectId, phaseId, deptId)}/${actId}/logs/${logId}`);
}

/* ── Audit ────────────────────────────────────────── */

export async function getAuditLog(projectId: string, entityType?: string, limit = 50) {
  const params: Record<string, string | number> = { limit };
  if (entityType) params.entity_type = entityType;
  const { data } = await api.get<AuditLogEntry[]>(`/projects/${projectId}/audit`, { params });
  return data;
}

/* ── CSV Import / Export ──────────────────────────── */

export async function importCSV(projectId: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<CSVImportResult>(`/projects/${projectId}/import`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function exportPDF(projectId: string) {
  const { data } = await api.get(`/projects/${projectId}/export/pdf`, { responseType: "blob" });
  return data as Blob;
}

/* ── Webhooks ─────────────────────────────────────── */

export async function getWebhooks(projectId: string) {
  const { data } = await api.get<Webhook[]>("/webhooks", { params: { project_id: projectId } });
  return data;
}

export async function createWebhook(payload: { project_id: string; url: string; secret: string; cpi_threshold?: number; spi_threshold?: number }) {
  const { data } = await api.post<Webhook>("/webhooks", payload);
  return data;
}

export async function deleteWebhook(id: string) {
  await api.delete(`/webhooks/${id}`);
}

/* ── Auth ─────────────────────────────────────────── */

export async function getMe() {
  const { data } = await api.get<{ id: string; email: string; role: string; created_at: string }>("/auth/me");
  return data;
}

/* ── Users (Admin) ────────────────────────────────── */

export async function getUsers() {
  const { data } = await api.get<UserWithStatus[]>("/users");
  return data;
}

export async function getUser(id: string) {
  const { data } = await api.get<UserWithStatus>(`/users/${id}`);
  return data;
}

export async function createUser(payload: UserCreate) {
  const { data } = await api.post<UserWithStatus>("/users", payload);
  return data;
}

export async function updateUser(id: string, payload: UserUpdate) {
  const { data } = await api.put<UserWithStatus>(`/users/${id}`, payload);
  return data;
}

export async function getUsersSummary() {
  const { data } = await api.get<UsersSummary>("/users/stats/summary");
  return data;
}

/* ── Roles ───────────────────────────────────────── */

export async function getRoles() {
  const { data } = await api.get<Role[]>("/roles");
  return data;
}

export async function getAvailablePermissions() {
  const { data } = await api.get<string[]>("/roles/permissions");
  return data;
}

export async function createRole(payload: RoleCreate) {
  const { data } = await api.post<Role>("/roles", payload);
  return data;
}

export async function updateRole(id: string, payload: RoleUpdate) {
  const { data } = await api.put<Role>(`/roles/${id}`, payload);
  return data;
}

export async function deleteRole(id: string) {
  await api.delete(`/roles/${id}`);
}

/* ── Profiles ──────────────────────────────────── */

export async function getProfiles(includeInactive = false) {
  const params: Record<string, string> = {};
  if (includeInactive) params.include_inactive = "true";
  const { data } = await api.get<Profile[]>("/profiles", { params });
  return data;
}

export async function getProfile(id: string) {
  const { data } = await api.get<Profile>(`/profiles/${id}`);
  return data;
}

export async function createProfile(payload: ProfileCreate) {
  const { data } = await api.post<Profile>("/profiles", payload);
  return data;
}

export async function updateProfile(id: string, payload: ProfileUpdate) {
  const { data } = await api.put<Profile>(`/profiles/${id}`, payload);
  return data;
}

export async function deleteProfile(id: string) {
  await api.delete(`/profiles/${id}`);
}

/* ────────── System Settings ────────── */

export async function getSettings(): Promise<SystemSettings> {
  const { data } = await api.get<SystemSettings>("/settings");
  return data;
}

export async function updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
  const { data } = await api.put<SystemSettings>("/settings", { settings });
  return data;
}

/* ────────── Project Templates ────────── */

export async function getTemplates(): Promise<ProjectTemplate[]> {
  const { data } = await api.get<ProjectTemplate[]>("/templates");
  return data;
}

export async function createTemplate(body: TemplateCreate): Promise<ProjectTemplate> {
  const { data } = await api.post<ProjectTemplate>("/templates", body);
  return data;
}

export async function deleteTemplate(id: string): Promise<void> {
  await api.delete(`/templates/${id}`);
}
