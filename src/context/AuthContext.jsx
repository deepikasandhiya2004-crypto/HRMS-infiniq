import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../services/api.js";

const AuthContext = createContext();

const STORAGE_KEY = "hrms_dev_user_id";

// TEMPORARY: test personas mapped to the seeded employees in the database.
// The key is the backend role name. Remove this when real login is built.
const DEV_PERSONAS = {
  employee: { id: 4, label: "Iniya", roleTitle: "UI/UX Designer" },
  manager: { id: 1, label: "Arun Kumar", roleTitle: "Design Lead" },
  hr_manager: { id: 2, label: "Meena Rao", roleTitle: "HR Manager" },
  founder_admin: { id: 3, label: "Karthik S", roleTitle: "Founder" },
};
const DEFAULT_PERSONA = "hr_manager";

// Roles that can access everything. Keep in sync with server/config/roles.js
const ALL_ACCESS_ROLES = ["super_admin", "founder_admin", "hr_manager", "hr_executive"];

// Simple initials avatar (no photos in the database yet)
function initialsAvatar(name = "") {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("")
    .replace(/[^\p{L}\p{N}]/gu, "");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="#00373A"/><text x="50%" y="50%" dy=".35em" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="#00DC46">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Backend user -> the shape the existing components already expect
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

async function fetchMe() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, String(DEV_PERSONAS[DEFAULT_PERSONA].id));
  }
  try {
    return (await api.get("/me")).data.user;
  } catch (err) {
    if (err.status !== 401) throw err;
    // Saved id is not a valid employee any more: go back to the default persona
    localStorage.setItem(STORAGE_KEY, String(DEV_PERSONAS[DEFAULT_PERSONA].id));
    return (await api.get("/me")).data.user;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUser = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setUser(toUiUser(await fetchMe()));
    } catch (err) {
      setUser(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const switchRole = (roleKey) => {
    if (!Object.hasOwn(DEV_PERSONAS, roleKey)) return;
    localStorage.setItem(STORAGE_KEY, String(DEV_PERSONAS[roleKey].id));
    loadUser();
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F7F5E9] font-gellix text-sm font-semibold text-[#00373A]">
        Loading your workspace…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-[#F7F5E9] font-gellix text-[#00373A]">
        <p className="text-sm font-bold">Could not load your account</p>
        <p className="text-xs text-[#00373A]/70">{error}</p>
        <button
          type="button"
          onClick={loadUser}
          className="rounded-xl bg-[#00373A] px-4 py-2 text-xs font-bold text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  const role = user.role;

  const hasPermission = (module, action = "view") => {
    if (ALL_ACCESS_ROLES.includes(role)) return true;

    if (role === "manager") {
      if (module === "leave") return true;
      if (module === "team") return true;
      if (module === "attendance") return true;
      if (module === "operations" && (action === "view" || action === "approve")) return true;
      if (module === "configuration") return false;
      return true;
    }

    // Employee
    if (module === "leave" && (action === "view" || action === "apply")) return true;
    if (module === "operations" && action === "request") return true;
    if (module === "configuration") return false;
    if (module === "audit-logs") return false;
    return ["dashboard", "attendance", "leave", "operations"].includes(module);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        switchRole,
        hasPermission,
        allRoles: Object.entries(DEV_PERSONAS).map(([key, p]) => ({
          key,
          label: p.label,
          roleTitle: p.roleTitle,
          role: key,
        })),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}