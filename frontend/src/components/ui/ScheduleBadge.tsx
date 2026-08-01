import type { KPIStatus } from "../../types";

const STATUS_STYLES: Record<KPIStatus, string> = {
  green: "bg-emerald-50 text-emerald-700",
  yellow: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  neutral: "bg-gray-100 text-gray-500",
};

const DOT_STYLES: Record<KPIStatus, string> = {
  green: "bg-emerald-500",
  yellow: "bg-amber-500",
  red: "bg-red-500",
  neutral: "bg-gray-400",
};

interface ScheduleBadgeProps {
  status: KPIStatus;
  label: string;
}

export function ScheduleBadge({ status, label }: Readonly<ScheduleBadgeProps>) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${DOT_STYLES[status]}`} />
      {label}
    </span>
  );
}
