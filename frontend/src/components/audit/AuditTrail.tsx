/**
 * AuditTrail — Enhanced audit log with search, user display, and expanded details.
 */
import { useEffect, useState } from "react";
import { useAuditStore } from "../../store/auditStore";

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-green-100 text-green-700",
  UPDATE: "bg-blue-100 text-blue-700",
  DELETE: "bg-red-100 text-red-700",
};

const ACTION_ICONS: Record<string, string> = {
  CREATE: "M12 6v6m0 0v6m0-6h6m-6 0H6",
  UPDATE: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  DELETE: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
};

const ENTITY_TYPES = ["ALL", "PROJECT", "PHASE", "DEPARTMENT", "ACTIVITY", "USER"] as const;

const ENTITY_ICONS: Record<string, string> = {
  PROJECT: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  PHASE: "M4 6h16M4 10h16M4 14h16M4 18h16",
  DEPARTMENT: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  ACTIVITY: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  USER: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
};

function getActionDotClass(action: string): string {
  if (action === "CREATE") return "bg-green-500";
  if (action === "DELETE") return "bg-red-500";
  return "bg-blue-500";
}

function getActionLabel(action: string): string {
  if (action === "CREATE") return "CREADO";
  if (action === "UPDATE") return "ACTUALIZADO";
  return "ELIMINADO";
}

