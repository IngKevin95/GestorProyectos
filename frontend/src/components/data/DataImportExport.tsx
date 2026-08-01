/**
 * DataImportExport — CSV import and PDF export for a project.
 */
import { useRef, useState } from "react";
import * as svc from "../../services/apiService";
import { showToast } from "../ui";
import type { CSVImportResult } from "../../types";

export function DataImportExport({ projectId, onImported }: Readonly<{ projectId: string; onImported?: () => void }>) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [result, setResult] = useState<CSVImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      showToast("Please select a .csv file", "error");
      return;
    }
    setImporting(true);
    setResult(null);
    try {
      const res = await svc.importCSV(projectId, file);
      setResult(res);
      showToast(`Imported ${res.imported_count} records`, "success");
      onImported?.();
    } catch {
      showToast("CSV import failed", "error");
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await svc.exportPDF(projectId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `project-${projectId}-report.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast("PDF downloaded", "success");
    } catch {
      showToast("PDF export failed", "error");
    } finally {
      setExporting(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = [
      "name,bac,percentage_planned,percentage_completed,actual_cost",
      "Levantamiento de Requerimientos,8000,80,60,5500",
      "Diseño de Interfaz,12000,100,90,11000",
      "Desarrollo Backend,15000,70,45,8500",
      "Pruebas Unitarias,5000,50,30,2000",
      "Documentación Técnica,3000,40,20,800",
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plantilla_actividades.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Import section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Importar CSV</h3>
          <button
            type="button"
            onClick={downloadTemplate}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Descargar plantilla de ejemplo
          </button>
        </div>
        <section
          aria-label="Zona de carga de archivos CSV"
          className={`border-2 border-dashed rounded-xl transition ${
            dragOver ? "border-cyan-400 bg-cyan-50" : "border-gray-200 hover:border-gray-300 bg-gray-50"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <button
            type="button"
            className="w-full p-8 text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded-xl"
            onClick={() => fileRef.current?.click()}
          >
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleInputChange} />
          {importing ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#0D2E2B", borderTopColor: "transparent" }} />
              <p className="text-sm text-gray-500">Importando...</p>
            </div>
          ) : (
            <>
              <svg className="w-10 h-10 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-gray-600 font-medium">Arrastra un CSV aquí o haz clic para buscar</p>
              <p className="text-xs text-gray-400 mt-1">Formato: actividades con BAC, % planificado, % completado, costo real</p>
            </>
          )}
          </button>
        </section>

        {/* Import result */}
        {result && (
          <div className="mt-3 p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="text-sm font-medium text-green-700">Importación completada</p>
            <p className="text-xs text-green-600 mt-1">
              {result.imported_count} registros importados
              {result.skipped_count > 0 && `, ${result.skipped_count} skipped`}
            </p>
            {result.errors && result.errors.length > 0 && (
              <ul className="mt-2 text-xs text-red-600 list-disc list-inside">
                {result.errors.slice(0, 5).map((err) => (
                  <li key={`${err.row}-${err.field}`}>{`Row ${err.row} [${err.field}]: ${err.error}`}</li>
                ))}
                {result.errors.length > 5 && <li>...and {result.errors.length - 5} more</li>}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Export section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Exportar Reporte</h3>
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg text-white disabled:opacity-50 transition"
          style={{ backgroundColor: "#0D2E2B" }}
        >
          {exporting ? (
            <>
              <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin border-white" />
              Generating...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF Report
            </>
          )}
        </button>
      </div>
    </div>
  );
}
