import React, { useState, useEffect } from "react";
import {
  Workflow,
  Plus,
  Trash2,
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  Clock,
  Shield,
  Save,
  RotateCcw,
} from "lucide-react";
import { hrmsService } from "../../services/hrmsService.js";
import { useToast } from "../../components/Toast.jsx";
import Modal from "../../components/common/Modal.jsx";

export default function WorkflowsConfig() {
  const toast = useToast();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Workflow Editor Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const [wfForm, setWfForm] = useState({
    name: "",
    module: "Leave",
    active: true,
    steps: [],
  });

  const availableRoles = [
    "Reporting Manager",
    "Department Manager",
    "HR Admin",
    "HR Manager",
    "CHRO / Super Admin",
    "IT Systems Admin",
  ];

  useEffect(() => {
    loadWorkflows();
  }, []);

  async function loadWorkflows() {
    try {
      setLoading(true);
      const data = await hrmsService.getConfig("workflows");
      setWorkflows(
  Array.isArray(data)
    ? data
    : Array.isArray(data?.workflows)
      ? data.workflows
      : Array.isArray(data?.approvals)
        ? data.approvals
        : []
); } catch (err) {
      console.error(err);
      toast.error("Failed to load workflow configurations");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      setSaving(true);
      await hrmsService.saveConfig("workflows", workflows);
      toast.success("Approval workflow hierarchies updated successfully!");
    } catch (err) {
      toast.error("Failed to save workflows");
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    if (!window.confirm("Reset workflows to system defaults?")) return;
    try {
      const resetData = await hrmsService.resetConfig("workflows");
  setWorkflows(
  Array.isArray(resetData)
    ? resetData
    : Array.isArray(resetData?.workflows)
      ? resetData.workflows
      : Array.isArray(resetData?.approvals)
        ? resetData.approvals
        : []
);
      toast.info("Workflows reset to default sequences.");
    } catch (err) {
      toast.error("Failed to reset workflows");
    }
  }

  const openAddModal = () => {
    setEditingWorkflow(null);
    setWfForm({
      name: "Custom Approval Flow",
      module: "Leave",
      active: true,
      steps: [
        { level: 1, approverRole: "Reporting Manager", required: true, slaHours: 24 },
        { level: 2, approverRole: "HR Admin", required: true, slaHours: 24 },
      ],
    });
    setModalOpen(true);
  };

  const openEditModal = (wf) => {
    setEditingWorkflow(wf);
    setWfForm(JSON.parse(JSON.stringify(wf)));
    setModalOpen(true);
  };

  const addStep = () => {
    const nextLevel = wfForm.steps.length + 1;
    setWfForm({
      ...wfForm,
      steps: [
        ...wfForm.steps,
        { level: nextLevel, approverRole: "HR Admin", required: true, slaHours: 24 },
      ],
    });
  };

  const removeStep = (index) => {
    const updated = wfForm.steps
      .filter((_, idx) => idx !== index)
      .map((st, i) => ({ ...st, level: i + 1 }));
    setWfForm({ ...wfForm, steps: updated });
  };

  const updateStepRole = (index, role) => {
    const steps = [...wfForm.steps];
    steps[index].approverRole = role;
    setWfForm({ ...wfForm, steps });
  };

  const toggleStepRequired = (index) => {
    const steps = [...wfForm.steps];
    steps[index].required = !steps[index].required;
    setWfForm({ ...wfForm, steps });
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    if (!wfForm.name.trim()) return;

    let updated = [];
    if (editingWorkflow) {
      updated = workflows.map((w) => (w.id === editingWorkflow.id ? { ...wfForm } : w));
    } else {
      updated = [...workflows, { ...wfForm, id: `wf-${Date.now()}` }];
    }

    setWorkflows(updated);
    toast.success(`Workflow ${wfForm.name} updated.`);
    setModalOpen(false);
  };

  const toggleWorkflowActive = (id) => {
    const updated = workflows.map((w) => (w.id === id ? { ...w, active: !w.active } : w));
    setWorkflows(updated);
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-12 text-center text-xs text-slate-500 border border-slate-100">
        Loading workflows...
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl bg-white p-5 border border-[#00373A]/10 shadow-sm">
        <div>
          <h2 className="text-lg font-extrabold text-[#00373A]">Workflows Configuration</h2>
          <p className="text-xs text-slate-500">
            Define multi-level approval hierarchies, role assignment chains, and turnaround SLAs
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

      {/* TOP CONTROLS */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-[#00373A]">
          Active Approval Workflows ({workflows.length})
        </h3>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#00DC46] px-3 py-1.5 text-xs font-extrabold text-[#00373A] hover:bg-[#00DC46]/90 transition"
        >
          <Plus size={14} />
          <span>Add Workflow</span>
        </button>
      </div>

      {/* WORKFLOW CARDS LIST */}
      <div className="space-y-4">
        {workflows.map((wf) => (
          <div
            key={wf.id}
            className="rounded-2xl bg-white p-6 border border-[#00373A]/10 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold text-[#00373A]">{wf.name}</h4>
                  <span className="rounded-md bg-[#00373A]/5 px-2 py-0.5 text-[10px] font-bold text-[#00373A]">
                    Module: {wf.module}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chain depth: {wf.steps.length} sequential approval stage(s)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleWorkflowActive(wf.id)}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                    wf.active
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-100 text-slate-500 border border-slate-200"
                  }`}
                >
                  {wf.active ? "Active" : "Disabled"}
                </button>
                <button
                  type="button"
                  onClick={() => openEditModal(wf)}
                  className="rounded-xl border border-slate-200 px-3 py-1 text-xs font-bold text-[#00373A] hover:bg-slate-50 transition"
                >
                  Edit Hierarchy
                </button>
              </div>
            </div>

            {/* VISUAL APPROVAL CHAIN */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-700 border border-slate-200">
                <span>Employee</span>
              </div>

              {wf.steps.map((st, idx) => (
                <React.Fragment key={idx}>
                  <ArrowRight size={16} className="text-[#00373A]/40 shrink-0" />
                  <div
                    className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs border ${
                      st.required
                        ? "bg-[#00373A] text-white border-[#00373A]"
                        : "bg-white text-slate-700 border-dashed border-slate-300"
                    }`}
                  >
                    <div className="flex flex-col text-left">
                      <span className="font-bold">
                        Level {st.level}: {st.approverRole}
                      </span>
                      <span className="text-[10px] opacity-75">
                        {st.required ? "Required" : "Optional"} • {st.slaHours}h SLA
                      </span>
                    </div>
                  </div>
                </React.Fragment>
              ))}

              <ArrowRight size={16} className="text-[#00373A]/40 shrink-0" />
              <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3.5 py-2 text-xs font-extrabold text-emerald-700 border border-emerald-200">
                <CheckCircle2 size={15} />
                <span>Approved</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT WORKFLOW MODAL */}
      {modalOpen && (
        <Modal
          isOpen={true}
          title={editingWorkflow ? `Edit Workflow: ${editingWorkflow.name}` : "Create Workflow"}
          onClose={() => setModalOpen(false)}
          size="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#00373A] mb-1">Workflow Title</label>
                <input
                  type="text"
                  required
                  value={wfForm.name}
                  onChange={(e) => setWfForm({ ...wfForm, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs font-bold text-[#00373A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#00373A] mb-1">Assigned Module</label>
                <select
                  value={wfForm.module}
                  onChange={(e) => setWfForm({ ...wfForm, module: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs font-bold text-[#00373A] focus:outline-none"
                >
                  <option value="Leave">Leave</option>
                  <option value="Attendance">Attendance</option>
                  <option value="HR Services">HR Services</option>
                  <option value="Employee Requests">Employee Requests</option>
                </select>
              </div>
            </div>

            {/* Steps builder */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-[#00373A]">Sequential Approval Levels</h4>
                <button
                  type="button"
                  onClick={addStep}
                  className="rounded-lg bg-[#00373A]/5 px-2.5 py-1 text-xs font-bold text-[#00373A] hover:bg-[#00373A]/10"
                >
                  + Add Step
                </button>
              </div>

              {wfForm.steps.map((st, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50"
                >
                  <span className="font-extrabold text-[#00373A] text-xs">Step {st.level}</span>

                  <select
                    value={st.approverRole}
                    onChange={(e) => updateStepRole(i, e.target.value)}
                    className="flex-1 rounded-lg border border-slate-200 bg-white p-1.5 text-xs font-bold text-[#00373A] focus:outline-none"
                  >
                    {availableRoles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>

                  <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={st.required}
                      onChange={() => toggleStepRequired(i)}
                      className="h-4 w-4 rounded border-slate-300 text-[#00373A]"
                    />
                    <span>Required</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => removeStep(i)}
                    className="p-1 text-slate-400 hover:text-rose-600"
                    title="Remove step"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
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
                onClick={handleSaveModal}
                className="rounded-xl bg-[#00373A] px-5 py-2 font-bold text-white hover:bg-[#00373A]/90"
              >
                Save Hierarchy
              </button>
            </div>
          </div>
        </Modal>
      )}
    </form>
  );
}
