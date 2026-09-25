import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Eye,
  XCircle,
  Calendar,
  FileText,
  Clock,
  CheckCircle2,
  Filter,
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

export default function MyLeave() {
  const { user } = useAuth();
  const toast = useToast();

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Modals
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadLeaves();

    const handleStorageChange = (e) => {
      if (e.detail?.key?.includes("leave")) {
        loadLeaves();
      }
    };
    window.addEventListener("hrms_storage_change", handleStorageChange);
    return () => window.removeEventListener("hrms_storage_change", handleStorageChange);
  }, []);

  async function loadLeaves() {
    try {
      setLoading(true);
      const data = await hrmsService.getMyLeaves();
      setLeaves(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load leave history");
    } finally {
      setLoading(false);
    }
  }

  // Handle Cancel Leave
  async function handleConfirmCancel() {
    if (!cancelTarget) return;
    try {
      setCancelling(true);
      await hrmsService.cancelLeave(cancelTarget.id);
      toast.success(`Leave application ${cancelTarget.id} has been cancelled.`);
      setCancelTarget(null);
      await loadLeaves();
    } catch (err) {
      toast.error(err.message || "Failed to cancel leave");
    } finally {
      setCancelling(false);
    }
  }

  // Filtered dataset
  const filteredLeaves = useMemo(() => {
    return leaves.filter((l) => {
      const q = search.toLowerCase();
      const matchesSearch =
      String(l.id ?? "").toLowerCase().includes(q) ||
String(l.leaveType ?? "").toLowerCase().includes(q) ||
String(l.reason ?? "").toLowerCase().includes(q) ||
String(l.approver ?? "").toLowerCase().includes(q);
      const matchesStatus = !statusFilter || l.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesType = !typeFilter || l.leaveType.toLowerCase() === typeFilter.toLowerCase();
      const matchesDate = !dateFilter || l.fromDate.includes(dateFilter) || l.toDate.includes(dateFilter);

      return matchesSearch && matchesStatus && matchesType && matchesDate;
    });
  }, [leaves, search, statusFilter, typeFilter, dateFilter]);

  const columns = [
    {
      key: "id",
      header: "Application ID",
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-bold text-[#00373A]">{val}</span>
          <p className="text-[11px] text-slate-400">Applied: {row.appliedDate}</p>
        </div>
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
              Half Day ({row.halfDaySession || "First Half"})
            </span>
          )}
        </div>
      ),
    },
    {
      key: "dates",
      header: "Leave Duration",
      render: (_, row) => (
        <div>
          <div className="font-semibold text-slate-700">
            {row.fromDate} <span className="text-slate-400">to</span> {row.toDate}
          </div>
          <span className="text-[11px] font-bold text-[#00373A]/70">
            {row.days} {row.days === 1 ? "day" : "days"}
          </span>
        </div>
      ),
    },
    {
      key: "approver",
      header: "Approver",
      render: (val, row) => (
        <div>
          <p className="font-semibold text-[#00373A]">{val}</p>
          <p className="text-[11px] text-slate-400 truncate max-w-[140px]" title={row.remarks}>
            {row.remarks || "No remarks"}
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
            className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            title="View Details"
          >
            <Eye size={14} />
            <span>Details</span>
          </button>
          {row.status === "Pending" && (
            <button
              type="button"
              onClick={() => setCancelTarget(row)}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
              title="Cancel Leave Application"
            >
              <XCircle size={14} />
              <span>Cancel</span>
            </button>
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
          placeholder="Search by ID, reason, approver..."
          className="w-full md:w-72"
        />

        <div className="flex flex-wrap items-center gap-2.5">
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
          <div className="flex items-center gap-1.5 rounded-xl border border-[#00373A]/20 bg-white px-3 py-1.5 text-xs text-[#00373A]">
            <Calendar size={14} className="text-[#00373A]/50" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-transparent text-xs text-[#00373A] focus:outline-none"
              title="Filter by date"
            />
            {dateFilter && (
              <button onClick={() => setDateFilter("")} className="text-slate-400 hover:text-slate-600">
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* LEAVE HISTORY DATA TABLE */}
      <DataTable
        columns={columns}
        data={filteredLeaves}
        loading={loading}
        defaultPageSize={10}
        emptyTitle="No leave applications found"
        emptyDescription="You haven't submitted any leave requests matching the selected filters."
      />

      {/* VIEW DETAILS MODAL */}
      {selectedLeave && (
        <Modal
        open={true}
          title={`Leave Application: ${selectedLeave.id}`}
          onClose={() => setSelectedLeave(null)}
          size="lg"
        >
          <div className="space-y-6">
            {/* Top Summary Banner */}
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Application Status
                </span>
                <div className="mt-1">
                  <StatusBadge status={selectedLeave.status} size="lg" />
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Total Duration</span>
                <p className="text-lg font-extrabold text-[#00373A]">
                  {selectedLeave.days} {selectedLeave.days === 1 ? "Day" : "Days"}
                </p>
              </div>
            </div>

            {/* Application Data Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl border border-slate-100 p-3 bg-white">
                <span className="text-slate-400 font-medium">Employee Name & ID</span>
                <p className="mt-1 font-bold text-[#00373A]">
                  {selectedLeave.employeeName} ({selectedLeave.employeeId})
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 p-3 bg-white">
                <span className="text-slate-400 font-medium">Department</span>
                <p className="mt-1 font-bold text-[#00373A]">{selectedLeave.department}</p>
              </div>
              <div className="rounded-xl border border-slate-100 p-3 bg-white">
                <span className="text-slate-400 font-medium">Leave Type</span>
                <p className="mt-1 font-bold text-[#00373A]">{selectedLeave.leaveType}</p>
              </div>
              <div className="rounded-xl border border-slate-100 p-3 bg-white">
                <span className="text-slate-400 font-medium">Date Range</span>
                <p className="mt-1 font-bold text-[#00373A]">
                  {selectedLeave.fromDate} to {selectedLeave.toDate}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 p-3 bg-white">
                <span className="text-slate-400 font-medium">Applied On</span>
                <p className="mt-1 font-bold text-[#00373A]">{selectedLeave.appliedDate}</p>
              </div>
              <div className="rounded-xl border border-slate-100 p-3 bg-white">
                <span className="text-slate-400 font-medium">Assigned Approver</span>
                <p className="mt-1 font-bold text-[#00373A]">{selectedLeave.approver}</p>
              </div>
            </div>

            {/* Reason Section */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Reason for Leave
              </h4>
              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-700 border border-slate-100">
                {selectedLeave.reason}
              </div>
            </div>

            {/* Attachment if present */}
            {selectedLeave.attachment && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Supporting Document
                </h4>
                <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#00373A]">
                  <FileText size={16} className="text-[#00DC46]" />
                  <span>{selectedLeave.attachment}</span>
                  <span className="text-[10px] text-slate-400">(Simulated Document)</span>
                </div>
              </div>
            )}

            {/* Approver Remarks */}
            {selectedLeave.remarks && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Approval / Review Remarks
                </h4>
                <div className="rounded-xl bg-[#00373A]/5 p-3 text-xs text-[#00373A] font-medium border border-[#00373A]/10">
                  {selectedLeave.remarks}
                </div>
              </div>
            )}

            {/* Multi-step Approval Timeline */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Approval Workflow Progress
              </h4>
              <ApprovalTimeline steps={selectedLeave.approvalTimeline} />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              {selectedLeave.status === "Pending" ? (
                <button
                  type="button"
                  onClick={() => {
                    setCancelTarget(selectedLeave);
                    setSelectedLeave(null);
                  }}
                  className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                >
                  Cancel This Request
                </button>
              ) : (
                <div />
              )}
              <button
                type="button"
                onClick={() => setSelectedLeave(null)}
                className="rounded-xl bg-[#00373A] px-5 py-2 text-xs font-bold text-white hover:bg-[#00373A]/90 transition"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* CONFIRM CANCEL DIALOG */}
      <ConfirmDialog
        isOpen={!!cancelTarget}
        title="Cancel Leave Application"
        message={`Are you sure you want to cancel your leave request (${cancelTarget?.id}) for ${cancelTarget?.days} day(s)? This will restore ${cancelTarget?.days} day(s) to your available balance.`}
        confirmLabel="Yes, Cancel Leave"
        variant="danger"
        loading={cancelling}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
