import React, { useState } from "react";
import { Clock, CalendarCheck, CheckCircle2, AlertCircle, LogIn, LogOut } from "lucide-react";
import StatCard from "../components/common/StatCard.jsx";
import StatusBadge from "../components/common/StatusBadge.jsx";

export default function Attendance() {
  const [punchedIn, setPunchedIn] = useState(true);
  const [punchTime, setPunchTime] = useState("09:24 AM");

  const attendanceLog = [
    { date: "2026-09-21 (Today)", in: "09:24 AM", out: "--", hours: "4h 12m", status: "Active" },
    { date: "2026-09-20", in: "09:18 AM", out: "06:35 PM", hours: "9h 17m", status: "Present" },
    { date: "2026-09-19", in: "09:42 AM", out: "06:45 PM", hours: "9h 03m", status: "Late Mark" },
    { date: "2026-09-18", in: "09:15 AM", out: "06:30 PM", hours: "9h 15m", status: "Present" },
    { date: "2026-09-17", in: "09:20 AM", out: "06:31 PM", hours: "9h 11m", status: "Present" },
    { date: "2026-09-14", in: "--", out: "--", hours: "0h 00m", status: "Casual Leave" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#00373A]">Attendance & Time Tracking</h1>
          <p className="mt-1 text-xs text-[#00373A]/60">
            Real-time biometric & web punch-in tracking with automated shift logging
          </p>
        </div>

        {/* PUNCH IN / OUT WIDGET */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPunchedIn(!punchedIn)}
            className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold shadow-sm transition ${
              punchedIn
                ? "bg-rose-600 text-white hover:bg-rose-700"
                : "bg-[#00DC46] text-[#00373A] hover:bg-[#00DC46]/90"
            }`}
          >
            {punchedIn ? (
              <>
                <LogOut size={16} />
                <span>Punch Out</span>
              </>
            ) : (
              <>
                <LogIn size={16} />
                <span>Web Punch In</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Current Status"
          value={punchedIn ? "Checked In" : "Checked Out"}
          subtitle={`Since ${punchTime}`}
          icon={Clock}
          accentColor="#00DC46"
        />
        <StatCard
          title="Days Present"
          value="21 Days"
          subtitle="Out of 22 working days"
          icon={CalendarCheck}
          accentColor="#00373A"
        />
        <StatCard
          title="Late Arrivals"
          value="1"
          subtitle="Grace threshold: 3"
          icon={AlertCircle}
          accentColor="#FF6A3D"
        />
        <StatCard
          title="Avg Daily Hours"
          value="8h 52m"
          subtitle="Requirement: 8h 00m"
          icon={CheckCircle2}
          accentColor="#7C3AED"
        />
      </div>

      {/* ATTENDANCE TABLE */}
      <div className="rounded-2xl bg-white p-5 border border-[#00373A]/10 shadow-sm">
        <h2 className="text-base font-bold text-[#00373A] mb-4">Monthly Attendance Log (September 2026)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#00373A]">
            <thead className="bg-[#00373A]/[0.03] text-xs uppercase font-bold text-[#00373A]/60">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">First In</th>
                <th className="px-4 py-3">Last Out</th>
                <th className="px-4 py-3">Total Working Hours</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#00373A]/5">
              {attendanceLog.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold">{row.date}</td>
                  <td className="px-4 py-3">{row.in}</td>
                  <td className="px-4 py-3">{row.out}</td>
                  <td className="px-4 py-3">{row.hours}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        row.status === "Active" || row.status === "Present"
                          ? "bg-emerald-50 text-emerald-700"
                          : row.status === "Late Mark"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
