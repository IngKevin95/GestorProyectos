export interface ErrorContext {
  userId?: string;
  projectId?: string;
  endpoint?: string;
  [key: string]: unknown;
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'response' in error) {
    const err = error as { response?: { data?: { detail?: { message?: string } | string } } };
    const detail = err.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (detail?.message) return detail.message;
  }
  return "Ocurrió un error inesperado";
}

export function handleError(
  error: unknown,
  context: ErrorContext = {},
  userMessage?: string
) {
  const message = userMessage || extractErrorMessage(error);

  // Log para desarrollo
  console.error('[ERROR]', {
    message,
    error,
    context,
    timestamp: new Date().toISOString(),
  });

  // TODO: Enviar a servicio de monitoreo (ej. Sentry) en producción

  // TODO: Integrar con sistema de notificaciones/toast real de la app si lo hay
  // showToast(message, 'error');
  alert(`Error: ${message}`); // Placeholder fallback
}
