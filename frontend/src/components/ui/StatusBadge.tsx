/* Status badge for project states and KPI status indicators. */
import type { ProjectState, KPIStatus } from "../../types";

/* ── State labels in Spanish ───────────────────── */
const STATE_LABELS: Record<ProjectState, string> = {
  PLANNING:  "Planificación",
  ACTIVE:    "Activo",
  PAUSED:    "Pausado",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
};

const STATE_STYLES: Record<ProjectState, string> = {
  PLANNING:  "bg-blue-50 text-blue-700 border border-blue-200",
  ACTIVE:    "bg-emerald-50 text-emerald-700 border border-emerald-200",
  PAUSED:    "bg-amber-50 text-amber-700 border border-amber-200",
  COMPLETED: "bg-slate-100 text-slate-600 border border-slate-200",
  CANCELLED: "bg-red-50 text-red-600 border border-red-200",
};

const KPI_STYLES: Record<KPIStatus, string> = {
  green:   "bg-emerald-50 text-emerald-700 border border-emerald-200",
  yellow:  "bg-amber-50 text-amber-700 border border-amber-200",
  red:     "bg-red-50 text-red-600 border border-red-200",
  neutral: "bg-slate-100 text-slate-500 border border-slate-200",
};

interface StateBadgeProps {
  state: ProjectState;
}

export function StateBadge({ state }: Readonly<StateBadgeProps>) {
  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-md ${STATE_STYLES[state] ?? "bg-slate-100 text-slate-500 border border-slate-200"}`}
    >
      {STATE_LABELS[state] ?? state}
    </span>
  );
}

interface KPIBadgeProps {
  status: KPIStatus;
  label: string;
  value: number | null;
}

export function KPIBadge({ status, label, value }: Readonly<KPIBadgeProps>) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-md ${KPI_STYLES[status]}`}>
      {label}: {value === null ? "N/A" : value.toFixed(2)}
    </span>
  );
}
