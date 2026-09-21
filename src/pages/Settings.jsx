import React from "react";
import { Link } from "react-router-dom";
import {
  Sliders,
  Settings as SettingsIcon,
  Shield,
  Workflow,
  Clock,
  Palmtree,
  Users,
  ChevronRight,
} from "lucide-react";

export default function Settings() {
  const quickSettings = [
    { title: "General Workspace Settings", desc: "Company branding, work weeks, and currency", path: "/configuration/general", icon: Sliders },
    { title: "Employee & Hierarchy Config", desc: "ID prefixes, departments, designations, and locations", path: "/configuration/employee", icon: Users },
    { title: "Attendance & Shift Policies", desc: "Shift timings, grace period, overtime, and approval rules", path: "/configuration/attendance", icon: Clock },
    { title: "Leave Policies & Rules", desc: "Leave types, annual accrual, carry-forward, and sandwich rules", path: "/configuration/leave", icon: Palmtree },
    { title: "Approval Workflows", desc: "Multi-level approver chains and turnaround SLAs", path: "/configuration/workflows", icon: Workflow },
    { title: "Roles & Permission Matrix", desc: "Granular access control across Super Admin, HR, Manager, and Employee", path: "/configuration/roles-permissions", icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#00373A]">System Settings & Administration</h1>
        <p className="mt-1 text-xs text-[#00373A]/60">
          Manage system configurations, policies, and role permissions for INFiniq HRMS
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickSettings.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link
              key={idx}
              to={item.path}
              className="group flex flex-col justify-between rounded-2xl bg-white p-5 border border-[#00373A]/10 shadow-sm transition hover:shadow-md hover:border-[#00373A]/30"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00373A]/5 text-[#00373A] group-hover:bg-[#00373A] group-hover:text-white transition">
                  <Icon size={20} />
                </div>
                <h3 className="mt-4 text-sm font-bold text-[#00373A]">{item.title}</h3>
                <p className="mt-1 text-xs text-[#00373A]/60">{item.desc}</p>
              </div>

              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#00373A] group-hover:text-[#00DC46] transition">
                <span>Configure</span>
                <ChevronRight size={14} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
