import React from "react";

const STYLES = {
  present: "bg-accent/15 text-accent",
  wfh: "bg-purple/15 text-purple",
  leave: "bg-warning/15 text-warning",
  absent: "bg-red-100 text-red-600",
  not_checked_in: "bg-slate-100 text-slate-500",
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-accent/15 text-accent",
  rejected: "bg-red-100 text-red-600",
};

const LABELS = {
  present: "Present", wfh: "WFH", leave: "Leave", absent: "Absent",
  not_checked_in: "Not checked in", pending: "Pending", approved: "Approved", rejected: "Rejected",
};

export default function StatusBadge({ status, size = "md" }) {
  const cls = STYLES[status] || "bg-slate-100 text-slate-500";
  const pad = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]";
  return (
    <span className={`inline-flex items-center rounded-full font-bold ${pad} ${cls}`}>
      {LABELS[status] || status}
    </span>
  );
}