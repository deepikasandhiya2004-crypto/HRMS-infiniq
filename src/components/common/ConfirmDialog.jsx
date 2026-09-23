import React from "react";
import { AlertTriangle, Info, CheckCircle2, X } from "lucide-react";

export default function ConfirmDialog({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger", // 'danger' | 'warning' | 'info' | 'success'
  onConfirm,
  onCancel,
  loading = false,
  children,
}) {
  if (!isOpen) return null;

  const variantIcons = {
    danger: <AlertTriangle size={24} className="text-rose-600" />,
    warning: <AlertTriangle size={24} className="text-amber-600" />,
    info: <Info size={24} className="text-blue-600" />,
    success: <CheckCircle2 size={24} className="text-emerald-600" />,
  };

  const variantButtonClasses = {
    danger: "bg-rose-600 hover:bg-rose-700 text-white",
    warning: "bg-amber-600 hover:bg-amber-700 text-white",
    info: "bg-blue-600 hover:bg-blue-700 text-white",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100">
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition"
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50">
            {variantIcons[variant]}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-[#00373A]">{title}</h3>
            <p className="mt-1 text-sm text-[#00373A]/70">{message}</p>
            {children && <div className="mt-3">{children}</div>}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition disabled:opacity-50 ${variantButtonClasses[variant]}`}
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
