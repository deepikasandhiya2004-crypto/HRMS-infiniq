import React from "react";

const STATUS_CONFIG = {
  // Leave statuses
  Approved: { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  Pending: { bg: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  Rejected: { bg: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" },
  Cancelled: { bg: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" },

  // Employee statuses
  Active: { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  "On Leave": { bg: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  Probation: { bg: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  Resigned: { bg: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-500" },
  Inactive: { bg: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" },

  // Operations / Workflow statuses
  "In Progress": { bg: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  Completed: { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  "On Hold": { bg: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  Open: { bg: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-500" },
  New: { bg: "bg-cyan-50 text-cyan-700 border-cyan-200", dot: "bg-cyan-500" },
  Resolved: { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },

  // Priorities
  Urgent: { bg: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
  High: { bg: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  Medium: { bg: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  Low: { bg: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" },
};

export default function StatusBadge({ status, size = "md", showDot = true, className = "" }) {
  const config = STATUS_CONFIG[status] || {
    bg: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
  };

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${config.bg} ${sizeClasses} ${className}`}
    >
      {showDot && <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />}
      {status}
    </span>
  );
}
