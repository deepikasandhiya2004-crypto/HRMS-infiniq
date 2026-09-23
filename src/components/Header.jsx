import React, { useState, useRef, useEffect } from "react";
import { Search, Bell, User, ShieldCheck, Settings as SettingsIcon, LogOut, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Header() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-primary/10 bg-cream px-6 gap-4">
      <div className="relative flex-1 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" />
        <input
          disabled
          placeholder="Search employees, modules..."
          className="w-full rounded-xl border border-primary/15 bg-white pl-9 pr-3 py-2 text-xs text-primary/60 placeholder:text-primary/30 cursor-not-allowed"
        />
      </div>

      <div className="flex items-center gap-3">
        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-primary/15 bg-white text-primary/60" disabled title="Notifications (coming soon)">
          <Bell size={16} />
        </button>

        <div className="relative" ref={ref}>
          <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 rounded-2xl border border-primary/15 bg-white px-2 py-1 shadow-sm hover:bg-primary/5">
            <img src={user.avatar} alt={user.name} className="h-7 w-7 rounded-full object-cover border border-accent" />
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-primary leading-tight">{user.name}</p>
              <p className="text-[10px] text-primary/60 capitalize">{role.replace(/_/g, " ")}</p>
            </div>
            <ChevronDown size={14} className="text-primary/50" />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl z-50">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-primary">{user.name}</p>
                <p className="text-[11px] text-primary/50">{user.email}</p>
              </div>
              <button onClick={() => { setOpen(false); navigate("/settings"); }} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-primary/80 hover:bg-primary/5">
                <User size={15} /> My Profile
              </button>
              <button disabled className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-primary/30 cursor-not-allowed">
                <ShieldCheck size={15} /> Security & 2FA
              </button>
              <button onClick={() => { setOpen(false); navigate("/settings"); }} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-primary/80 hover:bg-primary/5">
                <SettingsIcon size={15} /> Notification Settings
              </button>
              <div className="my-1 border-t border-slate-100" />
              <button onClick={logout} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50">
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}