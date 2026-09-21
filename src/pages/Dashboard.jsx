import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Palmtree,
  Clock,
  FileCheck2,
  CalendarDays,
  PlusCircle,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import StatCard from "../components/common/StatCard.jsx";
import StatusBadge from "../components/common/StatusBadge.jsx";
import { hrmsService } from "../services/hrmsService.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const { user, role } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [teamLeaves, setTeamLeaves] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [emp, leaves, bal] = await Promise.all([
          hrmsService.getEmployees(),
          hrmsService.getTeamLeaves(),
          hrmsService.getLeaveBalances(),
        ]);
        setEmployees(emp);
        setTeamLeaves(leaves);
        setBalances(bal);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const pendingLeaves = teamLeaves.filter((l) => l.status === "Pending");
  const onLeaveToday = employees.filter((e) => e.status === "On Leave");

  return (
    <div className="space-y-6">
      {/* WELCOME BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-[#00373A] p-6 lg:p-8 text-[#F9F7E8] shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#00DC46]">
              <span className="h-2 w-2 rounded-full bg-[#00DC46] animate-pulse" />
              INFiniq HRMS Workplace Active
            </div>
            <h1 className="mt-3 text-2xl lg:text-3xl font-extrabold text-white">
              Welcome back, {user.name} 👋
            </h1>
            <p className="mt-1 text-sm text-[#F9F7E8]/70 max-w-xl">
              You are currently working in{" "}
              <strong className="text-[#00DC46] capitalize">{role.replace("_", " ")}</strong> mode.
              Review team leaves, monitor active operations, and configure policies seamlessly.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              to="/leave-tracker/apply"
              className="inline-flex items-center gap-2 rounded-xl bg-[#00DC46] px-4 py-2.5 text-xs font-extrabold text-[#00373A] shadow-sm transition hover:bg-[#00DC46]/90"
            >
              <Palmtree size={16} />
              <span>Apply Leave</span>
            </Link>
            {(role === "hr_admin" || role === "super_admin") && (
              <Link
                to="/operations/employees"
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/15 transition"
              >
                <PlusCircle size={16} />
                <span>Add Employee</span>
              </Link>
            )}
          </div>
        </div>

        {/* Decorative corner glow */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#00DC46]/10 blur-3xl pointer-events-none" />
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Headcount"
          value={employees.length}
          subtitle="Active team workforce"
          icon={Users}
          accentColor="#00DC46"
          trend={{ value: "4.2%", isPositive: true, label: "this quarter" }}
        />
        <StatCard
          title="On Leave Today"
          value={onLeaveToday.length}
          subtitle="Planned absences"
          icon={Palmtree}
          accentColor="#FF6A3D"
        />
        <StatCard
          title="Pending Approvals"
          value={pendingLeaves.length}
          subtitle="Leave & service requests"
          icon={Clock}
          accentColor="#7C3AED"
        />
        <StatCard
          title="Today's Attendance"
          value="96.4%"
          subtitle="Average punch-in rate"
          icon={CalendarDays}
          accentColor="#0284C7"
          trend={{ value: "1.1%", isPositive: true, label: "vs last week" }}
        />
      </div>

      {/* TWO COLUMN CONTENT */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* RECENT LEAVE REQUESTS */}
        <div className="lg:col-span-2 rounded-2xl bg-white p-5 border border-[#00373A]/10 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#00373A]/10 pb-4 mb-4">
            <div>
              <h2 className="text-base font-extrabold text-[#00373A]">
                Recent Leave Requests
              </h2>
              <p className="text-xs text-[#00373A]/60">
                Latest employee leave applications requiring supervisor attention
              </p>
            </div>
            <Link
              to="/leave-tracker/team"
              className="text-xs font-bold text-[#00373A] hover:underline flex items-center gap-1"
            >
              View all <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-[#00373A]/5">
            {teamLeaves.slice(0, 4).map((l) => (
              <div key={l.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00373A]/5 font-bold text-xs text-[#00373A]">
                    {l.employeeName?.charAt(0) || "U"}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#00373A]">{l.employeeName}</p>
                    <p className="text-[11px] text-[#00373A]/60">
                      {l.leaveType} • {l.days} day(s) ({l.fromDate} to {l.toDate})
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={l.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* QUICK LEAVE BALANCE GLANCE */}
        <div className="rounded-2xl bg-white p-5 border border-[#00373A]/10 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#00373A]/10 pb-4 mb-4">
            <div>
              <h2 className="text-base font-extrabold text-[#00373A]">
                Your Leave Balance
              </h2>
              <p className="text-xs text-[#00373A]/60">Personal quota for 2026</p>
            </div>
            <Link
              to="/leave-tracker/balance"
              className="text-xs font-bold text-[#00373A] hover:underline flex items-center gap-1"
            >
              Details <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="space-y-3.5">
            {balances.slice(0, 4).map((b) => {
              const pct = Math.round((b.used / b.allocated) * 100);
              return (
                <div key={b.id} className="text-xs">
                  <div className="flex items-center justify-between font-semibold mb-1">
                    <span className="text-[#00373A]">{b.name}</span>
                    <span className="text-[#00373A]/70">
                      {b.available} left of {b.allocated}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: b.color || "#00DC46",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-xl bg-[#00373A]/5 p-3 text-center">
            <p className="text-[11px] font-semibold text-[#00373A]/70">
              Need time off? Plan your requests in advance.
            </p>
            <Link
              to="/leave-tracker/apply"
              className="mt-2 inline-block w-full rounded-lg bg-[#00373A] py-1.5 text-xs font-bold text-white transition hover:bg-[#00373A]/90"
            >
              Apply Leave Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
