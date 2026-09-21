import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const DEMO_USERS = {
  employee: {
    id: "EMP-1004",
    name: "Aarav Sharma",
    email: "aarav.sharma@infiniq.com",
    role: "employee",
    roleTitle: "Senior Frontend Engineer",
    department: "Engineering",
    location: "Bangalore (HQ)",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    manager: "Vikram Malhotra",
  },
  manager: {
    id: "EMP-1002",
    name: "Vikram Malhotra",
    email: "vikram.m@infiniq.com",
    role: "manager",
    roleTitle: "Engineering Director",
    department: "Engineering",
    location: "Bangalore (HQ)",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    manager: "Super Admin",
  },
  hr_admin: {
    id: "EMP-1003",
    name: "Priya Nair",
    email: "priya.nair@infiniq.com",
    role: "hr_admin",
    roleTitle: "HR Lead & Operations Head",
    department: "Human Resources",
    location: "Bangalore (HQ)",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    manager: "Super Admin",
  },
  super_admin: {
    id: "EMP-1001",
    name: "Deepika Sandhiya",
    email: "admin@infiniq.com",
    role: "super_admin",
    roleTitle: "Chief Human Resources Officer (CHRO)",
    department: "Executive Leadership",
    location: "Global HQ",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    manager: "Board of Directors",
  },
};

export function AuthProvider({ children }) {
  const [currentUserRole, setCurrentUserRole] = useState(() => {
    return localStorage.getItem("infiniq_hrms_role") || "hr_admin";
  });

  const currentUser = DEMO_USERS[currentUserRole] || DEMO_USERS.hr_admin;

  const switchRole = (roleKey) => {
    if (DEMO_USERS[roleKey]) {
      setCurrentUserRole(roleKey);
      localStorage.setItem("infiniq_hrms_role", roleKey);
    }
  };

  const hasPermission = (module, action = "view") => {
    if (currentUserRole === "super_admin") return true;
    if (currentUserRole === "hr_admin") return true;

    if (currentUserRole === "manager") {
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
        user: currentUser,
        role: currentUserRole,
        switchRole,
        hasPermission,
        allRoles: Object.keys(DEMO_USERS).map((k) => ({
          key: k,
          label: DEMO_USERS[k].name,
          roleTitle: DEMO_USERS[k].roleTitle,
          role: DEMO_USERS[k].role,
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
