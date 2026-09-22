import React from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Header() {
  const { user, role, logout } = useAuth();

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-primary/10 bg-cream px-6">
      <div />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 rounded-2xl border border-primary/15 bg-white px-2.5 py-1 shadow-sm">
          <img src={user.avatar} alt={user.name} className="h-7 w-7 rounded-full object-cover border border-accent" />
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-primary leading-tight">{user.name}</p>
            <p className="text-[10px] text-primary/60 capitalize">{role.replace("_", " ")}</p>
          </div>
        </div>
        <button onClick={logout}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/15 bg-white text-primary shadow-sm hover:bg-red-50 hover:text-red-600"
          title="Logout">
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}