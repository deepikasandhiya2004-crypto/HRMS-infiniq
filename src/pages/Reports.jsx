import React from "react";
import { BarChart3, Download, TrendingUp, Users, Calendar, Palmtree } from "lucide-react";
import StatCard from "../components/common/StatCard.jsx";

export default function Reports() {
  const reportCards = [
    { title: "Monthly Attendance Summary", desc: "Detailed employee punch records, late marks, and loss of pay", date: "Sep 2026", type: "PDF / Excel" },
    { title: "Leave Utilization Report", desc: "Annual leave balance breakdown, pending leaves, and encashments", date: "Q3 2026", type: "Excel" },
    { title: "Headcount & Turnover Analysis", desc: "New hires, onboarding completions, resignations, and attrition rates", date: "2026 YTD", type: "PDF" },
    { title: "HR Service Requests SLA Report", desc: "Turnaround times for certificate generation and address updates", date: "Last 30 Days", type: "CSV" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#00373A]">HR Reports & Analytics</h1>
          <p className="mt-1 text-xs text-[#00373A]/60">
            Export official HR compliance metrics, leave statistics, and workforce reports
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Reports Generated" value="48" icon={BarChart3} accentColor="#00DC46" />
        <StatCard title="Average Turnaround" value="1.4 Days" icon={Calendar} accentColor="#00373A" />
        <StatCard title="Compliance Health" value="99.2%" icon={TrendingUp} accentColor="#7C3AED" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {reportCards.map((r, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between rounded-2xl bg-white p-5 border border-[#00373A]/10 shadow-sm transition hover:shadow-md"
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#00DC46] bg-[#00373A] px-2 py-0.5 rounded">
                {r.type}
              </span>
              <h3 className="mt-2 text-sm font-bold text-[#00373A]">{r.title}</h3>
              <p className="mt-0.5 text-xs text-[#00373A]/60">{r.desc}</p>
              <span className="mt-2 block text-[11px] font-medium text-slate-400">Period: {r.date}</span>
            </div>
            <button
              onClick={() => alert(`Downloading ${r.title}...`)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00373A]/5 text-[#00373A] hover:bg-[#00373A] hover:text-white transition"
              title="Download Report"
            >
              <Download size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
