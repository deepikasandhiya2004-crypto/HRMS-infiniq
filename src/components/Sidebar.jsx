import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Clock,
  Settings as SettingsIcon,
  Palmtree,
  Sliders,
  Settings2,
  BarChart3,
  Building2,
  ClipboardList,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";



const CORE = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/team", icon: Users, label: "Team" },
  { to: "/attendance", icon: Clock, label: "Attendance" },
];

const GROUPS = [
  {
    key: "leave",
    label: "Leave Tracker",
    icon: Palmtree,
    items: [
      { label: "My Leave", to: "/leave-tracker/my-leave" },
      { label: "Leave Balance", to: "/leave-tracker/balance" },
      { label: "Apply Leave", to: "/leave-tracker/apply" },
      { label: "Team Leave", to: "/leave-tracker/team" },
      { label: "Leave Calendar", to: "/leave-tracker/calendar" },
    ],
  },
  {
    key: "operations",
    label: "Operations",
    icon: Sliders,
    items: [
      { label: "Employees", to: "/operations/employees" },
      { label: "Onboarding", to: "/operations/onboarding" },
      { label: "Offboarding", to: "/operations/offboarding" },
      { label: "HR Services", to: "/operations/hr-services" },
      {
        label: "Employee Requests",
        to: "/operations/employee-requests",
      },
    ],
  },
  {
    key: "configuration",
    label: "Configuration",
    icon: Settings2,
    items: [
      { label: "General", to: "/configuration/general" },
      { label: "Employee", to: "/configuration/employee" },
      { label: "Attendance", to: "/configuration/attendance" },
      { label: "Leave", to: "/configuration/leave" },
      { label: "Workflows", to: "/configuration/workflows" },
      {
        label: "Roles & Permissions",
        to: "/configuration/roles-permissions",
      },
    ],
  },
    {
    key: "reports",
    label: "Reports",
    icon: BarChart3,
    items: [
      { label: "My Reports", to: "/reports/my-reports" },
      { label: "Team Reports", to: "/reports/team-reports" },
      { label: "Organization Reports", to: "/reports/organization-reports", adminOnly: true },
      { label: "Export Center", to: "/reports/export-center", adminOnly: true },
    ],
  },
  {
    key: "organization",
    label: "Organization",
    icon: Building2,
    adminOnly: true,
    items: [
      { label: "Company", to: "/organization/company" },
      { label: "Departments", to: "/organization/departments" },
      { label: "Designations", to: "/organization/designations" },
      { label: "Locations", to: "/organization/locations" },
      { label: "Teams", to: "/organization/teams" },
      { label: "Org Structure", to: "/organization/structure" },
    ],
  },
  {
    key: "audit",
    label: "Audit Logs",
    icon: ClipboardList,
    adminOnly: true,
    items: [
      { label: "Activity Logs", to: "/audit-logs/activity" },
      { label: "Login History", to: "/audit-logs/login-history" },
      { label: "Admin History", to: "/audit-logs/admin-history" },
    ],
  },
];





export default function Sidebar() {
  const { user, role, isAllAccess } = useAuth();
  const [open, setOpen] = useState({});

  const toggle = (key) => {
    setOpen((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  return (
    <aside
      className="hidden w-64 shrink-0 flex-col px-4 py-5 text-cream md:flex select-none border-r border-primary/20"
      style={{ backgroundColor: "#00373A" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 py-1">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary font-black text-xl shadow-sm">
          iQ
        </div>

        <div>
          <div className="text-lg font-black tracking-tight flex items-center gap-1.5 text-white">
            INFINIQ
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-accent text-primary">
              HRMS
            </span>
          </div>

          <p className="text-[11px] font-medium text-cream/60">
            People & Workplace OS
          </p>
        </div>
      </div>

      <nav className="mt-6 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pr-1">
        {/* Main */}
        <div className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-cream/40">
          Main
        </div>

        {CORE.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-white/10 text-accent font-bold"
                  : "text-cream/70 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}

        {/* Member 2 Modules */}
        {GROUPS.filter((g) => !g.adminOnly || isAllAccess).map((group) =>  (
          <div key={group.key}>
            <button
              type="button"
              onClick={() => toggle(group.key)}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-cream/70 hover:bg-white/5 hover:text-white transition-all"
            >
              <div className="flex items-center gap-3">
                <group.icon size={17} />
                <span>{group.label}</span>
              </div>

              {open[group.key] ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </button>

            {open[group.key] && (
              <div className="mt-1 flex flex-col gap-0.5 pl-7">
                {group.items.filter((it) => !it.adminOnly || isAllAccess).map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `block rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                        isActive
                          ? "bg-white/10 text-accent font-bold"
                          : "text-cream/60 hover:bg-white/5 hover:text-white"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Administration */}
        <div className="mt-4 px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-cream/40">
          Administration
        </div>



        {/* Settings */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              isActive
                ? "bg-white/10 text-accent font-bold"
                : "text-cream/70 hover:bg-white/5 hover:text-white"
            }`
          }
        >
          <SettingsIcon size={17} />
          <span>Settings</span>
        </NavLink>
      </nav>

      {/* User */}
      <div className="mt-auto pt-4 border-t border-white/10">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-2.5">
          <img
            src={user.avatar}
            alt={user.name}
            className="h-9 w-9 rounded-full object-cover border border-accent/40"
          />

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-white">
              {user.name}
            </p>

            <p className="truncate text-[10px] text-accent capitalize font-semibold">
              {role.replace("_", " ")}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}