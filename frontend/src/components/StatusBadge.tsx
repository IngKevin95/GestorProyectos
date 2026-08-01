/* Status badge for project states and KPI status indicators. */
import type { KPIStatus, ProjectState } from "../types";

const STATE_STYLES: Record<ProjectState, string> = {
  PLANNING: "bg-blue-100 text-blue-700",
  ACTIVE: "bg-green-100 text-green-700",
  PAUSED: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-gray-200 text-gray-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const KPI_STYLES: Record<KPIStatus, string> = {
  green: "bg-emerald-100 text-emerald-700",
  yellow: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
  neutral: "bg-gray-100 text-gray-500",
};

interface StateBadgeProps {
  state: ProjectState;
}

export function StateBadge({ state }: Readonly<StateBadgeProps>) {
  return (
    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATE_STYLES[state]}`}>
      {state}
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
    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${KPI_STYLES[status]}`}>
      {label}: {value === null ? "N/A" : value.toFixed(2)}
    </span>
  );
}

/* Health badge for project health status (EP-002, EP-003) */
interface HealthBadgeProps {
  health_status: "ok" | "blocked" | "at_risk" | "no_next_step";
}

const HEALTH_STYLES: Record<string, { bg: string; text: string; icon: string; label: string }> = {
  ok: {
    bg: "bg-green-100",
    text: "text-green-700",
    icon: "✓",
    label: "Saludable",
  },
  blocked: {
    bg: "bg-red-100",
    text: "text-red-700",
    icon: "🚫",
    label: "Bloqueado",
  },
  at_risk: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    icon: "⚠️",
    label: "En Riesgo",
  },
  no_next_step: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    icon: "→",
    label: "Sin Siguiente Paso",
  },
};

export function HealthBadge({ health_status }: Readonly<HealthBadgeProps>) {
  const style = HEALTH_STYLES[health_status] || HEALTH_STYLES.ok;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border ${style.bg} ${style.text} border-current/10`}
      title={style.label}
    >
      <span>{style.icon}</span>
      <span>{style.label}</span>
    </span>
  );
}
