import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Bell,
  Sparkles,
  Shield,
  User,
  ChevronDown,
  Check,
  Building,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { user, role, switchRole, allRoles } = useAuth();
  const navigate = useNavigate();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const roleMenuRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target)) {
        setRoleMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifications = [
    {
      id: 1,
      title: "Leave Request Submitted",
      desc: "Aarav Sharma requested 2 days Casual Leave",
      time: "10 mins ago",
      read: false,
    },
    {
      id: 2,
      title: "Onboarding Step Complete",
      desc: "Siddharth Menon completed IT Asset setup",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      title: "HR Service Pending",
      desc: "Salary Certificate requested by Neha Verma",
      time: "Yesterday",
      read: true,
    },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/operations/employees?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-[#00373A]/10 bg-[#F7F5E9] px-6">
      {/* SEARCH BAR */}
      <form
        onSubmit={handleSearchSubmit}
        className="relative flex w-full max-w-md items-center"
      >
        <Search
          size={18}
          className="absolute left-3.5 text-[#00373A]/40 pointer-events-none"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search employees, leaves, service requests..."
          className="h-10 w-full rounded-2xl border border-[#00373A]/15 bg-white pl-10 pr-4 text-xs font-medium text-[#00373A] shadow-sm transition-all placeholder-[#00373A]/40 focus:border-[#00373A] focus:outline-none focus:ring-2 focus:ring-[#00373A]/10"
        />
      </form>

      {/* RIGHT CONTROLS: ROLE SWITCHER & PROFILE */}
      <div className="flex items-center gap-3">
        {/* ROLE SWITCHER PILL */}
        <div className="relative" ref={roleMenuRef}>
          <button
            type="button"
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-2 rounded-2xl border border-[#00373A]/20 bg-white px-3 py-1.5 text-xs font-bold text-[#00373A] shadow-sm transition hover:bg-[#00373A]/5"
          >
            <Shield size={14} className="text-[#00373A]" />
            <span className="hidden sm:inline">Role:</span>
            <span className="rounded-lg bg-[#00373A] px-2 py-0.5 text-[10px] font-extrabold text-[#00DC46] capitalize">
              {role.replace("_", " ")}
            </span>
            <ChevronDown size={14} className="text-[#00373A]/60" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Active Persona
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Test role-specific workflows live
                </p>
              </div>
              <div className="mt-1 flex flex-col gap-1">
                {allRoles.map((r) => {
                  const isSelected = role === r.key;
                  return (
                    <button
                      key={r.key}
                      onClick={() => {
                        switchRole(r.key);
                        setRoleMenuOpen(false);
                      }}
                      className={`flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold transition ${
                        isSelected
                          ? "bg-[#00373A] text-white"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div>
                        <p className="font-bold">{r.label}</p>
                        <p
                          className={`text-[10px] ${
                            isSelected ? "text-[#00DC46]" : "text-slate-400"
                          }`}
                        >
                          {r.roleTitle}
                        </p>
                      </div>
                      {isSelected && <Check size={16} className="text-[#00DC46]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* NOTIFICATIONS DROPDOWN */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#00373A]/15 bg-white text-[#00373A] shadow-sm transition hover:bg-slate-50"
          >
            <Bell size={17} />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#00DC46] text-[9px] font-extrabold text-[#00373A]">
              3
            </span>
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-100 bg-white p-3 shadow-xl z-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-[#00373A]">Notifications</span>
                <span className="text-[10px] text-emerald-600 font-bold">Mark all read</span>
              </div>
              <div className="mt-2 flex flex-col divide-y divide-slate-100">
                {notifications.map((n) => (
                  <div key={n.id} className="py-2 text-xs">
                    <p className="font-bold text-[#00373A]">{n.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{n.desc}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PROFILE CHIP */}
        <div className="flex items-center gap-2.5 rounded-2xl border border-[#00373A]/15 bg-white px-2.5 py-1 shadow-sm">
          <img
            src={user.avatar}
            alt={user.name}
            className="h-7 w-7 rounded-full object-cover border border-[#00DC46]"
          />
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-[#00373A] leading-tight">{user.name}</p>
            <p className="text-[10px] text-[#00373A]/60">{user.department}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
