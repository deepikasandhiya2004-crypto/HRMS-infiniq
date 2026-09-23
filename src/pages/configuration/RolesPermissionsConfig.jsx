import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Shield,
  Save,
  RotateCcw,
  Check,
  X,
  Lock,
  Unlock,
  CheckCircle2,
  Users,
  Eye,
  PlusCircle,
  Edit,
  Trash2,
  CheckSquare,
  Square,
  HelpCircle,
} from "lucide-react";
import { hrmsService } from "../../services/hrmsService.js";
import { useToast } from "../../components/Toast.jsx";

const ROLE_DESCRIPTIONS = {
  "Super Admin": "Unrestricted administrative root access across all modules, configuration settings, governance, and audit trails.",
  "HR Admin": "Full operational authority over employee lifecycles, leave processing, HR helpdesks, and general system configuration.",
  "HR Manager": "Departmental HR operations, employee onboarding and offboarding management, team leave approvals, and request resolutions.",
  "Manager": "Direct line manager supervision, shift schedule reviews, team leave approvals, and employee attendance monitoring.",
  "Employee": "Self-service portal access for personal leave applications, balance monitoring, attendance logs, and internal service requests.",
};

const ACTION_LABELS = [
  { key: "view", label: "View", icon: Eye, color: "text-blue-600 bg-blue-50 border-blue-200" },
  { key: "create", label: "Create", icon: PlusCircle, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { key: "edit", label: "Edit", icon: Edit, color: "text-amber-600 bg-amber-50 border-amber-200" },
  { key: "delete", label: "Delete", icon: Trash2, color: "text-rose-600 bg-rose-50 border-rose-200" },
  { key: "approve", label: "Approve", icon: CheckCircle2, color: "text-purple-600 bg-purple-50 border-purple-200" },
];

export default function RolesPermissionsConfig() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeRole, setActiveRole] = useState("Super Admin");
  const [permissions, setPermissions] = useState({
    roles: ["Super Admin", "HR Admin", "HR Manager", "Manager", "Employee"],
    modules: [
      "Dashboard",
      "Team",
      "Attendance",
      "Leave",
      "Operations",
      "Configuration",
      "Reports",
      "Audit Logs",
    ],
    matrix: {},
  });

  useEffect(() => {
    loadPermissions();
  }, []);

  async function loadPermissions() {
    try {
      setLoading(true);
      const data = await hrmsService.getConfig("permissions");
      if (data && data.matrix) {
        setPermissions(data);
        if (data.roles && data.roles.length > 0 && !data.roles.includes(activeRole)) {
          setActiveRole(data.roles[0]);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load permissions configuration");
    } finally {
      setLoading(false);
    }
  }

  // Toggle single permission
  const handleToggle = (role, moduleName, action) => {
    // Prevent locking out Super Admin view/edit on Configuration
    if (role === "Super Admin" && moduleName === "Configuration" && action === "view") {
      toast.warning("Super Admin view access on Configuration cannot be revoked.");
      return;
    }

    setPermissions((prev) => {
      const currentVal = prev.matrix?.[role]?.[moduleName]?.[action] || false;
      return {
        ...prev,
        matrix: {
          ...prev.matrix,
          [role]: {
            ...prev.matrix?.[role],
            [moduleName]: {
              ...(prev.matrix?.[role]?.[moduleName] || {}),
              [action]: !currentVal,
            },
          },
        },
      };
    });
  };

  // Toggle entire module (all 5 actions) for current role
  const handleToggleModule = (role, moduleName) => {
    const currentActions = permissions.matrix?.[role]?.[moduleName] || {};
    const allChecked = ACTION_LABELS.every((act) => currentActions[act.key]);

    const newActions = {};
    ACTION_LABELS.forEach((act) => {
      newActions[act.key] = !allChecked;
    });

    setPermissions((prev) => ({
      ...prev,
      matrix: {
        ...prev.matrix,
        [role]: {
          ...prev.matrix?.[role],
          [moduleName]: newActions,
        },
      },
    }));
  };

  // Toggle entire action column for all modules in current role
  const handleToggleColumn = (role, action) => {
    const modules = permissions.modules || [];
    const allChecked = modules.every((m) => permissions.matrix?.[role]?.[m]?.[action]);

    setPermissions((prev) => {
      const updatedRoleMatrix = { ...(prev.matrix?.[role] || {}) };
      modules.forEach((m) => {
        updatedRoleMatrix[m] = {
          ...(updatedRoleMatrix[m] || {}),
          [action]: !allChecked,
        };
      });
      return {
        ...prev,
        matrix: {
          ...prev.matrix,
          [role]: updatedRoleMatrix,
        },
      };
    });
  };

  // Select all permissions for current role
  const handleSelectAllRole = (role) => {
    setPermissions((prev) => {
      const updatedRoleMatrix = {};
      (prev.modules || []).forEach((m) => {
        updatedRoleMatrix[m] = {
          view: true,
          create: true,
          edit: true,
          delete: true,
          approve: true,
        };
      });
      return {
        ...prev,
        matrix: {
          ...prev.matrix,
          [role]: updatedRoleMatrix,
        },
      };
    });
    toast.info(`Granted all permissions to ${role}`);
  };

  // Clear all permissions for current role
  const handleClearAllRole = (role) => {
    if (role === "Super Admin") {
      toast.warning("Super Admin cannot have all permissions revoked.");
      return;
    }
    setPermissions((prev) => {
      const updatedRoleMatrix = {};
      (prev.modules || []).forEach((m) => {
        updatedRoleMatrix[m] = {
          view: false,
          create: false,
          edit: false,
          delete: false,
          approve: false,
        };
      });
      return {
        ...prev,
        matrix: {
          ...prev.matrix,
          [role]: updatedRoleMatrix,
        },
      };
    });
    toast.info(`Cleared all permissions for ${role}`);
  };

  // Save changes
  async function handleSave(e) {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      await hrmsService.saveConfig("permissions", permissions);
      toast.success("Role-Based Access Control matrix updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save permissions matrix");
    } finally {
      setSaving(false);
    }
  }

  // Reset to default
  async function handleReset() {
    if (!window.confirm("Are you sure you want to reset all role permissions to system defaults?")) {
      return;
    }
    try {
      const resetData = await hrmsService.resetConfig("permissions");
      setPermissions(resetData);
      toast.info("Permissions reset to initial factory configuration.");
    } catch (err) {
      toast.error("Failed to reset permissions matrix");
    }
  }

  // Calculate permission stats for active role
  const currentRoleMatrix = permissions.matrix?.[activeRole] || {};
  const totalPossible = (permissions.modules?.length || 8) * 5;
  let activeCount = 0;
  (permissions.modules || []).forEach((m) => {
    ACTION_LABELS.forEach((a) => {
      if (currentRoleMatrix[m]?.[a.key]) activeCount++;
    });
  });
  const percentage = Math.round((activeCount / totalPossible) * 100);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-white p-6 shadow-sm border border-[#00373A]/10">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00373A] border-t-transparent"></div>
          <p className="text-xs text-slate-500">Loading access control policy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* SECTION BANNER */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl bg-white p-5 border border-[#00373A]/10 shadow-sm md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00373A]/10 text-[#00373A]">
              <ShieldCheck size={18} />
            </span>
            <h2 className="text-lg font-extrabold text-[#00373A]">
              Roles & Permissions Matrix
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Define granular access permissions across system modules for each organizational role
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <RotateCcw size={14} />
            Reset Defaults
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-xl bg-[#00373A] px-4 py-2 text-xs font-bold text-white hover:bg-[#002729] transition shadow-sm disabled:opacity-50"
          >
            <Save size={14} className="text-[#00DC46]" />
            {saving ? "Saving Changes..." : "Save Matrix"}
          </button>
        </div>
      </div>

      {/* ROLE TABS SELECTOR */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {permissions.roles.map((role) => {
          const isSelected = activeRole === role;
          const roleMatrix = permissions.matrix?.[role] || {};
          let count = 0;
          (permissions.modules || []).forEach((m) => {
            ACTION_LABELS.forEach((a) => {
              if (roleMatrix[m]?.[a.key]) count++;
            });
          });

          return (
            <button
              key={role}
              type="button"
              onClick={() => setActiveRole(role)}
              className={`flex flex-col items-start rounded-xl p-3.5 text-left border transition ${
                isSelected
                  ? "bg-[#00373A] text-white border-[#00373A] shadow-md ring-2 ring-[#00DC46]/40"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-xs font-extrabold ${isSelected ? "text-white" : "text-slate-800"}`}>
                  {role}
                </span>
                <Shield
                  size={14}
                  className={isSelected ? "text-[#00DC46]" : "text-slate-400"}
                />
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-[10px]">
                <span
                  className={`inline-block px-1.5 py-0.5 rounded font-mono font-bold ${
                    isSelected
                      ? "bg-white/15 text-[#00DC46]"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {count} / {totalPossible}
                </span>
                <span className={isSelected ? "text-white/70" : "text-slate-400"}>
                  actions
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ACTIVE ROLE PROFILE & QUICK ACTIONS */}
      <div className="rounded-2xl bg-white p-5 border border-[#00373A]/10 shadow-sm space-y-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#00DC46]/20 px-2 py-0.5 text-[11px] font-extrabold text-[#00373A]">
                ACTIVE ROLE
              </span>
              <h3 className="text-base font-extrabold text-[#00373A]">{activeRole}</h3>
            </div>
            <p className="mt-1 text-xs text-slate-500 max-w-2xl">
              {ROLE_DESCRIPTIONS[activeRole] || "Permissions governance profile for " + activeRole}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleSelectAllRole(activeRole)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              <CheckSquare size={13} className="text-emerald-600" />
              Select All
            </button>
            <button
              type="button"
              onClick={() => handleClearAllRole(activeRole)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              <Square size={13} className="text-rose-600" />
              Clear All
            </button>
          </div>
        </div>

        {/* PROGRESS METER */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600">Access Coverage</span>
            <span className="font-bold text-[#00373A]">
              {activeCount} of {totalPossible} permissions enabled ({percentage}%)
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                percentage > 75
                  ? "bg-emerald-500"
                  : percentage > 30
                  ? "bg-amber-500"
                  : "bg-blue-500"
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* PERMISSIONS MATRIX TABLE */}
      <div className="overflow-hidden rounded-2xl bg-white border border-[#00373A]/10 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-[#00373A]/5">
                <th className="py-3.5 px-4 font-extrabold text-[#00373A] w-1/3">
                  SYSTEM MODULE
                </th>
                {ACTION_LABELS.map((act) => {
                  const Icon = act.icon;
                  const modules = permissions.modules || [];
                  const allChecked = modules.every(
                    (m) => permissions.matrix?.[activeRole]?.[m]?.[act.key]
                  );

                  return (
                    <th key={act.key} className="py-3.5 px-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleColumn(activeRole, act.key)}
                          title={`Toggle column: ${act.label} for all modules`}
                          className="flex items-center gap-1 font-bold text-slate-700 hover:text-[#00373A] transition"
                        >
                          <Icon size={13} />
                          <span>{act.label}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleColumn(activeRole, act.key)}
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono transition ${
                            allChecked
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        >
                          {allChecked ? "All On" : "Toggle"}
                        </button>
                      </div>
                    </th>
                  );
                })}
                <th className="py-3.5 px-4 text-right font-bold text-slate-500">
                  Quick Row
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(permissions.modules || []).map((mod) => {
                const currentActions = permissions.matrix?.[activeRole]?.[mod] || {};
                const allRowChecked = ACTION_LABELS.every((act) => currentActions[act.key]);

                return (
                  <tr
                    key={mod}
                    className="hover:bg-slate-50/70 transition group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-[#00373A] text-sm">
                        {mod}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {mod === "Dashboard" && "Metrics, executive widgets & summaries"}
                        {mod === "Team" && "Employee directory & organizational hierarchy"}
                        {mod === "Attendance" && "Punch times, timesheets & overtime logs"}
                        {mod === "Leave" && "Time-off balances, requests & team calendar"}
                        {mod === "Operations" && "Employee management, onboarding & requests"}
                        {mod === "Configuration" && "Policies, attendance thresholds & roles"}
                        {mod === "Reports" && "Analytics, audit logs & CSV export exports"}
                        {mod === "Audit Logs" && "Immutable security trail & compliance logs"}
                      </div>
                    </td>

                    {ACTION_LABELS.map((act) => {
                      const isChecked = !!currentActions[act.key];
                      const isProtected =
                        activeRole === "Super Admin" &&
                        mod === "Configuration" &&
                        act.key === "view";

                      return (
                        <td key={act.key} className="py-3.5 px-3 text-center">
                          <button
                            type="button"
                            disabled={isProtected}
                            onClick={() => handleToggle(activeRole, mod, act.key)}
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-lg transition ${
                              isChecked
                                ? "bg-[#00373A] text-[#00DC46] shadow-sm hover:bg-[#002729]"
                                : "bg-slate-100 text-slate-300 hover:bg-slate-200"
                            } ${isProtected ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}`}
                            title={
                              isProtected
                                ? "Super Admin view on Configuration is permanent"
                                : `${isChecked ? "Revoke" : "Grant"} ${act.label} permission for ${mod}`
                            }
                          >
                            {isChecked ? (
                              <Check size={16} className="stroke-[3]" />
                            ) : (
                              <X size={14} className="stroke-[2]" />
                            )}
                          </button>
                        </td>
                      );
                    })}

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleModule(activeRole, mod)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                          allRowChecked
                            ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        {allRowChecked ? "Revoke Row" : "Grant Row"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* TABLE FOOTER SUMMARY */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 p-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Lock size={14} className="text-slate-400" />
            <span>
              Changes to security privileges take effect immediately across all active user sessions upon saving.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-600 font-medium">
              <span className="h-2 w-2 rounded-full bg-[#00DC46]"></span>
              Granted
            </span>
            <span className="flex items-center gap-1 text-slate-600 font-medium">
              <span className="h-2 w-2 rounded-full bg-slate-300"></span>
              Revoked
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
