/* Toast notification — auto-dismiss feedback. */
import React, { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

let nextId = 0;
const listeners = new Set<(toast: Toast) => void>();

export function showToast(message: string, type: ToastType = "info") {
  const toast: Toast = { id: ++nextId, message, type };
  listeners.forEach((fn) => fn(toast));
}

const TYPE_STYLES: Record<ToastType, string> = {
  success: "bg-emerald-600",
  error: "bg-red-600",
  info: "bg-gray-800",
};

const AUTO_DISMISS_MS = 4000;

function scheduleRemoval(id: number, setToasts: React.Dispatch<React.SetStateAction<Toast[]>>) {
  setTimeout(() => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, AUTO_DISMISS_MS);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (toast: Toast) => {
      setToasts((prev) => [...prev, toast]);
      scheduleRemoval(toast.id, setToasts);
    };
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${TYPE_STYLES[t.type]} text-white px-4 py-3 rounded-lg shadow-lg text-sm max-w-sm animate-slide-in`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
