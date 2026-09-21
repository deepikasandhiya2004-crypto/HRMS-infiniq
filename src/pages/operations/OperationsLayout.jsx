import React from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  Users,
  UserPlus,
  UserMinus,
  FileCheck,
  LifeBuoy,
  Sliders,
} from "lucide-react";

export default function OperationsLayout() {
  const location = useLocation();

  const navTabs = [
    { to: "/operations/employees", label: "Employees", icon: Users },
    { to: "/operations/onboarding", label: "Onboarding", icon: UserPlus },
    { to: "/operations/offboarding", label: "Offboarding", icon: UserMinus },
    { to: "/operations/hr-services", label: "HR Services", icon: FileCheck },
    { to: "/operations/employee-requests", label: "Employee Requests", icon: LifeBuoy },
  ];

  return (
    <div className="space-y-6">
      {/* MODULE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#00373A]/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#00373A]/60 uppercase tracking-wider">
            <Sliders size={16} className="text-[#00DC46]" />
            <span>Core HR / Operations</span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold text-[#00373A]">
            Human Resources & Workforce Operations
          </h1>
          <p className="mt-0.5 text-xs text-[#00373A]/60">
            Manage employee lifecycle, onboarding pipelines, exit clearance workflows, and service desks
          </p>
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
