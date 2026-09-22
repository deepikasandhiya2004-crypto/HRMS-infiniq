import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api.js";

const AuthContext = createContext();
const TOKEN_KEY = "hrms_token";

const ALL_ACCESS_ROLES = ["super_admin", "founder_admin", "hr_manager", "hr_executive"];
export const REVIEWER_ROLES = ["manager", ...ALL_ACCESS_ROLES];

function initialsAvatar(name = "") {
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="#00373A"/><text x="50%" y="50%" dy=".35em" text-anchor="middle" font-family="Arial" font-size="26" font-weight="700" fill="#00DC46">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function toUiUser(u) {
  return {
    id: u.id,
    code: u.employee_code,
    name: u.full_name,
    email: u.email,
    role: u.role,
    roleTitle: u.designation,
    department: u.department,
    avatar: initialsAvatar(u.full_name),
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const r = await api.get("/me");
      setUser(toUiUser(r.data.user));
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  async function login(email, password) {
    const r = await api.post("/auth/login", { email, password });
    localStorage.setItem(TOKEN_KEY, r.data.token);
    await loadUser();
  }

    async function signup(full_name, email, password) {
    const r = await api.post("/auth/signup", { full_name, email, password });
    localStorage.setItem(TOKEN_KEY, r.data.token);
    await loadUser();
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }

  const role = user?.role;
  const isReviewer = role ? REVIEWER_ROLES.includes(role) : false;
  const isAllAccess = role ? ALL_ACCESS_ROLES.includes(role) : false;

  return (
    <AuthContext.Provider value={{ user, role, loading, isReviewer, isAllAccess, login,signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}