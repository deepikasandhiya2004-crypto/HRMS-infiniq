import React from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  History,
  PieChart,
  PlusCircle,
  Users2,
  CalendarDays,
  Palmtree,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

export default function LeaveTrackerLayout() {
  const { role } = useAuth();
  const location = useLocation();

  const navTabs = [
    { to: "/leave-tracker/my-leave", label: "My Leave", icon: History },
    { to: "/leave-tracker/balance", label: "Leave Balance", icon: PieChart },
    { to: "/leave-tracker/apply", label: "Apply Leave", icon: PlusCircle },
    { to: "/leave-tracker/team", label: "Team Leave", icon: Users2 },
    { to: "/leave-tracker/calendar", label: "Leave Calendar", icon: CalendarDays },
  ];

  return (
    <div className="space-y-6">
      {/* MODULE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#00373A]/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#00373A]/60 uppercase tracking-wider">
            <Palmtree size={16} className="text-[#00DC46]" />
            <span>Core HR / Leave Tracker</span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold text-[#00373A]">
            Leave Management & Entitlements
          </h1>
          <p className="mt-0.5 text-xs text-[#00373A]/60">
            Request time off, monitor leave balances, approve team requests, and view the company leave calendar
          </p>
        </div>

        <div className="flex items-center gap-2">
          <NavLink
            to="/leave-tracker/apply"
            className="inline-flex items-center gap-2 rounded-xl bg-[#00DC46] px-4 py-2.5 text-xs font-extrabold text-[#00373A] shadow-sm transition hover:bg-[#00DC46]/90"
          >
            <PlusCircle size={16} />
            <span>Apply Leave</span>
          </NavLink>
        </div>
      </div>

      {/* HORIZONTAL NAV TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.to;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-[#00373A] text-white shadow-sm"
                  : "bg-white text-[#00373A]/70 border border-[#00373A]/10 hover:bg-slate-50 hover:text-[#00373A]"
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* NESTED CONTENT */}
      <div className="pt-2">
        <Outlet />
      </div>
    </div>
  );
}
