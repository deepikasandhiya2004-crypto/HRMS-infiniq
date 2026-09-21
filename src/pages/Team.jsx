import React, { useState, useEffect } from "react";
import { Users, Mail, Phone, MapPin, Search } from "lucide-react";
import { hrmsService } from "../services/hrmsService.js";
import StatusBadge from "../components/common/StatusBadge.jsx";
import SearchBar from "../components/common/SearchBar.jsx";

export default function Team() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");

  useEffect(() => {
    hrmsService.getEmployees().then(setEmployees);
  }, []);

  const departments = Array.from(new Set(employees.map((e) => e.department)));

  const filtered = employees.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.designation.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase());
    const matchesDept = !deptFilter || e.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#00373A]">Team Directory</h1>
          <p className="mt-1 text-xs text-[#00373A]/60">
            Browse and connect with members across all corporate departments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search team member..."
            className="w-64"
          />
        </div>
      </div>

      {/* DEPARTMENT PILLS */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setDeptFilter("")}
          className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
            !deptFilter
              ? "bg-[#00373A] text-white"
              : "bg-white text-[#00373A]/70 border border-[#00373A]/10 hover:bg-slate-50"
          }`}
        >
          All Departments ({employees.length})
        </button>
        {departments.map((d) => (
          <button
            key={d}
            onClick={() => setDeptFilter(d)}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              deptFilter === d
                ? "bg-[#00373A] text-white"
                : "bg-white text-[#00373A]/70 border border-[#00373A]/10 hover:bg-slate-50"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* TEAM MEMBER CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((emp) => (
          <div
            key={emp.id}
            className="flex flex-col rounded-2xl bg-white p-5 border border-[#00373A]/10 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <img
                src={emp.avatar}
                alt={emp.name}
                className="h-14 w-14 rounded-2xl object-cover border border-[#00373A]/10 shadow-sm"
              />
              <StatusBadge status={emp.status} size="sm" />
            </div>

            <div className="mt-4 flex-1">
              <h3 className="text-sm font-bold text-[#00373A]">{emp.name}</h3>
              <p className="text-xs text-[#00373A]/70 mt-0.5">{emp.designation}</p>
              <span className="inline-block mt-2 rounded-md bg-[#00373A]/5 px-2 py-0.5 text-[10px] font-bold text-[#00373A]">
                {emp.department}
              </span>
            </div>

            <div className="mt-4 pt-3 border-t border-[#00373A]/5 space-y-1.5 text-[11px] text-[#00373A]/70">
              <div className="flex items-center gap-2">
                <Mail size={13} className="text-[#00373A]/40 shrink-0" />
                <span className="truncate">{emp.personal?.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-[#00373A]/40 shrink-0" />
                <span className="truncate">{emp.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
