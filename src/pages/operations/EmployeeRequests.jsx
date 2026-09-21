import React, { useState, useEffect, useMemo } from "react";
import {
  LifeBuoy,
  Plus,
  Eye,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  Send,
  User,
  Tag,
} from "lucide-react";
import { hrmsService } from "../../services/hrmsService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../components/Toast.jsx";
import DataTable from "../../components/common/DataTable.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import SearchBar from "../../components/common/SearchBar.jsx";
import FilterDropdown from "../../components/common/FilterDropdown.jsx";
import Modal from "../../components/common/Modal.jsx";

export default function EmployeeRequests() {
  const { user, role } = useAuth();
  const toast = useToast();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  // Modals & Chat Thread
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [activeTicket, setActiveTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [ticketStatus, setTicketStatus] = useState("");
  const [saving, setSaving] = useState(false);

  // New Request Form
  const [newRequest, setNewRequest] = useState({
    category: "Hardware & Equipment",
    subject: "",
    priority: "Medium",
    description: "",
  });

  const categories = [
    "Hardware & Equipment",
    "Policy Clarification",
    "Shift / Attendance Adjustment",
    "Payroll & Compensation",
    "Workplace Facilities",
    "Other General Inquiry",
  ];

  useEffect(() => {
    loadRequests();
    const handleStorage = (e) => {
      if (e.detail?.key?.includes("employee_requests")) loadRequests();
    };
    window.addEventListener("hrms_storage_change", handleStorage);
    return () => window.removeEventListener("hrms_storage_change", handleStorage);
  }, []);

  async function loadRequests() {
    try {
      setLoading(true);
      const data = await hrmsService.getEmployeeRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load employee requests");
    } finally {
      setLoading(false);
    }
  }

  // Submit new request
  async function handleSubmitNewRequest(e) {
    e.preventDefault();
    if (!newRequest.subject.trim() || !newRequest.description.trim()) {
      toast.error("Subject and description are required.");
      return;
    }

    try {
      setSaving(true);
      const created = await hrmsService.createEmployeeRequest({
        employeeId: user.id,
        employeeName: user.name,
        category: newRequest.category,
        subject: newRequest.subject,
        priority: newRequest.priority,
        description: newRequest.description,
      });
      toast.success(`Request ${created.id} submitted!`);
      setShowSubmitModal(false);
      setNewRequest({
        category: "Hardware & Equipment",
        subject: "",
        priority: "Medium",
        description: "",
      });
      await loadRequests();
    } catch (err) {
      toast.error("Failed to submit request");
    } finally {
      setSaving(false);
    }
  }

  // Post reply / change status
  async function handleSendReply(e) {
    e.preventDefault();
    if (!activeTicket) return;
    if (!replyMessage.trim() && ticketStatus === activeTicket.status) return;

    try {
      setSaving(true);
      await hrmsService.addRequestReply(
        activeTicket.id,
        user.name,
        user.roleTitle || role.replace("_", " "),
        replyMessage.trim() || `Status updated to ${ticketStatus}`,
        ticketStatus
      );
      toast.success("Response posted and status updated!");
      setReplyMessage("");
      const updatedList = await hrmsService.getEmployeeRequests();
      setRequests(updatedList);
      const refreshed = updatedList.find((t) => t.id === activeTicket.id);
      setActiveTicket(refreshed || null);
    } catch (err) {
      toast.error("Failed to post update");
    } finally {
      setSaving(false);
    }
  }

  function openTicket(ticket) {
    setActiveTicket(ticket);
    setTicketStatus(ticket.status);
    setReplyMessage("");
  }

  // Filtered dataset
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const q = search.toLowerCase();
      const matchesSearch =
        r.id.toLowerCase().includes(q) ||
        r.employeeName.toLowerCase().includes(q) ||
        r.subject.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q);

      const matchesCat = !categoryFilter || r.category === categoryFilter;
      const matchesStatus = !statusFilter || r.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesPriority = !priorityFilter || r.priority.toLowerCase() === priorityFilter.toLowerCase();

      return matchesSearch && matchesCat && matchesStatus && matchesPriority;
    });
  }, [requests, search, categoryFilter, statusFilter, priorityFilter]);

  const columns = [
    {
      key: "id",
      header: "Ticket ID",
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-bold text-[#00373A]">{val}</span>
          <p className="text-[11px] text-slate-400">{row.submittedDate}</p>
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
      key: "category",
      header: "Category",
      sortable: true,
      render: (val) => (
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
          {val}
        </span>
      ),
    },
    {
      key: "subject",
      header: "Subject & Inquiry",
      render: (val) => (
        <div className="max-w-xs">
          <p className="font-bold text-slate-800 truncate" title={val}>
            {val}
          </p>
        </div>
      ),
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
          onClick={() => openTicket(row)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#00373A] hover:bg-slate-50 transition"
        >
          <MessageSquare size={13} />
          <span>Thread ({row.thread?.length || 1})</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* FILTER BAR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-2xl bg-white p-4 border border-[#00373A]/10 shadow-sm">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search inquiries, subject, employee..."
          className="w-full md:w-80"
        />

        <div className="flex flex-wrap items-center gap-2.5">
          <FilterDropdown
            label="Category"
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={categories}
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
            options={["Open", "In Progress", "Resolved"]}
          />

          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#00373A] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#00373A]/90 transition ml-auto md:ml-0"
          >
            <Plus size={15} />
            <span>Submit Request</span>
          </button>
        </div>
      </div>

      {/* TICKETS TABLE */}
      <DataTable
        columns={columns}
        data={filteredRequests}
        loading={loading}
        defaultPageSize={10}
        emptyTitle="No employee tickets found"
        emptyDescription="There are no tickets matching the active query or filter criteria."
      />

      {/* SUBMIT REQUEST MODAL */}
      {showSubmitModal && (
        <Modal
          isOpen={true}
          title="Submit Employee Request"
          onClose={() => setShowSubmitModal(false)}
          size="md"
        >
          <form onSubmit={handleSubmitNewRequest} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#00373A] mb-1">
                Inquiry Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={newRequest.category}
                onChange={(e) => setNewRequest({ ...newRequest, category: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-[#00373A] focus:outline-none focus:border-[#00373A]"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#00373A] mb-1">
                Subject Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newRequest.subject}
                onChange={(e) => setNewRequest({ ...newRequest, subject: e.target.value })}
                placeholder="Brief summary of your request or issue..."
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-[#00373A] focus:outline-none focus:border-[#00373A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#00373A] mb-1">Priority</label>
              <select
                value={newRequest.priority}
                onChange={(e) => setNewRequest({ ...newRequest, priority: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-[#00373A] focus:outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#00373A] mb-1">
                Description & Details <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={newRequest.description}
                onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                placeholder="Provide detailed description, hardware requirements, or specific requests..."
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-[#00373A] focus:outline-none focus:border-[#00373A]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#00373A] px-5 py-2 text-xs font-bold text-white hover:bg-[#00373A]/90 transition disabled:opacity-50"
              >
                {saving ? "Submitting..." : "Submit Ticket"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* TICKET THREAD & RESOLUTION MODAL */}
      {activeTicket && (
        <Modal
          isOpen={true}
          title={`Ticket: ${activeTicket.id}`}
          onClose={() => setActiveTicket(null)}
          size="lg"
        >
          <div className="space-y-5">
            {/* Header info */}
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {activeTicket.category}
                </span>
                <h3 className="text-sm font-extrabold text-[#00373A]">{activeTicket.subject}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Opened by: <strong>{activeTicket.employeeName}</strong> on {activeTicket.submittedDate}
                </p>
              </div>
              <div className="text-right">
                <StatusBadge status={activeTicket.status} />
                <div className="mt-1">
                  <StatusBadge status={activeTicket.priority} size="sm" showDot={false} />
                </div>
              </div>
            </div>

            {/* Conversation Thread */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {(activeTicket.thread || []).map((msg, index) => (
                <div
                  key={index}
                  className={`rounded-2xl p-3.5 text-xs border ${
                    msg.role === "Employee"
                      ? "border-slate-200 bg-white"
                      : "border-[#00373A]/20 bg-[#00373A]/5"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-[#00373A] flex items-center gap-1.5">
                      <User size={13} />
                      {msg.sender} ({msg.role})
                    </span>
                    <span className="text-[10px] text-slate-400">{msg.time}</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed mt-1">{msg.message}</p>
                </div>
              ))}
            </div>

            {/* Reply and status update box */}
            <form onSubmit={handleSendReply} className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-[#00373A]">Post a Reply / Change Status</label>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Status:</span>
                  <select
                    value={ticketStatus}
                    onChange={(e) => setTicketStatus(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-[#00373A] focus:outline-none"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <textarea
                rows={2}
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your reply to employee or internal dispatch note..."
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-[#00373A] focus:outline-none focus:border-[#00373A]"
              />

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTicket(null)}
                  className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#00373A] px-5 py-2 text-xs font-bold text-white hover:bg-[#00373A]/90 transition disabled:opacity-50"
                >
                  <Send size={13} />
                  <span>{saving ? "Posting..." : "Send Response"}</span>
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}