export function AuditTrail({ projectId }: Readonly<{ projectId: string }>) {
  const { entries, isLoading, error, loadAudit } = useAuditStore();
  const [entityFilter, setEntityFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const filter = entityFilter === "ALL" ? undefined : entityFilter;
    loadAudit(projectId, filter);
  }, [projectId, entityFilter, loadAudit]);

  const filtered = entries.filter((entry) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      entry.entity_type.toLowerCase().includes(q) ||
      entry.action.toLowerCase().includes(q) ||
      entry.entity_id.toLowerCase().includes(q) ||
      entry.changed_by.toLowerCase().includes(q) ||
      JSON.stringify(entry.new_value ?? {}).toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-gray-600">Filtrar:</span>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {ENTITY_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setEntityFilter(type)}
              className={`px-3 py-1.5 text-xs rounded-md font-medium transition ${
                entityFilter === type
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {type === "ALL" ? "Todos" : type.charAt(0) + type.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative ml-auto">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar en auditoría..."
            className="pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 w-56"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Stats bar */}
      {!isLoading && entries.length > 0 && (
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>{filtered.length} de {entries.length} registros</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" /> {entries.filter(e => e.action === "CREATE").length} creaciones
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> {entries.filter(e => e.action === "UPDATE").length} actualizaciones
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" /> {entries.filter(e => e.action === "DELETE").length} eliminaciones
          </span>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#172E73", borderTopColor: "transparent" }} />
        </div>
      )}

      {/* Error */}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Empty */}
      {!isLoading && !error && filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="font-medium">No se encontraron registros</p>
          <p className="text-sm mt-1">{search ? "Intenta con otros términos de búsqueda" : "Los cambios aparecerán aquí cuando se realicen."}</p>
        </div>
      )}

      {/* Timeline */}
      {!isLoading && filtered.length > 0 && (
        <div className="relative">
          <div className="absolute left-4 top-2 bottom-2 w-px bg-gray-200" />

          <ul className="space-y-3">
            {filtered.map((entry) => {
              const isExpanded = expandedId === entry.id;
              return (
                <li key={entry.id} className="relative pl-10">
                  {/* Dot with action icon */}
                  <div className={`absolute left-1.5 top-3 w-5 h-5 rounded-full flex items-center justify-center ${getActionDotClass(entry.action)}`}>
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={ACTION_ICONS[entry.action] ?? ""} />
                    </svg>
                  </div>

                  <button
                    type="button"
                    className="w-full text-left bg-white border border-gray-100 rounded-lg p-4 shadow-sm hover:shadow transition hover:border-gray-200"
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                  >
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ACTION_COLORS[entry.action] ?? "bg-gray-100 text-gray-600"}`}>
                        {getActionLabel(entry.action)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={ENTITY_ICONS[entry.entity_type.toUpperCase()] ?? ENTITY_ICONS.PROJECT} />
                        </svg>
                        {entry.entity_type}
                      </span>
                      <span className="text-xs text-gray-400 ml-auto flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(entry.changed_at).toLocaleString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <p className="text-sm text-gray-700">
                      <span className="inline-flex items-center gap-1 text-gray-500">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-mono text-xs">{entry.changed_by.slice(0, 8)}...</span>
                      </span>
                      {" "}
                      {entry.action === "CREATE" && "creó"}
                      {entry.action === "UPDATE" && "actualizó"}
                      {entry.action === "DELETE" && "eliminó"}
                      {" "}
                      <span className="font-mono text-xs text-gray-500">{entry.entity_type.toLowerCase()} #{entry.entity_id.slice(0, 8)}</span>
                    </p>

                    {/* Preview of changes (collapsed) */}
                    {!isExpanded && entry.action === "UPDATE" && entry.old_value && entry.new_value && (
                      <div className="mt-1.5">
                        <ChangedFieldsPreview oldValue={entry.old_value} newValue={entry.new_value} />
                      </div>
                    )}

                    {/* Expand indicator */}
                    <div className="flex items-center justify-center mt-2">
                      <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="ml-0 mt-1 bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <DetailField label="ID Registro" value={entry.id} mono />
                        <DetailField label="ID Entidad" value={entry.entity_id} mono />
                        <DetailField label="Tipo" value={entry.entity_type} />
                        <DetailField label="Acción" value={entry.action} />
                        <DetailField label="Usuario" value={entry.changed_by} mono />
                        <DetailField label="Fecha" value={new Date(entry.changed_at).toLocaleString("es-CO")} />
                      </div>

                      {entry.action === "UPDATE" && entry.old_value && entry.new_value && (
                        <div>
                          <h5 className="font-semibold text-gray-700 mb-2">Cambios Detallados</h5>
                          <ChangedFieldsDetailed oldValue={entry.old_value} newValue={entry.new_value} />
                        </div>
                      )}

                      {entry.action === "CREATE" && entry.new_value && (
                        <div>
                          <h5 className="font-semibold text-gray-700 mb-2">Valores Iniciales</h5>
                          <JsonPreview data={entry.new_value} />
                        </div>
                      )}

                      {entry.action === "DELETE" && entry.old_value && (
                        <div>
                          <h5 className="font-semibold text-gray-700 mb-2">Valores al Eliminar</h5>
                          <JsonPreview data={entry.old_value} />
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ── Helpers ───────────────────────────────────── */

function DetailField({ label, value, mono }: Readonly<{ label: string; value: string; mono?: boolean }>) {
  return (
    <div>
      <span className="text-gray-500 block mb-0.5">{label}</span>
      <span className={`text-gray-900 ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

function ChangedFieldsPreview({ oldValue, newValue }: Readonly<{ oldValue: Record<string, unknown>; newValue: Record<string, unknown> }>) {
  const allKeys = [...new Set([...Object.keys(oldValue), ...Object.keys(newValue)])];
  const changed = allKeys.filter((k) => JSON.stringify(oldValue[k]) !== JSON.stringify(newValue[k]));
  if (changed.length === 0) return null;

  return (
    <span className="text-xs text-gray-500">
      Campos: {changed.map((k) => (
        <span key={k} className="inline-block bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded mr-1 font-medium">{k}</span>
      ))}
    </span>
  );
}

function ChangedFieldsDetailed({ oldValue, newValue }: Readonly<{ oldValue: Record<string, unknown>; newValue: Record<string, unknown> }>) {
  const allKeys = [...new Set([...Object.keys(oldValue), ...Object.keys(newValue)])];
  const changed = allKeys.filter((k) => JSON.stringify(oldValue[k]) !== JSON.stringify(newValue[k]));
  if (changed.length === 0) return <span className="text-gray-400">Sin cambios visibles</span>;

  return (
    <div className="space-y-2">
      {changed.map((key) => (
        <div key={key} className="flex items-start gap-2 bg-white rounded-md p-2 border border-gray-100">
          <span className="font-medium text-gray-700 min-w-[80px]">{key}</span>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded line-through">{formatValue(oldValue[key])}</span>
            <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded font-medium">{formatValue(newValue[key])}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function JsonPreview({ data }: Readonly<{ data: Record<string, unknown> }>) {
  const meaningful = Object.entries(data).filter(([k]) => !["id", "version"].includes(k));
  if (meaningful.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-1 bg-white rounded-md p-2 border border-gray-100">
      {meaningful.map(([k, v]) => (
        <div key={k} className="flex items-center gap-2">
          <span className="text-gray-500">{k}:</span>
          <span className="text-gray-900 font-medium">{formatValue(v)}</span>
        </div>
      ))}
    </div>
  );
}

function formatValue(v: unknown): string {
  if (v == null) return "\u2014";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return JSON.stringify(v) ?? "\u2014";
}
