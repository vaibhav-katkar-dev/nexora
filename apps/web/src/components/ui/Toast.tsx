"use client";

import { useState, useCallback, useEffect, createContext, useContext } from "react";
import { CheckCircle2, AlertTriangle, Info, X, AlertCircle } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────
type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (opts: Omit<Toast, "id">) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Toast Icon Map ────────────────────────────────────────────────────────
const ICONS: Record<ToastType, React.ElementType> = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const STYLES: Record<ToastType, { bar: string; icon: string; bg: string; border: string }> = {
  success: {
    bg: "bg-white",
    border: "border-emerald-200",
    bar: "bg-emerald-500",
    icon: "text-emerald-500",
  },
  error: {
    bg: "bg-white",
    border: "border-rose-200",
    bar: "bg-rose-500",
    icon: "text-rose-500",
  },
  warning: {
    bg: "bg-white",
    border: "border-amber-200",
    bar: "bg-amber-500",
    icon: "text-amber-500",
  },
  info: {
    bg: "bg-white",
    border: "border-indigo-200",
    bar: "bg-indigo-500",
    icon: "text-indigo-500",
  },
};

// ─── Single Toast Item ─────────────────────────────────────────────────────
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const style = STYLES[toast.type];
  const IconComp = ICONS[toast.type];
  const duration = toast.duration ?? 4000;

  useEffect(() => {
    // Animate in
    const enterTimer = setTimeout(() => setVisible(true), 10);
    // Auto dismiss
    const exitTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, duration);
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [toast.id, duration, onRemove]);

  return (
    <div
      role="alert"
      className={`relative flex items-start gap-3 w-80 ${style.bg} border ${style.border} rounded-2xl shadow-xl overflow-hidden p-4 transition-all duration-300 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {/* Accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${style.bar} rounded-l-2xl`} />

      <IconComp size={18} className={`${style.icon} shrink-0 mt-0.5`} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-900 leading-tight">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{toast.message}</p>
        )}
      </div>

      <button
        onClick={() => {
          setVisible(false);
          setTimeout(() => onRemove(toast.id), 300);
        }}
        className="shrink-0 p-0.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((opts: Omit<Toast, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev.slice(-4), { ...opts, id }]); // max 5 toasts
  }, []);

  const contextValue: ToastContextValue = {
    toast: addToast,
    success: (title, message) => addToast({ type: "success", title, message }),
    error: (title, message) => addToast({ type: "error", title, message }),
    warning: (title, message) => addToast({ type: "warning", title, message }),
    info: (title, message) => addToast({ type: "info", title, message }),
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Toast container */}
      <div
        aria-live="polite"
        className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
