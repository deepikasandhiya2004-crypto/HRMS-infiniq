import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarCheck2,
  Workflow,
  Settings,
  BarChart3,
  Building2,
  ClipboardList,
  Sliders,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Palmtree,
  UserCheck,
  UserX,
  FileCheck2,
  MessageSquareQuote,
  ShieldCheck,
  UserCog,
  CalendarDays,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Sidebar() {
  const location = useLocation();
  const { user, role, hasPermission } = useAuth();

  // State to track which parent accordion is open
  const [openMenus, setOpenMenus] = useState({
    leave: location.pathname.startsWith("/leave-tracker"),
    operations: location.pathname.startsWith("/operations"),
    configuration: location.pathname.startsWith("/configuration"),
  });

  const toggleMenu = (key) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isLeaveActive = location.pathname.startsWith("/leave-tracker");
  const isOperationsActive = location.pathname.startsWith("/operations");
  const isConfigActive = location.pathname.startsWith("/configuration");

  return (
    <aside
      className="hidden w-64 shrink-0 flex-col px-4 py-5 text-[#F9F7E8] md:flex select-none border-r border-[#00373A]/20"
      style={{ backgroundColor: "#00373A" }}
    >
      {/* BRAND LOGO */}
      <div className="flex items-center gap-3 px-3 py-1">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00DC46] text-[#00373A] font-black text-xl shadow-sm">
          iQ
        </div>
        <div>
          <div className="text-lg font-black tracking-tight flex items-center gap-1.5 text-white">
            INFINIQ
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#00DC46] text-[#00373A]">
              HRMS
            </span>
          </div>
          <p className="text-[11px] font-medium text-[#F9F7E8]/60">People & Workplace OS</p>
        </div>
      </div>

      {/* NAVIGATION SCROLL AREA */}
      <nav className="mt-6 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto scrollbar-hide pr-1">
        {/* MAIN SECTION */}
        <div className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-[#F9F7E8]/40">
          Main
        </div>

        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              isActive
                ? "bg-white/10 text-[#00DC46] font-bold"
                : "text-[#F9F7E8]/70 hover:bg-white/5 hover:text-white"
            }`
          }
        >
          <LayoutDashboard size={17} />
          <span>Dashboard</span>
        </NavLink>

        {/* CORE HR SECTION */}
        <div className="mt-4 px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-[#F9F7E8]/40">
          Core HR
        </div>

        <NavLink
          to="/team"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              isActive
                ? "bg-white/10 text-[#00DC46] font-bold"
                : "text-[#F9F7E8]/70 hover:bg-white/5 hover:text-white"
            }`
          }
        >
          <Users size={17} />
          <span>Team</span>
        </NavLink>

        <NavLink
          to="/attendance"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              isActive
                ? "bg-white/10 text-[#00DC46] font-bold"
                : "text-[#F9F7E8]/70 hover:bg-white/5 hover:text-white"
            }`
          }
        >
          <Clock size={17} />
          <span>Attendance</span>
        </NavLink>

        {/* ================= LEAVE TRACKER MODULE ================= */}
        <div className="mt-1">
          <button
            type="button"
            onClick={() => toggleMenu("leave")}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              isLeaveActive
                ? "bg-white/10 text-white font-bold"
                : "text-[#F9F7E8]/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <Palmtree size={17} className={isLeaveActive ? "text-[#00DC46]" : ""} />
              <span>Leave Tracker</span>
            </div>
            {openMenus.leave ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          {openMenus.leave && (
            <div className="mt-1 flex flex-col gap-0.5 pl-7">
              <NavLink
                to="/leave-tracker/my-leave"
                className={({ isActive }) =>
                  `rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                    isActive
                      ? "text-[#00DC46] font-bold bg-white/5"
                      : "text-[#F9F7E8]/60 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                My Leave
              </NavLink>
              <NavLink
                to="/leave-tracker/balance"
                className={({ isActive }) =>
                  `rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                    isActive
                      ? "text-[#00DC46] font-bold bg-white/5"
                      : "text-[#F9F7E8]/60 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                Leave Balance
              </NavLink>
              <NavLink
                to="/leave-tracker/apply"
                className={({ isActive }) =>
                  `rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                    isActive
                      ? "text-[#00DC46] font-bold bg-white/5"
                      : "text-[#F9F7E8]/60 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                Apply Leave
              </NavLink>
              <NavLink
                to="/leave-tracker/team"
                className={({ isActive }) =>
                  `rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                    isActive
                      ? "text-[#00DC46] font-bold bg-white/5"
                      : "text-[#F9F7E8]/60 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                Team Leave
              </NavLink>
              <NavLink
                to="/leave-tracker/calendar"
                className={({ isActive }) =>
                  `rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                    isActive
                      ? "text-[#00DC46] font-bold bg-white/5"
                      : "text-[#F9F7E8]/60 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                Leave Calendar
              </NavLink>
            </div>
          )}
        </div>

        {/* ================= OPERATIONS MODULE ================= */}
        <div className="mt-1">
          <button
            type="button"
            onClick={() => toggleMenu("operations")}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              isOperationsActive
                ? "bg-white/10 text-white font-bold"
                : "text-[#F9F7E8]/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <Sliders size={17} className={isOperationsActive ? "text-[#00DC46]" : ""} />
              <span>Operations</span>
            </div>
            {openMenus.operations ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          {openMenus.operations && (
            <div className="mt-1 flex flex-col gap-0.5 pl-7">
              <NavLink
                to="/operations/employees"
                className={({ isActive }) =>
                  `rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                    isActive
                      ? "text-[#00DC46] font-bold bg-white/5"
                      : "text-[#F9F7E8]/60 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                Employees
              </NavLink>
              <NavLink
                to="/operations/onboarding"
                className={({ isActive }) =>
                  `rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                    isActive
                      ? "text-[#00DC46] font-bold bg-white/5"
                      : "text-[#F9F7E8]/60 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                Onboarding
              </NavLink>
              <NavLink
                to="/operations/offboarding"
                className={({ isActive }) =>
                  `rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                    isActive
                      ? "text-[#00DC46] font-bold bg-white/5"
                      : "text-[#F9F7E8]/60 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                Offboarding
              </NavLink>
              <NavLink
                to="/operations/hr-services"
                className={({ isActive }) =>
                  `rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                    isActive
                      ? "text-[#00DC46] font-bold bg-white/5"
                      : "text-[#F9F7E8]/60 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                HR Services
              </NavLink>
              <NavLink
                to="/operations/employee-requests"
                className={({ isActive }) =>
                  `rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                    isActive
                      ? "text-[#00DC46] font-bold bg-white/5"
                      : "text-[#F9F7E8]/60 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                Employee Requests
              </NavLink>
            </div>
          )}
        </div>

        {/* ADMINISTRATION SECTION */}
        <div className="mt-4 px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-[#F9F7E8]/40">
          Administration
        </div>

        {/* ================= CONFIGURATION MODULE ================= */}
        <div>
          <button
            type="button"
            onClick={() => toggleMenu("configuration")}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              isConfigActive
                ? "bg-white/10 text-white font-bold"
                : "text-[#F9F7E8]/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <Settings size={17} className={isConfigActive ? "text-[#00DC46]" : ""} />
              <span>Configuration</span>
            </div>
            {openMenus.configuration ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          {openMenus.configuration && (
            <div className="mt-1 flex flex-col gap-0.5 pl-7">
              <NavLink
                to="/configuration/general"
                className={({ isActive }) =>
                  `rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                    isActive
                      ? "text-[#00DC46] font-bold bg-white/5"
                      : "text-[#F9F7E8]/60 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                General
              </NavLink>
              <NavLink
                to="/configuration/employee"
                className={({ isActive }) =>
                  `rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                    isActive
                      ? "text-[#00DC46] font-bold bg-white/5"
                      : "text-[#F9F7E8]/60 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                Employee
              </NavLink>
              <NavLink
                to="/configuration/attendance"
                className={({ isActive }) =>
                  `rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                    isActive
                      ? "text-[#00DC46] font-bold bg-white/5"
                      : "text-[#F9F7E8]/60 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                Attendance
              </NavLink>
              <NavLink
                to="/configuration/leave"
                className={({ isActive }) =>
                  `rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                    isActive
                      ? "text-[#00DC46] font-bold bg-white/5"
                      : "text-[#F9F7E8]/60 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                Leave
              </NavLink>
              <NavLink
                to="/configuration/workflows"
                className={({ isActive }) =>
                  `rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                    isActive
                      ? "text-[#00DC46] font-bold bg-white/5"
                      : "text-[#F9F7E8]/60 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                Workflows
              </NavLink>
              <NavLink
                to="/configuration/roles-permissions"
                className={({ isActive }) =>
                  `rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                    isActive
                      ? "text-[#00DC46] font-bold bg-white/5"
                      : "text-[#F9F7E8]/60 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                Roles & Permissions
              </NavLink>
            </div>
          )}
        </div>

        {/* PRESERVED MODULES */}
        <NavLink
          to="/reports"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              isActive
                ? "bg-white/10 text-[#00DC46] font-bold"
                : "text-[#F9F7E8]/70 hover:bg-white/5 hover:text-white"
            }`
          }
        >
          <BarChart3 size={17} />
          <span>Reports</span>
        </NavLink>

        <NavLink
          to="/organization"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              isActive
                ? "bg-white/10 text-[#00DC46] font-bold"
                : "text-[#F9F7E8]/70 hover:bg-white/5 hover:text-white"
            }`
          }
        >
          <Building2 size={17} />
          <span>Organization</span>
        </NavLink>

        <NavLink
          to="/audit-logs"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              isActive
                ? "bg-white/10 text-[#00DC46] font-bold"
                : "text-[#F9F7E8]/70 hover:bg-white/5 hover:text-white"
            }`
          }
        >
          <ClipboardList size={17} />
          <span>Audit Logs</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              isActive
                ? "bg-white/10 text-[#00DC46] font-bold"
                : "text-[#F9F7E8]/70 hover:bg-white/5 hover:text-white"
            }`
          }
        >
          <Settings size={17} />
          <span>Settings</span>
        </NavLink>
      </nav>

      {/* USER PERSONA STATUS CARD AT BOTTOM OF SIDEBAR */}
      <div className="mt-auto pt-4 border-t border-white/10">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-2.5">
          <img
            src={user.avatar}
            alt={user.name}
            className="h-9 w-9 rounded-full object-cover border border-[#00DC46]/40"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-white">{user.name}</p>
            <p className="truncate text-[10px] text-[#00DC46] capitalize font-semibold">
              {role.replace("_", " ")}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
