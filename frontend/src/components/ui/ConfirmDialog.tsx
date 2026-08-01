/* Confirm dialog — destructive action confirmation. */
import { Modal } from "./Modal";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  isDestructive?: boolean;
}

export function ConfirmDialog({
  open, onClose, onConfirm, title, message,
  confirmLabel = "Confirmar", isDestructive = false,
}: Readonly<ConfirmDialogProps>) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-slate-600 mb-6 leading-relaxed">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => { onConfirm(); onClose(); }}
          className={`px-4 py-2 text-sm font-semibold rounded-lg text-white transition-colors ${
            isDestructive ? "bg-red-600 hover:bg-red-700" : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
