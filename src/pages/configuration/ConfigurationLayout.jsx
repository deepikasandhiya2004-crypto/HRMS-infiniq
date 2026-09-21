import React from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  Sliders,
  Users,
  Clock,
  Palmtree,
  Workflow,
  ShieldCheck,
  Building,
  Settings,
} from "lucide-react";

export default function ConfigurationLayout() {
  const location = useLocation();

  const configNav = [
    {
      to: "/configuration/general",
      label: "General",
      desc: "Company profile & regional",
      icon: Sliders,
    },
    {
      to: "/configuration/employee",
      label: "Employee",
      desc: "IDs, depts, designations",
      icon: Users,
    },
    {
      to: "/configuration/attendance",
      label: "Attendance",
      desc: "Shifts, grace & rules",
      icon: Clock,
    },
    {
      to: "/configuration/leave",
      label: "Leave",
      desc: "Leave policies & quotas",
      icon: Palmtree,
    },
    {
      to: "/configuration/workflows",
      label: "Workflows",
      desc: "Approval hierarchies & SLAs",
      icon: Workflow,
    },
    {
      to: "/configuration/roles-permissions",
      label: "Roles & Permissions",
      desc: "Access control matrix",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="space-y-6">
      {/* MODULE HEADER */}
      <div className="border-b border-[#00373A]/10 pb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[#00373A]/60 uppercase tracking-wider">
          <Settings size={16} className="text-[#00DC46]" />
          <span>Administration / System Configuration</span>
        </div>
        <h1 className="mt-1 text-2xl font-extrabold text-[#00373A]">
          INFiniq HRMS Policies & Governance
        </h1>
        <p className="mt-0.5 text-xs text-[#00373A]/60">
          Configure corporate policies, employment parameters, attendance grace thresholds, and role-based permissions
        </p>
      </div>

      {/* TWO-COLUMN ENTERPRISE SETTINGS LAYOUT */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* LEFT-SIDE CONFIGURATION NAVIGATION */}
        <div className="space-y-1">
          <div className="rounded-2xl bg-white p-3 border border-[#00373A]/10 shadow-sm space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Configuration Modules
            </div>

            {configNav.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-start gap-3 rounded-xl p-3 text-left transition ${
                    isActive
                      ? "bg-[#00373A] text-white shadow-sm"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon
                    size={18}
                    className={`shrink-0 mt-0.5 ${
                      isActive ? "text-[#00DC46]" : "text-[#00373A]/60"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className={`text-xs font-bold ${isActive ? "text-white" : "text-[#00373A]"}`}>
                      {item.label}
                    </p>
                    <p
                      className={`text-[11px] truncate ${
                        isActive ? "text-[#F9F7E8]/70" : "text-slate-400"
                      }`}
                    >
                      {item.desc}
                    </p>
                  </div>
                </NavLink>
              );
            })}
          </div>

          <div className="rounded-2xl bg-[#00373A]/5 p-4 border border-[#00373A]/10 text-xs text-slate-600 space-y-1">
            <p className="font-bold text-[#00373A]">Active Policy Engine</p>
            <p className="text-[11px] text-slate-500">
              Changes applied in configuration take effect immediately across all employee portals and workflows.
            </p>
          </div>
        </div>

        {/* RIGHT CONTENT AREA */}
        <div className="lg:col-span-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
