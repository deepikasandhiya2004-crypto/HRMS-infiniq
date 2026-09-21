import React, { useState, useEffect } from "react";
import {
  UserMinus,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  ChevronRight,
  ShieldCheck,
  Building,
  DollarSign,
  Laptop,
} from "lucide-react";
import { hrmsService } from "../../services/hrmsService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../components/Toast.jsx";
import StatCard from "../../components/common/StatCard.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import SearchBar from "../../components/common/SearchBar.jsx";
import DataTable from "../../components/common/DataTable.jsx";
import Modal from "../../components/common/Modal.jsx";

export default function Offboarding() {
  const { user } = useAuth();
  const toast = useToast();

  const [offboardingList, setOffboardingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal / Target
  const [activeWorkflow, setActiveWorkflow] = useState(null);
  const [stageRemarks, setStageRemarks] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadOffboarding();
    const handleStorage = (e) => {
      if (e.detail?.key?.includes("offboarding")) loadOffboarding();
    };
    window.addEventListener("hrms_storage_change", handleStorage);
    return () => window.removeEventListener("hrms_storage_change", handleStorage);
  }, []);

  async function loadOffboarding() {
    try {
      setLoading(true);
      const data = await hrmsService.getOffboarding();
      setOffboardingList(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load offboarding records");
    } finally {
      setLoading(false);
    }
  }

  // Handle stage advancement
  async function handleAdvanceOffboarding() {
    if (!activeWorkflow) return;
    try {
      setUpdating(true);
      await hrmsService.updateOffboardingStage(
        activeWorkflow.id,
        activeWorkflow.stageIndex + 1,
        stageRemarks
      );
      toast.success(
        `Advanced exit process for ${activeWorkflow.employeeName} to next stage!`
      );
      setStageRemarks("");
      const updatedList = await hrmsService.getOffboarding();
      setOffboardingList(updatedList);
      const refreshed = updatedList.find((item) => item.id === activeWorkflow.id);
      setActiveWorkflow(refreshed || null);
    } catch (err) {
      toast.error("Failed to advance offboarding stage");
    } finally {
      setUpdating(false);
    }
  }

  // Summary Metrics
  const totalCount = offboardingList.length;
  const inProgressCount = offboardingList.filter((o) => o.status === "In Progress").length;
  const pendingClearanceCount = offboardingList.filter((o) => o.stageIndex === 5).length;
  const completedCount = offboardingList.filter((o) => o.status === "Completed").length;

  // Filtered dataset
  const filteredList = offboardingList.filter((o) => {
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
          <p className="text-[11px] text-slate-400 font-mono">{row.employeeId}</p>
        </div>
      ),
    },
    {
      key: "department",
      header: "Department",
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-medium text-slate-700">{val}</span>
          <p className="text-[11px] text-slate-400">Mgr: {row.manager}</p>
        </div>
      ),
    },
    {
      key: "resignationDate",
      header: "Resignation Date",
      sortable: true,
      render: (val) => <span className="text-xs text-slate-600">{val}</span>,
    },
    {
      key: "lastWorkingDate",
      header: "Last Working Day",
      sortable: true,
      render: (val) => <span className="font-bold text-[#00373A]">{val}</span>,
    },
    {
      key: "currentStage",
      header: "Current Stage",
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-bold text-[#00373A]">{val}</span>
          <p className="text-[10px] text-slate-400">Stage {row.stageIndex} of 8</p>
        </div>
      ),
    },
    {
      key: "progress",
      header: "Progress",
      sortable: true,
      render: (val) => (
        <div className="w-28">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1">
            <span>{val}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full transition-all ${
                val === 100 ? "bg-emerald-500" : "bg-purple-600"
              }`}
              style={{ width: `${val}%` }}
            />
          </div>
        </div>
      ),
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
            setStageRemarks("");
          }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#00373A] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#00373A]/90 transition"
        >
          <span>{row.status === "Completed" ? "Inspect" : "Clearance & Stage"}</span>
          <ChevronRight size={14} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI METRICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Offboardings"
          value={totalCount}
          subtitle="Total resignation records"
          icon={UserMinus}
          accentColor="#FF6A3D"
        />
        <StatCard
          title="In Progress"
          value={inProgressCount}
          subtitle="Serving notice period"
          icon={Clock}
          accentColor="#00373A"
        />
        <StatCard
          title="Clearances Pending"
          value={pendingClearanceCount}
          subtitle="Departmental handovers"
          icon={AlertCircle}
          accentColor="#7C3AED"
        />
        <StatCard
          title="Settled & Relieved"
          value={completedCount}
          subtitle="Full & final concluded"
          icon={CheckCircle2}
          accentColor="#00DC46"
        />
      </div>

      {/* SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl bg-white p-4 border border-[#00373A]/10 shadow-sm">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search offboarding records by name, ID, department..."
          className="w-full sm:w-80"
        />
        <div className="text-xs text-slate-500">
          Showing <strong>{filteredList.length}</strong> exit workflows
        </div>
      </div>

      {/* OFFBOARDING TABLE */}
      <DataTable
        columns={columns}
        data={filteredList}
        loading={loading}
        defaultPageSize={10}
        emptyTitle="No offboarding records found"
        emptyDescription="There are currently no employees in the exit or clearance lifecycle."
      />

      {/* OFFBOARDING WORKFLOW & CLEARANCE MODAL */}
      {activeWorkflow && (
        <Modal
          isOpen={true}
          title={`Offboarding Dossier: ${activeWorkflow.employeeName}`}
          onClose={() => setActiveWorkflow(null)}
          size="lg"
        >
          <div className="space-y-6">
            {/* Header Persona */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-[#00373A]">
                  {activeWorkflow.employeeName} ({activeWorkflow.employeeId})
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Department: {activeWorkflow.department} • Reporting Manager: {activeWorkflow.manager}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Resignation: {activeWorkflow.resignationDate} • Last Working Day:{" "}
                  <strong className="text-[#00373A]">{activeWorkflow.lastWorkingDate}</strong>
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400">Exit Progress</span>
                <p className="text-lg font-black text-[#00373A]">{activeWorkflow.progress}%</p>
                <StatusBadge status={activeWorkflow.status} size="sm" />
              </div>
            </div>

            {/* DEPARTMENTAL CLEARANCE CHECKLIST */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Departmental Clearance Matrix
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* IT Clearance */}
                <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-[#00373A]">
                      <Laptop size={16} className="text-blue-500" />
                      <span>IT & Hardware Clearance</span>
                    </div>
                    <StatusBadge
                      status={activeWorkflow.clearances?.it?.status === "approved" ? "Completed" : "Pending"}
                      size="sm"
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500">
                    {activeWorkflow.clearances?.it?.remark || "Hardware recovery & credential revoking"}
                  </p>
                </div>

                {/* Finance Clearance */}
                <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-[#00373A]">
                      <DollarSign size={16} className="text-emerald-500" />
                      <span>Finance & Payroll Clearance</span>
                    </div>
                    <StatusBadge
                      status={activeWorkflow.clearances?.finance?.status === "approved" ? "Completed" : "Pending"}
                      size="sm"
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500">
                    {activeWorkflow.clearances?.finance?.remark || "Expense settlement & loan clearances"}
                  </p>
                </div>

                {/* Admin Clearance */}
                <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-[#00373A]">
                      <Building size={16} className="text-purple-500" />
                      <span>Admin & Facilities Clearance</span>
                    </div>
                    <StatusBadge
                      status={activeWorkflow.clearances?.admin?.status === "approved" ? "Completed" : "Pending"}
                      size="sm"
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500">
                    {activeWorkflow.clearances?.admin?.remark || "ID smartcard & access token return"}
                  </p>
                </div>

                {/* HR Clearance */}
                <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-[#00373A]">
                      <FileCheck2 size={16} className="text-[#00DC46]" />
                      <span>HR & Exit Formalities</span>
                    </div>
                    <StatusBadge
                      status={activeWorkflow.clearances?.hr?.status === "approved" ? "Completed" : "Pending"}
                      size="sm"
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500">
                    {activeWorkflow.clearances?.hr?.remark || "Exit interview questionnaire & relieving issuance"}
                  </p>
                </div>
              </div>
            </div>

            {/* 8-STAGE PROGRESSION LIST */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Offboarding Stages (8 Steps)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {activeWorkflow.stages.map((stage) => {
                  const isDone = stage.status === "completed";
                  const isCurrent = stage.status === "in_progress";
                  return (
                    <div
                      key={stage.id}
                      className={`p-2.5 rounded-xl border text-center ${
                        isCurrent
                          ? "border-[#00373A] bg-[#00373A]/5 font-bold"
                          : isDone
                          ? "border-emerald-100 bg-emerald-50/50 text-emerald-800"
                          : "border-slate-100 bg-slate-50 opacity-50"
                      }`}
                    >
                      <span className="text-[10px] font-bold text-slate-400">Step {stage.id}</span>
                      <p className="text-xs font-bold truncate mt-0.5">{stage.name}</p>
                      <span className="text-[9px] block mt-1">
                        {isDone ? "✓ Completed" : isCurrent ? "Current" : "Pending"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ADVANCE STAGE ACTION */}
            {activeWorkflow.stageIndex < 8 ? (
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
                  value={stageRemarks}
                  onChange={(e) => setStageRemarks(e.target.value)}
                  placeholder="Add clearance remarks or settlement confirmation..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-[#00373A] focus:outline-none focus:border-[#00373A]"
                />

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    disabled={updating}
                    onClick={handleAdvanceOffboarding}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#00373A] px-4 py-2 text-xs font-bold text-white hover:bg-[#00373A]/90 transition shadow-sm disabled:opacity-50"
                  >
                    <span>{updating ? "Updating..." : "Approve & Advance Stage"}</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-200 text-center">
                <CheckCircle2 size={28} className="mx-auto text-emerald-600 mb-2" />
                <h4 className="text-sm font-extrabold text-emerald-900">
                  Offboarding Successfully Concluded
                </h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Clearances, exit interviews, and final settlement payments have been finalized.
                </p>
              </div>
            )}

            <div className="flex justify-end border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setActiveWorkflow(null)}
                className="rounded-xl bg-[#00373A] px-5 py-2 text-xs font-bold text-white hover:bg-[#00373A]/90 transition"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
