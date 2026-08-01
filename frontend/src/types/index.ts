/* Domain types — single source of truth for the frontend. */

export type ProjectState = "PLANNING" | "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";

export interface User {
  id: string;
  email: string;
  role: string;
  permissions: string[];
  created_at: string;
}

export interface Project {
  // EP-003 fields (existing)
  id: string;
  name?: string;
  bac?: number;
  state?: ProjectState;
  health_status?: string;
  priority_strategy?: string;
  priority_constant?: number;
  business_value?: number;
  score?: number | null;
  user_id?: string;
  version?: number;

  // EP-001 fields (new CRUD) — match backend snake_case
  responsable?: string;
  estado?: string;
  prioridad?: string;
  fecha_límite?: string;
  siguiente_paso?: string;
  bloqueos?: string;
  notas?: string;
  tipo_proyecto?: string;

  // Timestamps (both)
  created_at: string;
  updated_at: string;
}

export interface Phase {
  id: string;
  project_id: string;
  name: string;
  bac: number;
  version: number;
  created_at: string;
}

export interface Department {
  id: string;
  phase_id: string;
  name: string;
  bac: number;
  version: number;
  created_at: string;
}

export interface Activity {
  id: string;
  department_id: string;
  name: string;
  bac: number;
  profile_id?: string;
  estimated_hours?: number;
  profile_name?: string;
  hourly_rate?: number;
  start_date?: string | null;
  end_date?: string | null;
  percentage_planned: number;
  percentage_completed: number;
  actual_cost: number;
  version: number;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  activity_id: string;
  logged_date: string;
  hours_worked: number;
  percentage_completed: number;
  notes: string | null;
  profile_id: string | null;
  profile_name: string | null;
  hourly_rate: number | null;
  actual_cost_entry: number | null;
  created_by: string;
  created_at: string;
}

export interface ActivityLogCreate {
  logged_date: string;
  hours_worked: number;
  percentage_completed: number;
  notes?: string;
  profile_id?: string;
}

export type KPIStatus = "green" | "yellow" | "red" | "neutral";

export interface KPIIndicators {
  pv: number;
  ev: number;
  ac: number;
  bac: number;
  cv: number | null;
  sv: number | null;
  cpi: number | null;
  spi: number | null;
  eac: number | null;
  vac: number | null;
  cpi_status: KPIStatus;
  spi_status: KPIStatus;
  ac_status: KPIStatus;
  as_of?: string;
}

export interface AuditLogEntry {
  id: string;
  entity_type: string;
  entity_id: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  changed_by: string;
  changed_at: string;
}

export interface Webhook {
  id: string;
  project_id: string;
  url: string;
  cpi_threshold: number;
  spi_threshold: number;
  is_active: boolean;
  created_at: string;
}

export interface PaginationMeta {
  limit: number;
  cursor?: string;
  has_more: boolean;
  total?: number;
}

export interface CSVImportResult {
  imported_count: number;
  skipped_count: number;
  errors: Array<{ row: number; field: string; error: string }>;
  project_id: string;
}

export interface UserWithStatus extends User {
  is_active: boolean;
  updated_at: string;
}

export interface UserCreate {
  email: string;
  password: string;
  role: "admin" | "user";
}

export interface UserUpdate {
  role?: "admin" | "user";
  is_active?: boolean;
  password?: string;
}

export interface UsersSummary {
  total: number;
  active: number;
  admins: number;
}

/* ── Roles ──────────────────────────────────────── */

export interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  permissions: string[];
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoleCreate {
  name: string;
  display_name: string;
  description?: string;
  permissions: string[];
}

export interface RoleUpdate {
  display_name?: string;
  description?: string;
  permissions?: string[];
}

/* ── Profiles ───────────────────────────────────── */

export interface Profile {
  id: string;
  name: string;
  hourly_rate: number;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface ProfileCreate {
  name: string;
  hourly_rate: number;
}

export interface ProfileUpdate {
  name?: string;
  hourly_rate?: number;
  is_active?: boolean;
  version: number;
}

/* ── System Settings ────────────────────────────── */

export interface SystemSettings {
  country: string;
  currency: string;
  currency_symbol: string;
  currency_decimals: string;
  language: string;
  timezone: string;
  date_format: string;
  thousand_separator: string;
  decimal_separator: string;
}

/* ── Project Templates ──────────────────────────── */

export interface TemplateDepartment {
  name: string;
  bac_percent: number;
}

export interface TemplatePhase {
  name: string;
  bac_percent: number;
  departments: TemplateDepartment[];
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string | null;
  structure: TemplatePhase[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TemplateCreate {
  name: string;
  description?: string;
  structure: TemplatePhase[];
}

/* Valid state transitions map */
export const VALID_TRANSITIONS: Record<ProjectState, ProjectState[]> = {
  PLANNING: ["ACTIVE", "CANCELLED"],
  ACTIVE: ["PAUSED", "COMPLETED", "CANCELLED"],
  PAUSED: ["ACTIVE", "COMPLETED", "CANCELLED"],
  COMPLETED: ["PLANNING"],
  CANCELLED: ["PLANNING"],
};
