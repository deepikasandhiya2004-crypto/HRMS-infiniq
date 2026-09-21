import React, { useState } from "react";
import { ClipboardList, Shield, Search } from "lucide-react";
import SearchBar from "../components/common/SearchBar.jsx";

export default function AuditLogs() {
  const [search, setSearch] = useState("");

  const logs = [
    { id: "AUD-101", user: "Vikram Malhotra", action: "Approved Leave Request LV-2026-002", module: "Leave", ip: "192.168.1.42", date: "2026-09-20 14:15:22" },
    { id: "AUD-102", user: "Priya Nair", action: "Updated Onboarding Stage for Siddharth Menon", module: "Operations", ip: "192.168.1.18", date: "2026-09-20 11:30:10" },
    { id: "AUD-103", user: "Deepika Sandhiya", action: "Modified Casual Leave Policy Annual Allocation", module: "Configuration", ip: "192.168.1.5", date: "2026-09-19 16:45:00" },
    { id: "AUD-104", user: "Aarav Sharma", action: "Submitted New Leave Application LV-2026-001", module: "Leave", ip: "192.168.1.88", date: "2026-09-19 10:15:44" },
    { id: "AUD-105", user: "Priya Nair", action: "Created HR Service Ticket HRS-2026-302", module: "Operations", ip: "192.168.1.18", date: "2026-09-18 09:20:18" },
    { id: "AUD-106", user: "System Automator", action: "Auto-synced biometric punch logs", module: "Attendance", ip: "127.0.0.1", date: "2026-09-18 00:01:00" },
  ];

  const filtered = logs.filter(
    (l) =>
      l.user.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.module.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#00373A]">Security & Audit Logs</h1>
          <p className="mt-1 text-xs text-[#00373A]/60">
            Immutable system trails of all employee modifications, approvals, and configuration changes
          </p>
        </div>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Filter audit events..."
          className="w-64"
        />
      </div>

      <div className="overflow-hidden rounded-2xl bg-white border border-[#00373A]/10 shadow-sm">
        <table className="w-full text-left text-sm text-[#00373A]">
          <thead className="bg-[#00373A]/[0.03] text-xs uppercase font-bold text-[#00373A]/60">
            <tr>
              <th className="px-5 py-3.5">Log ID</th>
              <th className="px-5 py-3.5">Performed By</th>
              <th className="px-5 py-3.5">Action Details</th>
              <th className="px-5 py-3.5">Module</th>
              <th className="px-5 py-3.5">IP Address</th>
              <th className="px-5 py-3.5">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#00373A]/5">
            {filtered.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50 text-xs">
                <td className="px-5 py-3.5 font-bold">{l.id}</td>
                <td className="px-5 py-3.5 font-semibold text-[#00373A]">{l.user}</td>
                <td className="px-5 py-3.5">{l.action}</td>
                <td className="px-5 py-3.5">
                  <span className="rounded-md bg-[#00373A]/5 px-2 py-0.5 text-[10px] font-bold text-[#00373A]">
                    {l.module}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-slate-500 font-mono text-[11px]">{l.ip}</td>
                <td className="px-5 py-3.5 text-slate-500">{l.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
