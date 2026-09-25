import React, { useState, useEffect } from "react";
import {
  Palmtree,
  Plus,
  Edit2,
  Trash2,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { hrmsService } from "../../services/hrmsService.js";
import { useToast } from "../../components/Toast.jsx";
import Modal from "../../components/common/Modal.jsx";

const DEFAULT_LEAVE_CONFIG = {
  types: [],
  rules: {
    minimumNoticeDays: 0,
    maximumConsecutiveDays: 0,
    approvalLevels: "Single-Level (Reporting Manager)",
    weekendSandwich: false,
    holidaySandwich: false,
    allowNegativeBalance: false,
  },
};

function normalizeLeaveConfig(data) {
  const source = data && typeof data === "object" ? data : {};
  const sourceRules =
    source.rules && typeof source.rules === "object" ? source.rules : {};

  return {
    ...DEFAULT_LEAVE_CONFIG,
    ...source,
    types: Array.isArray(source.types) ? source.types : [],
    rules: {
      ...DEFAULT_LEAVE_CONFIG.rules,
      ...sourceRules,
      // Older data may have approvalLevels at the top level.
      approvalLevels:
        sourceRules.approvalLevels ??
        source.approvalLevels ??
        DEFAULT_LEAVE_CONFIG.rules.approvalLevels,
    },
  };
}

export default function LeaveConfig() {
  const toast = useToast();
  const [config, setConfig] = useState(DEFAULT_LEAVE_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [typeForm, setTypeForm] = useState({
    code: "",
    name: "",
    annualAllocation: 12,
    carryForward: false,
    maxCarryForward: 0,
    encashment: false,
    halfDay: true,
    attachmentRequired: false,
    approvalRequired: true,
    active: true,
  });

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    try {
      setLoading(true);
      const data = await hrmsService.getConfig("leave");
      setConfig(normalizeLeaveConfig(data));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load leave configuration");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      setSaving(true);
      const savedConfig = await hrmsService.saveConfig("leave", config);
      if (savedConfig) setConfig(normalizeLeaveConfig(savedConfig));
      toast.success("Leave policies and quotas saved successfully!");
    } catch (err) {
      toast.error("Failed to save leave configuration");
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    if (!window.confirm("Reset leave policy rules to system defaults?")) return;
    try {
      const resetData = await hrmsService.resetConfig("leave");
      setConfig(normalizeLeaveConfig(resetData));
      toast.info("Leave configuration reset to defaults.");
    } catch (err) {
      toast.error("Failed to reset settings");
    }
  }

  const openAddModal = () => {
    setEditingType(null);
    setTypeForm({
      code: "",
      name: "",
      annualAllocation: 10,
      carryForward: false,
      maxCarryForward: 0,
      encashment: false,
      halfDay: true,
      attachmentRequired: false,
      approvalRequired: true,
      active: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (lt) => {
    setEditingType(lt);
    setTypeForm({ ...lt });
    setModalOpen(true);
  };

  const handleSaveTypeModal = (e) => {
    e.preventDefault();
    if (!typeForm.code.trim() || !typeForm.name.trim()) {
      toast.error("Code and Name are required.");
      return;
    }

    let updatedTypes = [];
    if (editingType) {
      updatedTypes = (config.types || []).map((t) => (t.id === editingType.id ? { ...typeForm } : t));
      toast.success(`Updated ${typeForm.name} policy.`);
    } else {
      const newType = {
        ...typeForm,
        id: `lt-${Date.now()}`,
      };
      updatedTypes = [...(config.types || []), newType];
      toast.success(`Added ${typeForm.name} to leave policies.`);
    }

    setConfig({ ...config, types: updatedTypes });
    setModalOpen(false);
  };

  const handleDeleteType = (id) => {
    if (!window.confirm("Are you sure you want to delete this leave type policy?")) return;
    setConfig({
      ...config,
      types: (config.types || []).filter((t) => t.id !== id),
    });
    toast.info("Leave type removed.");
  };

  if (loading || !config) {
    return (
      <div className="rounded-2xl bg-white p-12 text-center text-xs text-slate-500 border border-slate-100">
        Loading leave policies...
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl bg-white p-5 border border-[#00373A]/10 shadow-sm">
        <div>
          <h2 className="text-lg font-extrabold text-[#00373A]">Leave Configuration</h2>
          <p className="text-xs text-slate-500">
            Define corporate leave types, annual quotas, carry-forward caps, and approval policies
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 rounded-xl bg-[#00373A] px-5 py-2 text-xs font-bold text-white hover:bg-[#00373A]/90 transition shadow-sm disabled:opacity-50"
          >
            <Save size={14} />
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: CONFIGURED LEAVE TYPES TABLE */}
      <div className="rounded-2xl bg-white p-6 border border-[#00373A]/10 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-extrabold text-[#00373A] flex items-center gap-2">
            <Palmtree size={16} className="text-[#00DC46]" />
        Configured Leave Types ({(config.types || []).length})
          </h3>
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#00DC46] px-3 py-1.5 text-xs font-extrabold text-[#00373A] hover:bg-[#00DC46]/90 transition"
          >
            <Plus size={14} />
            <span>Add Leave Type</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#00373A]">
            <thead className="bg-[#00373A]/[0.03] uppercase font-bold text-[#00373A]/60">
              <tr>
                <th className="px-3.5 py-2.5">Code</th>
                <th className="px-3.5 py-2.5">Leave Name</th>
                <th className="px-3.5 py-2.5">Annual Quota</th>
                <th className="px-3.5 py-2.5">Carry Forward</th>
                <th className="px-3.5 py-2.5">Encashment</th>
                <th className="px-3.5 py-2.5">Half Day</th>
                <th className="px-3.5 py-2.5">Attachment</th>
                <th className="px-3.5 py-2.5">Status</th>
                <th className="px-3.5 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#00373A]/5">
             {(config.types || []).map((lt) => (
                <tr key={lt.id} className="hover:bg-slate-50">
                  <td className="px-3.5 py-2.5 font-bold font-mono text-[#00373A]">{lt.code}</td>
                  <td className="px-3.5 py-2.5 font-bold text-slate-800">{lt.name}</td>
                  <td className="px-3.5 py-2.5 font-semibold text-slate-700">
                    {lt.annualAllocation} Days
                  </td>
                  <td className="px-3.5 py-2.5">
                    {lt.carryForward ? (
                      <span className="text-emerald-700 font-semibold">Yes (Max {lt.maxCarryForward}d)</span>
                    ) : (
                      <span className="text-slate-400">No</span>
                    )}
                  </td>
                  <td className="px-3.5 py-2.5">
                    {lt.encashment ? (
                      <span className="text-purple-700 font-semibold">Yes</span>
                    ) : (
                      <span className="text-slate-400">No</span>
                    )}
                  </td>
                  <td className="px-3.5 py-2.5">{lt.halfDay ? "Allowed" : "No"}</td>
                  <td className="px-3.5 py-2.5">{lt.attachmentRequired ? "Required" : "Optional"}</td>
                  <td className="px-3.5 py-2.5">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        lt.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {lt.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(lt)}
                        className="p-1 hover:text-[#00373A] text-slate-400"
                        title="Edit Policy"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteType(lt.id)}
                        className="p-1 hover:text-rose-600 text-slate-400"
                        title="Delete Policy"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: LEAVE RULES & POLICIES */}
      <div className="rounded-2xl bg-white p-6 border border-[#00373A]/10 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-[#00373A] flex items-center gap-2 border-b border-slate-100 pb-3">
          <AlertCircle size={16} className="text-[#00DC46]" />
          Leave Business Rules & Guidelines
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-[#00373A] mb-1">
              Minimum Notice Period (Days)
            </label>
            <input
              type="number"
              min="0"
              max="30"
            value={config.rules?.minimumNoticeDays ?? 0}
              onChange={(e) =>
                setConfig({
                  ...config,
                 rules: { ...(config.rules || {}), minimumNoticeDays: Number(e.target.value) },
                })
              }
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-[#00373A] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-[#00373A] mb-1">
              Maximum Consecutive Leave Days
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={config.rules?.maximumConsecutiveDays ?? 0}
              onChange={(e) =>
                setConfig({
                  ...config,
                  rules: { ...(config.rules || {}), maximumConsecutiveDays: Number(e.target.value) },
                })
              }
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-[#00373A] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-[#00373A] mb-1">Approval Levels Hierarchy</label>
            <select
             value={config.rules?.approvalLevels ?? ""}
              onChange={(e) =>
                setConfig({
                  ...config,
               rules: {
  ...(config.rules || {}),
  approvalLevels: e.target.value,
},
                })
              }
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-[#00373A] focus:outline-none"
            >
              <option value="Single-Level (Reporting Manager)">Single-Level (Reporting Manager)</option>
              <option value="Two-Level (Reporting Manager → HR)">Two-Level (Reporting Manager → HR)</option>
              <option value="Three-Level (Manager → Dept Head → HR)">Three-Level (Manager → Dept Head → HR)</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50">
            <div>
              <p className="font-bold text-[#00373A]">Weekend Sandwich Rule</p>
              <p className="text-[11px] text-slate-500">Count intervening weekends as leaves</p>
            </div>
            <input
              type="checkbox"
             checked={config.rules?.weekendSandwich ?? false}
              onChange={(e) =>
                setConfig({
                  ...config,
                  rules: { ...(config.rules || {}), weekendSandwich: e.target.checked },
                })
              }
              className="h-5 w-5 rounded border-slate-300 text-[#00373A] focus:ring-[#00373A]"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50">
            <div>
              <p className="font-bold text-[#00373A]">Holiday Sandwich Rule</p>
              <p className="text-[11px] text-slate-500">Count public holidays as leaves</p>
            </div>
            <input
              type="checkbox"
             checked={config.rules?.holidaySandwich ?? false}
              onChange={(e) =>
                setConfig({
                  ...config,
                  rules: { ...(config.rules || {}), holidaySandwich: e.target.checked },
                })
              }
              className="h-5 w-5 rounded border-slate-300 text-[#00373A] focus:ring-[#00373A]"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50">
            <div>
              <p className="font-bold text-[#00373A]">Allow Negative Balance</p>
              <p className="text-[11px] text-slate-500">Advance leave against future accrual</p>
            </div>
            <input
              type="checkbox"
              checked={config.rules?.allowNegativeBalance ?? false}
              onChange={(e) =>
                setConfig({
                  ...config,
                  rules: { ...(config.rules || {}), allowNegativeBalance: e.target.checked },
                })
              }
              className="h-5 w-5 rounded border-slate-300 text-[#00373A] focus:ring-[#00373A]"
            />
          </div>
        </div>
      </div>

      {/* ADD / EDIT LEAVE TYPE MODAL */}
      {modalOpen && (
        <Modal
          isOpen={true}
          title={editingType ? `Edit Leave Type: ${editingType.name}` : "Create New Leave Policy"}
          onClose={() => setModalOpen(false)}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#00373A] mb-1">Leave Code (e.g. ML)</label>
                <input
                  type="text"
                  required
                  value={typeForm.code}
                  onChange={(e) => setTypeForm({ ...typeForm, code: e.target.value.toUpperCase() })}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs font-mono font-bold focus:outline-none focus:border-[#00373A]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#00373A] mb-1">Leave Policy Name</label>
                <input
                  type="text"
                  required
                  value={typeForm.name}
                  onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                  placeholder="e.g. Maternity Leave"
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs focus:outline-none focus:border-[#00373A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#00373A] mb-1">Annual Allocation (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={typeForm.annualAllocation}
                  onChange={(e) =>
                    setTypeForm({ ...typeForm, annualAllocation: Number(e.target.value) })
                  }
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#00373A] mb-1">Max Carry Forward (Days)</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={typeForm.maxCarryForward}
                  onChange={(e) =>
                    setTypeForm({ ...typeForm, maxCarryForward: Number(e.target.value) })
                  }
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={typeForm.carryForward}
                  onChange={(e) => setTypeForm({ ...typeForm, carryForward: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-[#00373A]"
                />
                <span>Allow Annual Carry-Forward</span>
              </label>

              <label className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={typeForm.encashment}
                  onChange={(e) => setTypeForm({ ...typeForm, encashment: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-[#00373A]"
                />
                <span>Eligible for Salary Encashment</span>
              </label>

              <label className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={typeForm.halfDay}
                  onChange={(e) => setTypeForm({ ...typeForm, halfDay: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-[#00373A]"
                />
                <span>Allow Half-Day Submissions</span>
              </label>

              <label className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={typeForm.attachmentRequired}
                  onChange={(e) =>
                    setTypeForm({ ...typeForm, attachmentRequired: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-[#00373A]"
                />
                <span>Require Supporting Medical / Legal Document</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTypeModal}
                className="rounded-xl bg-[#00373A] px-4 py-2 font-bold text-white hover:bg-[#00373A]/90"
              >
                Save Leave Type
              </button>
            </div>
          </div>
        </Modal>
      )}
    </form>
  );
}
