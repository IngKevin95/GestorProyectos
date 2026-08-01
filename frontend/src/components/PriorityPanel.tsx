/**
 * PriorityPanel — Panel explicativo de la fórmula de priorización (EP-003)
 *
 * Muestra de manera transparente cómo se calcula el score de priorización
 * según la estrategia seleccionada.
 */

interface PriorityPanelProps {
  strategy: "relative" | "absolute" | "mixed";
  priority_constant?: number;
  business_value?: number;
  health_status?: "ok" | "blocked" | "at_risk" | "no_next_step";
  score?: number;
}

export function PriorityPanel({
  strategy,
  priority_constant = 0,
  business_value = 0,
  health_status = "ok",
  score = 0,
}: Readonly<PriorityPanelProps>) {
  const getHealthScore = (status: string): number => {
    const mapping: Record<string, number> = {
      blocked: 1.0,
      at_risk: 0.5,
      no_next_step: 0.2,
      ok: 0.0,
    };
    return mapping[status] ?? 0.0;
  };

  return (
    <div className="bg-indigo-50/50 border border-indigo-200/30 rounded-2xl p-5">
      <h3 className="text-sm font-bold text-slate-900 mb-4">Criterio de Priorización</h3>

      {strategy === "absolute" && (
        <div className="space-y-3">
          <p className="text-xs text-slate-600 font-medium">
            <span className="text-indigo-600 font-bold">Estrategia Absoluta</span>
            <br />
            Score = Constante Fija
          </p>
          <div className="bg-white rounded-lg p-3 border border-indigo-100">
            <p className="text-xs text-slate-500 mb-1">Score Actual</p>
            <p className="text-lg font-black text-indigo-600">{score.toFixed(2)}</p>
            <p className="text-xs text-slate-400 mt-1">Valor constante: {priority_constant.toFixed(2)}</p>
          </div>
        </div>
      )}

      {(strategy === "relative" || strategy === "mixed") && (
        <div className="space-y-3">
          <p className="text-xs text-slate-600 font-medium mb-4">
            <span className="text-indigo-600 font-bold">
              Estrategia {strategy === "relative" ? "Relativa" : "Mixta"} (Default)
            </span>
            <br />
            Score = 0.3×Salud + 0.25×Urgencia + 0.25×Valor + 0.2×Críticas
          </p>

          {/* Componentes del score */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white rounded-lg p-2.5 border border-indigo-100">
              <p className="text-xs text-slate-500 font-medium">Salud (30%)</p>
              <p className="text-sm font-bold text-indigo-600">
                {getHealthScore(health_status ?? "ok").toFixed(2)}
              </p>
              <p className="text-xs text-slate-400">
                {health_status === "ok" && "Saludable"}
                {health_status === "blocked" && "Bloqueado"}
                {health_status === "at_risk" && "En Riesgo"}
                {health_status === "no_next_step" && "Sin Siguiente Paso"}
              </p>
            </div>

            <div className="bg-white rounded-lg p-2.5 border border-indigo-100">
              <p className="text-xs text-slate-500 font-medium">Valor (25%)</p>
              <p className="text-sm font-bold text-indigo-600">
                {(Math.min(10, Math.max(0, business_value ?? 0)) / 10).toFixed(2)}
              </p>
              <p className="text-xs text-slate-400">De {business_value?.toFixed(1) ?? "0"}/10</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-indigo-100">
            <p className="text-xs text-slate-500 font-medium mb-2">Score Final</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-indigo-600">{score.toFixed(3)}</p>
              <p className="text-xs text-slate-400">
                Mayor score = Mayor prioridad
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-500 px-3 py-2.5 bg-slate-50 rounded-lg border border-slate-200/50">
            💡 <span className="font-medium">Urgencia</span> se calcula desde la fecha límite. <span className="font-medium">Críticas</span> (20%) se activa si hay tareas críticas pendientes.
          </p>
        </div>
      )}
    </div>
  );
}
