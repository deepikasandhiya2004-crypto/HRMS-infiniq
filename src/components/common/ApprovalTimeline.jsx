import React from "react";
import { CheckCircle2, Clock, XCircle, Circle } from "lucide-react";

export default function ApprovalTimeline({ steps = [] }) {
  if (!steps || steps.length === 0) return null;

  const getStepIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 size={18} className="text-emerald-600 bg-white" />;
      case "current":
        return <Clock size={18} className="text-amber-500 bg-white animate-pulse" />;
      case "rejected":
        return <XCircle size={18} className="text-rose-600 bg-white" />;
      default:
        return <Circle size={18} className="text-slate-300 bg-white" />;
    }
  };

  return (
    <div className="py-2">
      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {steps.map((step, idx) => {
          return (
            <div key={idx} className="relative group">
              <div className="absolute -left-6 top-0 flex items-center justify-center">
                {getStepIcon(step.status)}
              </div>
              <div className="text-xs">
                <div className="flex items-center justify-between font-semibold text-[#00373A]">
                  <span>{step.step}</span>
                  <span className="text-[11px] font-normal text-slate-400">
                    {step.date || ""}
                  </span>
                </div>
                {step.by && (
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    By: <strong className="text-[#00373A]/80">{step.by}</strong>
                  </p>
                )}
                {step.notes && (
                  <p className="mt-1 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                    "{step.notes}"
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
