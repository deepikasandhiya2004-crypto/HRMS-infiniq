import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, Clock, Settings as SettingsIcon,
  Palmtree, Sliders, Settings2, BarChart3, Building2, ClipboardList,
  ChevronDown, ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const CORE = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/team", icon: Users, label: "Team" },
  { to: "/attendance", icon: Clock, label: "Attendance" },
];

const GROUPS = [
  { key: "leave", label: "Leave Tracker", icon: Palmtree, items: ["My Leave", "Leave Balance", "Apply Leave", "Team Leave", "Leave Calendar"] },
  { key: "operations", label: "Operations", icon: Sliders, items: ["Employees", "Onboarding", "Offboarding", "HR Services", "Employee Requests"] },
  { key: "configuration", label: "Configuration", icon: Settings2, items: ["General", "Employee", "Attendance", "Leave", "Workflows", "Roles & Permissions"] },
];

const SINGLES = [
  { label: "Reports", icon: BarChart3 },
  { label: "Organization", icon: Building2 },
  { label: "Audit Logs", icon: ClipboardList },
];

export default function Sidebar() {
  const location = useLocation();
  const { user, role } = useAuth();
  const [open, setOpen] = useState({});
  const toggle = (k) => setOpen((p) => ({ ...p, [k]: !p[k] }));

  return (
    <aside className="hidden w-64 shrink-0 flex-col px-4 py-5 text-cream md:flex select-none border-r border-primary/20" style={{ backgroundColor: "#00373A" }}>
      <div className="flex items-center gap-3 px-3 py-1">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary font-black text-xl shadow-sm">iQ</div>
        <div>
          <div className="text-lg font-black tracking-tight flex items-center gap-1.5 text-white">
            INFINIQ
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-accent text-primary">HRMS</span>
          </div>
          <p className="text-[11px] font-medium text-cream/60">People & Workplace OS</p>
        </div>
      </div>

      <nav className="mt-6 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pr-1">
        <div className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-cream/40">Main</div>
        {CORE.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                isActive ? "bg-white/10 text-accent font-bold" : "text-cream/70 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}

        {GROUPS.map((g) => (
          <div key={g.key}>
            <button
              type="button"
              onClick={() => toggle(g.key)}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-cream/70 hover:bg-white/5 hover:text-white transition-all"
            >
              <div className="flex items-center gap-3">
                <g.icon size={17} />
                <span>{g.label}</span>
              </div>
              {open[g.key] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {open[g.key] && (
              <div className="mt-1 flex flex-col gap-0.5 pl-7">
                {g.items.map((item) => (
                  <div key={item} className="rounded-lg px-2.5 py-1.5 text-xs text-cream/60 hover:bg-white/5 hover:text-white cursor-pointer transition-colors">
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="mt-4 px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-cream/40">Administration</div>

        {SINGLES.map(({ label, icon: Icon }) => (
          <div key={label} className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-cream/70 hover:bg-white/5 hover:text-white cursor-pointer transition-all">
            <Icon size={17} />
            <span>{label}</span>
          </div>
        ))}

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              isActive ? "bg-white/10 text-accent font-bold" : "text-cream/70 hover:bg-white/5 hover:text-white"
            }`
          }
        >
          <SettingsIcon size={17} />
          <span>Settings</span>
        </NavLink>
      </nav>

      <div className="mt-auto pt-4 border-t border-white/10">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-2.5">
          <img src={user.avatar} alt={user.name} className="h-9 w-9 rounded-full object-cover border border-accent/40" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-white">{user.name}</p>
            <p className="truncate text-[10px] text-accent capitalize font-semibold">{role.replace("_", " ")}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}