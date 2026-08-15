"use client";

import { useEffect } from "react";
import { AlertTriangle, Trash2, Info, X, Loader2 } from "lucide-react";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const IconComp = variant === "danger" ? Trash2 : variant === "warning" ? AlertTriangle : Info;

  const iconBgClass =
    variant === "danger"
      ? "bg-rose-100 text-rose-600 border-rose-200"
      : variant === "warning"
      ? "bg-amber-100 text-amber-600 border-amber-200"
      : "bg-indigo-100 text-indigo-600 border-indigo-200";

  const confirmBtnClass =
    variant === "danger"
      ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20"
      : variant === "warning"
      ? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20"
      : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 z-10 animate-scale-in my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-4">
          <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${iconBgClass}`}>
            <IconComp size={20} />
          </div>

          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="text-lg font-bold text-slate-900 leading-snug">{title}</h3>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all active:scale-[0.99] disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={async () => {
              await onConfirm();
            }}
            disabled={isLoading}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-[0.99] disabled:opacity-50 flex items-center gap-2 ${confirmBtnClass}`}
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Processing…</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
