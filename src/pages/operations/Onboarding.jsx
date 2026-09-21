import React, { useState, useEffect } from "react";
import {
  UserPlus,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ArrowRight,
  Shield,
  Laptop,
  FileText,
  UserCheck,
  Send,
  Building,
} from "lucide-react";
import { hrmsService } from "../../services/hrmsService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../components/Toast.jsx";
import StatCard from "../../components/common/StatCard.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import SearchBar from "../../components/common/SearchBar.jsx";
import DataTable from "../../components/common/DataTable.jsx";
import Modal from "../../components/common/Modal.jsx";

export default function Onboarding() {
  const { user } = useAuth();
  const toast = useToast();

  const [onboardingList, setOnboardingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Workflow Runner Modal
  const [activeWorkflow, setActiveWorkflow] = useState(null);
  const [stageNotes, setStageNotes] = useState("");
  const [advancing, setAdvancing] = useState(false);

  useEffect(() => {
    loadOnboarding();
    const handleStorage = (e) => {
      if (e.detail?.key?.includes("onboarding")) loadOnboarding();
    };
    window.addEventListener("hrms_storage_change", handleStorage);
    return () => window.removeEventListener("hrms_storage_change", handleStorage);
  }, []);

  async function loadOnboarding() {
    try {
      setLoading(true);
      const data = await hrmsService.getOnboarding();
      setOnboardingList(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load onboarding workflows");
    } finally {
      setLoading(false);
    }
  }

  // Handle stage advancement
  async function handleAdvanceStage() {
    if (!activeWorkflow) return;
    try {
      setAdvancing(true);
      await hrmsService.advanceOnboardingStage(
        activeWorkflow.id,
        activeWorkflow.stageIndex,
        stageNotes
      );
      toast.success(
        `Advanced onboarding for ${activeWorkflow.employeeName} to next stage!`
      );
      setStageNotes("");
      const updatedList = await hrmsService.getOnboarding();
      setOnboardingList(updatedList);
      const refreshed = updatedList.find((item) => item.id === activeWorkflow.id);
      setActiveWorkflow(refreshed || null);
    } catch (err) {
      toast.error("Failed to advance onboarding stage");
    } finally {
      setAdvancing(false);
    }
  }

  // Summary Metrics
  const totalCount = onboardingList.length;
  const inProgressCount = onboardingList.filter((o) => o.status === "In Progress").length;
  const completedCount = onboardingList.filter((o) => o.status === "Completed").length;
  const pendingCount = onboardingList.filter((o) => o.stageIndex <= 3).length;

  // Filtered dataset
  const filteredList = onboardingList.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.employeeName.toLowerCase().includes(q) ||
      o.department.toLowerCase().includes(q) ||
      o.currentStage.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      key: "employeeName",
      header: "Employee",
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-bold text-[#00373A]">{val}</span>
          <p className="text-[11px] text-slate-400">{row.email}</p>
        </div>
      ),
    },
    {
      key: "department",
      header: "Department & Role",
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-semibold text-slate-800">{row.designation}</span>
          <p className="text-[11px] text-[#00373A]/70">{val}</p>
        </div>
      ),
    },
    {
      key: "joiningDate",
      header: "Target Joining Date",
      sortable: true,
      render: (val) => <span className="font-medium text-slate-700">{val}</span>,
    },
    {
      key: "currentStage",
      header: "Current Stage",
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-bold text-[#00373A]">{val}</span>
          <p className="text-[10px] font-semibold text-slate-400">
            Stage {row.stageIndex} of 7
          </p>
        </div>
      ),
    },
    {
      key: "progress",
      header: "Progress",
      sortable: true,
      render: (val) => (
        <div className="w-32">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1">
            <span>{val}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full transition-all ${
                val === 100 ? "bg-emerald-500" : "bg-[#00DC46]"
              }`}
              style={{ width: `${val}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "assignedHr",
      header: "Assigned HR",
      render: (val) => <span className="text-xs text-slate-700">{val}</span>,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (_, row) => (
        <button
          type="button"
          onClick={() => {
            setActiveWorkflow(row);
            setStageNotes("");
          }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#00373A] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#00373A]/90 transition"
        >
          <span>{row.status === "Completed" ? "View Workflow" : "Continue"}</span>
          <ChevronRight size={14} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI STAT CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Onboardings"
          value={totalCount}
          subtitle="Pipeline overview"
          icon={UserPlus}
          accentColor="#00373A"
        />
        <StatCard
          title="In Progress"
          value={inProgressCount}
          subtitle="Active setups in motion"
          icon={Clock}
          accentColor="#00DC46"
        />
        <StatCard
          title="Pending Documents"
          value={pendingCount}
          subtitle="Awaiting candidate submissions"
          icon={AlertCircle}
          accentColor="#FF6A3D"
        />
        <StatCard
          title="Completed Hires"
          value={completedCount}
          subtitle="Successfully inducted"
          icon={CheckCircle2}
          accentColor="#7C3AED"
        />
      </div>

      {/* FILTER & SEARCH */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl bg-white p-4 border border-[#00373A]/10 shadow-sm">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search onboarding by candidate name, role, department..."
          className="w-full sm:w-80"
        />
        <div className="text-xs text-slate-500">
          Showing <strong>{filteredList.length}</strong> active pipelines
        </div>
      </div>

      {/* ONBOARDING TABLE */}
      <DataTable
        columns={columns}
        data={filteredList}
        loading={loading}
        defaultPageSize={10}
        emptyTitle="No onboarding workflows found"
        emptyDescription="All new candidates have either completed induction or no matching pipeline was found."
      />

      {/* WORKFLOW STEP RUNNER MODAL */}
      {activeWorkflow && (
        <Modal
          isOpen={true}
          title={`Onboarding Pipeline: ${activeWorkflow.employeeName}`}
          onClose={() => setActiveWorkflow(null)}
          size="lg"
        >
          <div className="space-y-6">
            {/* Candidate Summary Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-[#00373A]">
                  {activeWorkflow.employeeName}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  {activeWorkflow.designation} • {activeWorkflow.department}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Joining: {activeWorkflow.joiningDate} • Assigned HR: {activeWorkflow.assignedHr}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400">Overall Progress</span>
                <p className="text-lg font-black text-[#00373A]">{activeWorkflow.progress}%</p>
                <StatusBadge status={activeWorkflow.status} size="sm" />
              </div>
            </div>

            {/* 7-STAGE PROGRESSION STEPPER */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Onboarding Lifecycle (7 Stages)
              </h4>
              <div className="space-y-3">
                {activeWorkflow.stages.map((stage) => {
                  const isCompleted = stage.status === "completed";
                  const isCurrent = stage.status === "in_progress";
                  const isPending = stage.status === "pending";

                  return (
                    <div
                      key={stage.id}
                      className={`flex items-start justify-between p-3 rounded-xl border transition ${
                        isCurrent
                          ? "border-[#00373A] bg-[#00373A]/5 shadow-xs"
                          : isCompleted
                          ? "border-emerald-100 bg-emerald-50/40"
                          : "border-slate-100 bg-slate-50/50 opacity-60"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            isCompleted
                              ? "bg-emerald-600 text-white"
                              : isCurrent
                              ? "bg-[#00373A] text-white animate-pulse"
                              : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          {isCompleted ? "✓" : stage.id}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs font-extrabold text-[#00373A]">
                              {stage.name}
                            </h5>
                            {isCurrent && (
                              <span className="rounded-full bg-[#00373A] px-2 py-0.5 text-[9px] font-bold text-[#00DC46]">
                                Current Action
                              </span>
                            )}
                          </div>
                          {stage.notes && (
                            <p className="mt-1 text-[11px] text-slate-600 italic">
                              "{stage.notes}"
                            </p>
                          )}
                          {stage.date && (
                            <p className="mt-0.5 text-[10px] text-slate-400">
                              Updated on: {stage.date}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider ${
                            isCompleted
                              ? "text-emerald-700"
                              : isCurrent
                              ? "text-[#00373A]"
                              : "text-slate-400"
                          }`}
                        >
                          {stage.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ACTION SECTION FOR ADVANCING */}
            {activeWorkflow.stageIndex < 7 ? (
              <div className="rounded-2xl bg-white p-4 border border-[#00373A]/20 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#00373A] uppercase tracking-wider">
                    Advance to Stage {activeWorkflow.stageIndex + 1}
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Current: <strong>{activeWorkflow.currentStage}</strong>
                  </span>
                </div>

                <input
                  type="text"
                  value={stageNotes}
                  onChange={(e) => setStageNotes(e.target.value)}
                  placeholder="Optional verification remarks or hardware serial numbers..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-[#00373A] focus:outline-none focus:border-[#00373A]"
                />

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    disabled={advancing}
                    onClick={handleAdvanceStage}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#00DC46] px-4 py-2 text-xs font-extrabold text-[#00373A] hover:bg-[#00DC46]/90 transition shadow-sm disabled:opacity-50"
                  >
                    <span>{advancing ? "Processing..." : "Complete Current Stage & Advance"}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-200 text-center">
                <CheckCircle2 size={28} className="mx-auto text-emerald-600 mb-2" />
                <h4 className="text-sm font-extrabold text-emerald-900">
                  Onboarding Complete
                </h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  All induction checklists, asset handovers, and compliance verifications have been fulfilled.
                </p>
              </div>
            )}

            <div className="flex justify-end border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setActiveWorkflow(null)}
                className="rounded-xl bg-[#00373A] px-5 py-2 text-xs font-bold text-white hover:bg-[#00373A]/90 transition"
              >
                Close Pipeline
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
