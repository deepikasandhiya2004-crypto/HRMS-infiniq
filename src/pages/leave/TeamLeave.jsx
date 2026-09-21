import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Calendar,
  Filter,
  UserCheck,
  AlertCircle,
  FileText,
} from "lucide-react";
import { hrmsService } from "../../services/hrmsService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../components/Toast.jsx";
import DataTable from "../../components/common/DataTable.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import SearchBar from "../../components/common/SearchBar.jsx";
import FilterDropdown from "../../components/common/FilterDropdown.jsx";
import Modal from "../../components/common/Modal.jsx";
import ConfirmDialog from "../../components/common/ConfirmDialog.jsx";
import ApprovalTimeline from "../../components/common/ApprovalTimeline.jsx";

export default function TeamLeave() {
  const { user, role } = useAuth();
  const toast = useToast();

  const [teamLeaves, setTeamLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [typeFilter, setTypeFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");

  // Modals & Action Targets
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadLeaves();
    const handleStorage = (e) => {
      if (e.detail?.key?.includes("leave")) loadLeaves();
    };
    window.addEventListener("hrms_storage_change", handleStorage);
    return () => window.removeEventListener("hrms_storage_change", handleStorage);
  }, []);

  async function loadLeaves() {
    try {
      setLoading(true);
      const data = await hrmsService.getTeamLeaves();
      setTeamLeaves(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load team leave records");
    } finally {
      setLoading(false);
    }
  }

  // Handle Approve
  async function handleConfirmApprove() {
    if (!approveTarget) return;
    try {
      setProcessing(true);
      await hrmsService.approveLeave(
        approveTarget.id,
        `Approved by ${user.name} (${user.roleTitle || "Supervisor"})`
      );
      toast.success(`Leave request ${approveTarget.id} approved successfully!`);
      setApproveTarget(null);
      await loadLeaves();
    } catch (err) {
      toast.error(err.message || "Failed to approve leave request");
    } finally {
      setProcessing(false);
    }
  }

  // Handle Reject
  async function handleConfirmReject() {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      setRejectError("Rejection reason is mandatory.");
      return;
    }

    try {
      setProcessing(true);
      await hrmsService.rejectLeave(rejectTarget.id, rejectReason.trim());
      toast.success(`Leave request ${rejectTarget.id} rejected.`);
      setRejectTarget(null);
      setRejectReason("");
      setRejectError("");
      await loadLeaves();
    } catch (err) {
      toast.error(err.message || "Failed to reject leave request");
    } finally {
      setProcessing(false);
    }
  }

  // Extract unique departments for filter
  const departments = useMemo(() => {
    return Array.from(new Set(teamLeaves.map((l) => l.department).filter(Boolean)));
  }, [teamLeaves]);

  // Filtered dataset
  const filteredLeaves = useMemo(() => {
    return teamLeaves.filter((l) => {
      const q = search.toLowerCase();
      const matchesSearch =
        l.employeeName?.toLowerCase().includes(q) ||
        l.employeeId?.toLowerCase().includes(q) ||
        l.id?.toLowerCase().includes(q) ||
        l.reason?.toLowerCase().includes(q);

      const matchesStatus = !statusFilter || l.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesType = !typeFilter || l.leaveType.toLowerCase() === typeFilter.toLowerCase();
      const matchesDept = !deptFilter || l.department === deptFilter;

      return matchesSearch && matchesStatus && matchesType && matchesDept;
    });
  }, [teamLeaves, search, statusFilter, typeFilter, deptFilter]);

  const canApproveReject = role === "manager" || role === "hr_admin" || role === "super_admin";

  const columns = [
    {
      key: "employeeName",
      header: "Employee",
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#00373A] text-white font-bold text-xs">
            {val?.charAt(0) || "U"}
          </div>
          <div>
            <span className="font-bold text-[#00373A]">{val}</span>
            <p className="text-[11px] text-slate-400 font-mono">{row.employeeId}</p>
          </div>
        </div>
      ),
    },
    {
      key: "department",
      header: "Department",
      sortable: true,
      render: (val) => (
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
          {val}
        </span>
      ),
    },
    {
      key: "leaveType",
      header: "Leave Type",
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-bold text-[#00373A]">{val}</span>
          {row.halfDay && (
            <span className="ml-2 inline-block text-[10px] bg-amber-50 text-amber-700 font-semibold px-1.5 py-0.2 rounded">
              Half Day
            </span>
          )}
        </div>
      ),
    },
    {
      key: "duration",
      header: "Duration",
      render: (_, row) => (
        <div>
          <span className="font-medium text-slate-700">
            {row.fromDate} to {row.toDate}
          </span>
          <p className="text-[11px] font-bold text-[#00373A]/70">
            {row.days} {row.days === 1 ? "day" : "days"}
          </p>
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
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedLeave(row)}
            className="flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            title="View Details"
          >
            <Eye size={13} />
            <span>View</span>
          </button>

          {canApproveReject && row.status === "Pending" && (
            <>
              <button
                type="button"
                onClick={() => setApproveTarget(row)}
                className="flex h-8 items-center gap-1 rounded-lg bg-emerald-600 px-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
                title="Approve Leave"
              >
                <CheckCircle2 size={13} />
                <span>Approve</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRejectTarget(row);
                  setRejectReason("");
                  setRejectError("");
                }}
                className="flex h-8 items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                title="Reject Leave"
              >
                <XCircle size={13} />
                <span>Reject</span>
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* FILTER CONTROLS BAR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-2xl bg-white p-4 border border-[#00373A]/10 shadow-sm">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search team leave by name, ID..."
          className="w-full md:w-72"
        />

        <div className="flex flex-wrap items-center gap-2.5">
          <FilterDropdown
            label="Department"
            value={deptFilter}
            onChange={setDeptFilter}
            options={departments}
          />
          <FilterDropdown
            label="Type"
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              "Casual Leave",
              "Sick Leave",
              "Earned Leave",
              "Compensatory Off",
              "Optional / Holiday",
            ]}
          />
          <FilterDropdown
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={["Pending", "Approved", "Rejected", "Cancelled"]}
          />
          {statusFilter && (
            <button
              onClick={() => setStatusFilter("")}
              className="text-xs text-[#00373A] hover:underline font-semibold"
            >
              Clear Status Filter
            </button>
          )}
        </div>
      </div>

      {/* TEAM LEAVE DATA TABLE */}
      <DataTable
        columns={columns}
        data={filteredLeaves}
        loading={loading}
        defaultPageSize={10}
        emptyTitle="No team leave applications"
        emptyDescription="There are currently no team leave requests matching the active filters."
      />

      {/* VIEW DETAILS MODAL */}
      {selectedLeave && (
        <Modal
          isOpen={true}
          title={`Team Leave Details: ${selectedLeave.employeeName}`}
          onClose={() => setSelectedLeave(null)}
          size="lg"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00373A] text-white font-black text-sm">
                  {selectedLeave.employeeName?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#00373A]">
                    {selectedLeave.employeeName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedLeave.employeeId} • {selectedLeave.department}
                  </p>
                </div>
              </div>
              <StatusBadge status={selectedLeave.status} size="lg" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl border border-slate-100 p-3 bg-white">
                <span className="text-slate-400 font-medium">Leave Type</span>
                <p className="mt-1 font-bold text-[#00373A]">{selectedLeave.leaveType}</p>
              </div>
              <div className="rounded-xl border border-slate-100 p-3 bg-white">
                <span className="text-slate-400 font-medium">Duration</span>
                <p className="mt-1 font-bold text-[#00373A]">
                  {selectedLeave.days} {selectedLeave.days === 1 ? "day" : "days"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 p-3 bg-white">
                <span className="text-slate-400 font-medium">Date Range</span>
                <p className="mt-1 font-bold text-[#00373A]">
                  {selectedLeave.fromDate} to {selectedLeave.toDate}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Employee Reason
              </h4>
              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-700 border border-slate-100">
                {selectedLeave.reason}
              </div>
            </div>

            {selectedLeave.attachment && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Supporting Document
                </h4>
                <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#00373A]">
                  <FileText size={16} className="text-[#00DC46]" />
                  <span>{selectedLeave.attachment}</span>
                </div>
              </div>
            )}

            {selectedLeave.remarks && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Approver Remarks
                </h4>
                <div className="rounded-xl bg-[#00373A]/5 p-3 text-xs text-[#00373A] font-medium border border-[#00373A]/10">
                  {selectedLeave.remarks}
                </div>
              </div>
            )}

            {selectedLeave.approvalTimeline && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Approval History
                </h4>
                <ApprovalTimeline steps={selectedLeave.approvalTimeline} />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setSelectedLeave(null)}
                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* CONFIRM APPROVE MODAL */}
      <ConfirmDialog
        isOpen={!!approveTarget}
        title="Approve Leave Request"
        message={`Are you sure you want to approve ${approveTarget?.employeeName}'s ${approveTarget?.leaveType} request for ${approveTarget?.days} day(s) (${approveTarget?.fromDate} to ${approveTarget?.toDate})?`}
        confirmLabel="Confirm Approval"
        variant="success"
        loading={processing}
        onConfirm={handleConfirmApprove}
        onCancel={() => setApproveTarget(null)}
      />

      {/* MANDATORY REJECTION REASON MODAL */}
      <Modal
        isOpen={!!rejectTarget}
        title={`Reject Leave: ${rejectTarget?.employeeName}`}
        onClose={() => setRejectTarget(null)}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Please enter a rejection reason. This remark will be logged into the employee's leave record and notified to the applicant.
          </p>

          <div>
            <label className="block text-xs font-bold text-[#00373A] mb-1.5">
              Rejection Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => {
                setRejectReason(e.target.value);
                setRejectError("");
              }}
              placeholder="e.g. Critical deployment window, please reschedule after sprint end..."
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-[#00373A] shadow-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/10"
            />
            {rejectError && (
              <p className="mt-1 text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                <AlertCircle size={13} /> {rejectError}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setRejectTarget(null)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={processing}
              onClick={handleConfirmReject}
              className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition disabled:opacity-50"
            >
              {processing ? "Rejecting..." : "Confirm Rejection"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
