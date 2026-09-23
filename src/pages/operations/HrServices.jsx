import React, { useState, useEffect, useMemo } from "react";
import {
  FileText,
  Plus,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  FileCheck2,
  UserCheck,
  Send,
  Download,
} from "lucide-react";
import { hrmsService } from "../../services/hrmsService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../components/Toast.jsx";
import DataTable from "../../components/common/DataTable.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import SearchBar from "../../components/common/SearchBar.jsx";
import FilterDropdown from "../../components/common/FilterDropdown.jsx";
import Modal from "../../components/common/Modal.jsx";

export default function HrServices() {
  const { user, role } = useAuth();
  const toast = useToast();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  // Modals
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [saving, setSaving] = useState(false);

  // New service request form
  const [formData, setFormData] = useState({
    serviceType: "Employment Certificate",
    priority: "Medium",
    purpose: "",
    attachment: null,
  });

  const serviceTypes = [
    "Employment Certificate",
    "Experience Certificate",
    "Salary Certificate",
    "ID Card Request",
    "Address Update",
    "Bank Details Update",
    "Personal Information Update",
    "Other HR Requests",
  ];

  useEffect(() => {
    loadRequests();
    const handleStorage = (e) => {
      if (e.detail?.key?.includes("hr_services")) loadRequests();
    };
    window.addEventListener("hrms_storage_change", handleStorage);
    return () => window.removeEventListener("hrms_storage_change", handleStorage);
  }, []);

  async function loadRequests() {
    try {
      setLoading(true);
      const data = await hrmsService.getHrServices();
      setRequests(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load HR service requests");
    } finally {
      setLoading(false);
    }
  }

  // Handle employee submitting request
  async function handleCreateRequest(e) {
    e.preventDefault();
    if (!formData.purpose.trim()) {
      toast.error("Please explain the purpose of your service request.");
      return;
    }

    try {
      setSaving(true);
      const created = await hrmsService.createHrServiceRequest({
        employeeId: user.id,
        employeeName: user.name,
        serviceType: formData.serviceType,
        priority: formData.priority,
        purpose: formData.purpose,
        assignedTo: "Priya Nair",
      });
      toast.success(`Service request ${created.id} submitted successfully!`);
      setShowRequestModal(false);
      setFormData({
        serviceType: "Employment Certificate",
        priority: "Medium",
        purpose: "",
        attachment: null,
      });
      await loadRequests();
    } catch (err) {
      toast.error("Failed to submit service request");
    } finally {
      setSaving(false);
    }
  }

  // Handle HR resolving or updating request
  async function handleUpdateResolution() {
    if (!activeRequest) return;
    try {
      setSaving(true);
      await hrmsService.updateHrServiceStatus(
        activeRequest.id,
        newStatus || activeRequest.status,
        resolutionNotes,
        assignedTo || activeRequest.assignedTo
      );
      toast.success(`Request ${activeRequest.id} updated to ${newStatus || activeRequest.status}`);
      setActiveRequest(null);
      await loadRequests();
    } catch (err) {
      toast.error("Failed to update service request");
    } finally {
      setSaving(false);
    }
  }

  function openDetails(req) {
    setActiveRequest(req);
    setNewStatus(req.status);
    setResolutionNotes(req.resolutionNotes || "");
    setAssignedTo(req.assignedTo || "Priya Nair");
  }

  // Filtered dataset
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const q = search.toLowerCase();
      const matchesSearch =
        r.id.toLowerCase().includes(q) ||
        r.employeeName.toLowerCase().includes(q) ||
        r.serviceType.toLowerCase().includes(q) ||
        r.purpose.toLowerCase().includes(q);

      const matchesType = !typeFilter || r.serviceType === typeFilter;
      const matchesStatus = !statusFilter || r.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesPriority = !priorityFilter || r.priority.toLowerCase() === priorityFilter.toLowerCase();

      return matchesSearch && matchesType && matchesStatus && matchesPriority;
    });
  }, [requests, search, typeFilter, statusFilter, priorityFilter]);

  const columns = [
    {
      key: "id",
      header: "Request ID",
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-bold text-[#00373A]">{val}</span>
          <p className="text-[11px] text-slate-400">Date: {row.submittedDate}</p>
        </div>
      ),
    },
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
      key: "serviceType",
      header: "Service Category",
      sortable: true,
      render: (val) => (
        <span className="rounded-md bg-[#00373A]/5 px-2 py-0.5 text-xs font-bold text-[#00373A]">
          {val}
        </span>
      ),
    },
    {
      key: "assignedTo",
      header: "Assigned HR",
      render: (val) => <span className="text-xs font-medium text-slate-700">{val}</span>,
    },
    {
      key: "priority",
      header: "Priority",
      sortable: true,
      render: (val) => <StatusBadge status={val} size="sm" showDot={false} />,
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
          onClick={() => openDetails(row)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#00373A] hover:bg-slate-50 transition"
        >
          <Eye size={13} />
          <span>Review</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-2xl bg-white p-4 border border-[#00373A]/10 shadow-sm">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search requests by ID, employee, category..."
          className="w-full md:w-80"
        />

        <div className="flex flex-wrap items-center gap-2.5">
          <FilterDropdown
            label="Category"
            value={typeFilter}
            onChange={setTypeFilter}
            options={serviceTypes}
          />
          <FilterDropdown
            label="Priority"
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={["Urgent", "High", "Medium", "Low"]}
          />
          <FilterDropdown
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={["New", "In Progress", "Pending", "Completed", "Rejected"]}
          />

          <button
            type="button"
            onClick={() => setShowRequestModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#00DC46] px-4 py-2 text-xs font-extrabold text-[#00373A] shadow-sm hover:bg-[#00DC46]/90 transition ml-auto md:ml-0"
          >
            <Plus size={15} />
            <span>Request HR Service</span>
          </button>
        </div>
      </div>

      {/* DATA TABLE */}
      <DataTable
        columns={columns}
        data={filteredRequests}
        loading={loading}
        defaultPageSize={10}
        emptyTitle="No service requests found"
        emptyDescription="There are currently no open HR certificate or service requests matching your criteria."
      />

      {/* NEW REQUEST MODAL */}
      {showRequestModal && (
        <Modal
          isOpen={true}
          title="New HR Service Request"
          onClose={() => setShowRequestModal(false)}
          size="md"
        >
          <form onSubmit={handleCreateRequest} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#00373A] mb-1">
                Select Service Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-[#00373A] focus:outline-none focus:border-[#00373A]"
              >
                {serviceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#00373A] mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-[#00373A] focus:outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#00373A] mb-1">
                Purpose & Justification <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder="Explain why this certificate or update is required (e.g. visa application, bank loan, address change proof)..."
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-[#00373A] focus:outline-none focus:border-[#00373A]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#00373A] px-5 py-2 text-xs font-bold text-white hover:bg-[#00373A]/90 transition disabled:opacity-50"
              >
                {saving ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* REVIEW & RESOLUTION MODAL */}
      {activeRequest && (
        <Modal
          isOpen={true}
          title={`Review Request: ${activeRequest.id}`}
          onClose={() => setActiveRequest(null)}
          size="lg"
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {activeRequest.serviceType}
                </span>
                <h3 className="text-base font-extrabold text-[#00373A]">
                  {activeRequest.employeeName} ({activeRequest.employeeId})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Submitted on: {activeRequest.submittedDate}</p>
              </div>
              <div className="text-right">
                <StatusBadge status={activeRequest.status} size="md" />
                <div className="mt-1">
                  <StatusBadge status={activeRequest.priority} size="sm" showDot={false} />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Purpose Stated by Employee
              </h4>
              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-700 border border-slate-100">
                {activeRequest.purpose}
              </div>
            </div>

            {/* HR ACTIONS & RESOLUTION */}
            <div className="rounded-2xl border border-[#00373A]/20 bg-[#00373A]/[0.02] p-4 space-y-4">
              <h4 className="text-xs font-extrabold text-[#00373A] uppercase tracking-wider">
                HR Resolution & Status Management
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[#00373A] mb-1">Update Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-bold text-[#00373A] focus:outline-none"
                  >
                    <option value="New">New</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#00373A] mb-1">Assignee</label>
                  <input
                    type="text"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold text-[#00373A] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#00373A] mb-1">
                  Resolution Remarks & Notes
                </label>
                <textarea
                  rows={2}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Certificate stamped and issued. Sent to candidate's official email..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-[#00373A] focus:outline-none"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleUpdateResolution}
                  className="rounded-xl bg-[#00373A] px-4 py-2 text-xs font-bold text-white hover:bg-[#00373A]/90 transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Status & Remarks"}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveRequest(null)}
                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
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
