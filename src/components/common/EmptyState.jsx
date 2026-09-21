import React from "react";
import { FolderOpen } from "lucide-react";

export default function EmptyState({
  icon: Icon = FolderOpen,
  title = "No records found",
  description = "There are currently no items matching your criteria.",
  actionLabel,
  onAction,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-white/60 border border-dashed border-[#00373A]/15 ${className}`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00373A]/5 text-[#00373A]/60 mb-4">
        <Icon size={28} strokeWidth={1.8} />
      </div>
      <h4 className="text-base font-bold text-[#00373A]">{title}</h4>
      <p className="mt-1 text-sm text-[#00373A]/60 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#00373A] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#00373A]/90"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
