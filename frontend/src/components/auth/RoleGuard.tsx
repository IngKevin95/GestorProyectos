/**
 * RoleGuard — Renders children only when user has the required role.
 */
import { useAuthStore } from "../../store/authStore";

interface RoleGuardProps {
  readonly children: React.ReactNode;
  /** Roles allowed. If empty/undefined, any authenticated user passes. */
  readonly allowed?: string[];
  /** Rendered when user doesn't have the required role. */
  readonly fallback?: React.ReactNode;
}

export function RoleGuard({ children, allowed, fallback = null }: RoleGuardProps) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <>{fallback}</>;
  if (allowed && allowed.length > 0 && !allowed.includes(user.role)) return <>{fallback}</>;
  return <>{children}</>;
}
