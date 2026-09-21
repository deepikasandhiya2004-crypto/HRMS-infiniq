import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Plus,
  Eye,
  Edit2,
  UserX,
  UserCheck,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Shield,
  Heart,
  Clock,
  Palmtree,
  CheckCircle2,
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
import Tabs from "../../components/common/Tabs.jsx";

export default function Employees() {
  const [searchParams] = useSearchParams();
  const { role } = useAuth();
  const toast = useToast();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewEmployee, setViewEmployee] = useState(null);
  const [profileTab, setProfileTab] = useState("personal");
  const [editEmployee, setEditEmployee] = useState(null);
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  // Add / Edit form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "Engineering",
    designation: "Software Engineer",
    location: "Bangalore (HQ)",
    employmentType: "Full-Time",
    joiningDate: new Date().toISOString().split("T")[0],
    reportingManager: "Vikram Malhotra",
    status: "Active",
    dob: "1996-01-01",
    gender: "Male",
    address: "",
    emergencyName: "",
    emergencyRelation: "",
    emergencyPhone: "",
  });

  useEffect(() => {
    loadEmployees();
    const handleStorage = (e) => {
      if (e.detail?.key?.includes("employees")) loadEmployees();
    };
    window.addEventListener("hrms_storage_change", handleStorage);
    return () => window.removeEventListener("hrms_storage_change", handleStorage);
  }, []);

  async function loadEmployees() {
    try {
      setLoading(true);
      const data = await hrmsService.getEmployees();
      setEmployees(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  }

  // Deactivate or reactivate
  async function handleToggleStatus() {
    if (!deactivateTarget) return;
    try {
      const newStatus = deactivateTarget.status === "Active" ? "Inactive" : "Active";
      await hrmsService.toggleEmployeeStatus(deactivateTarget.id, newStatus);
      toast.success(
        `Employee ${deactivateTarget.name} has been marked as ${newStatus}.`
      );
      setDeactivateTarget(null);
      await loadEmployees();
    } catch (err) {
      toast.error("Failed to update employee status");
    }
  }

  // Add new employee submit
  async function handleAddSubmit(e) {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Name and email are mandatory.");
      return;
    }

    try {
      setSaving(true);
      const created = await hrmsService.createEmployee(formData);
      toast.success(`Employee ${created.name} (${created.id}) created successfully!`);
      setShowAddModal(false);
      resetForm();
      await loadEmployees();
    } catch (err) {
      toast.error("Failed to create employee");
    } finally {
      setSaving(false);
    }
  }

  // Edit employee submit
  async function handleEditSubmit(e) {
    e.preventDefault();
    if (!editEmployee) return;

    try {
      setSaving(true);
      await hrmsService.updateEmployee(editEmployee.id, {
        name: formData.name,
        department: formData.department,
        designation: formData.designation,
        location: formData.location,
        employmentType: formData.employmentType,
        reportingManager: formData.reportingManager,
        status: formData.status,
        personal: {
          ...editEmployee.personal,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
        },
      });
      toast.success(`Employee profile updated for ${formData.name}`);
      setEditEmployee(null);
      resetForm();
      await loadEmployees();
    } catch (err) {
      toast.error("Failed to update employee");
    } finally {
      setSaving(false);
    }
  }

  function openEdit(emp) {
    setFormData({
      name: emp.name,
      email: emp.personal?.email || "",
      phone: emp.personal?.phone || "",
      department: emp.department,
      designation: emp.designation,
      location: emp.location,
      employmentType: emp.employmentType,
      joiningDate: emp.joiningDate,
      reportingManager: emp.reportingManager,
      status: emp.status,
      dob: emp.personal?.dob || "",
      gender: emp.personal?.gender || "Male",
      address: emp.personal?.address || "",
      emergencyName: emp.emergency?.name || "",
      emergencyRelation: emp.emergency?.relation || "",
      emergencyPhone: emp.emergency?.phone || "",
    });
    setEditEmployee(emp);
  }

  function resetForm() {
    setFormData({
      name: "",
      email: "",
      phone: "",
      department: "Engineering",
      designation: "Software Engineer",
      location: "Bangalore (HQ)",
      employmentType: "Full-Time",
      joiningDate: new Date().toISOString().split("T")[0],
      reportingManager: "Vikram Malhotra",
      status: "Active",
      dob: "1996-01-01",
      gender: "Male",
      address: "",
      emergencyName: "",
      emergencyRelation: "",
      emergencyPhone: "",
    });
  }

  // Unique filter lists
  const departments = useMemo(
    () => Array.from(new Set(employees.map((e) => e.department))),
    [employees]
  );
  const employmentTypes = useMemo(
    () => Array.from(new Set(employees.map((e) => e.employmentType))),
    [employees]
  );

  // Filtered dataset
  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const q = search.toLowerCase();
      const matchesSearch =
        e.name.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q) ||
        e.designation.toLowerCase().includes(q) ||
        (e.personal?.email && e.personal.email.toLowerCase().includes(q));

      const matchesDept = !deptFilter || e.department === deptFilter;
      const matchesStatus = !statusFilter || e.status === statusFilter;
      const matchesType = !typeFilter || e.employmentType === typeFilter;

      return matchesSearch && matchesDept && matchesStatus && matchesType;
    });
  }, [employees, search, deptFilter, statusFilter, typeFilter]);

  const columns = [
    {
      key: "name",
      header: "Employee",
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.avatar}
            alt={val}
            className="h-9 w-9 rounded-full object-cover border border-[#00373A]/10 shadow-xs"
          />
          <div>
            <span className="font-bold text-[#00373A]">{val}</span>
            <p className="text-[11px] text-slate-400 font-mono">{row.id}</p>
          </div>
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
      key: "location",
      header: "Location",
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-medium text-slate-700">{val}</span>
          <span className="ml-1 text-[10px] text-slate-400">({row.employmentType})</span>
        </div>
      ),
    },
    {
      key: "joiningDate",
      header: "Joining Date",
      sortable: true,
      render: (val) => <span className="text-xs text-slate-600">{val}</span>,
    },
    {
      key: "reportingManager",
      header: "Reporting Manager",
      render: (val) => <span className="text-xs font-medium text-slate-700">{val}</span>,
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
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => {
              setViewEmployee(row);
              setProfileTab("personal");
            }}
            className="p-1.5 text-slate-500 hover:text-[#00373A] hover:bg-slate-100 rounded-lg transition"
            title="View Full Profile"
          >
            <Eye size={15} />
          </button>
          <button
            type="button"
            onClick={() => openEdit(row)}
            className="p-1.5 text-slate-500 hover:text-[#00373A] hover:bg-slate-100 rounded-lg transition"
            title="Edit Employee"
          >
            <Edit2 size={15} />
          </button>
          <button
            type="button"
            onClick={() => setDeactivateTarget(row)}
            className={`p-1.5 rounded-lg transition ${
              row.status === "Active"
                ? "text-rose-500 hover:bg-rose-50"
                : "text-emerald-600 hover:bg-emerald-50"
            }`}
            title={row.status === "Active" ? "Deactivate Employee" : "Reactivate Employee"}
          >
            {row.status === "Active" ? <UserX size={15} /> : <UserCheck size={15} />}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* TOOLBAR & CONTROLS */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-2xl bg-white p-4 border border-[#00373A]/10 shadow-sm">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by name, ID, title, or email..."
          className="w-full md:w-80"
        />

        <div className="flex flex-wrap items-center gap-2.5">
          <FilterDropdown
            label="Department"
            value={deptFilter}
            onChange={setDeptFilter}
            options={departments}
          />
          <FilterDropdown
            label="Employment Type"
            value={typeFilter}
            onChange={setTypeFilter}
            options={employmentTypes}
          />
          <FilterDropdown
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={["Active", "On Leave", "Probation", "Resigned", "Inactive"]}
          />

          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#00373A] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#00373A]/90 transition ml-auto md:ml-0"
          >
            <Plus size={15} />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* DATA TABLE */}
      <DataTable
        columns={columns}
        data={filteredEmployees}
        loading={loading}
        defaultPageSize={10}
        emptyTitle="No employees found"
        emptyDescription="Try updating your search query or department filters."
      />

      {/* FULL EMPLOYEE PROFILE MODAL / DRAWER */}
      {viewEmployee && (
        <Modal
          isOpen={true}
          title={`Employee Dossier: ${viewEmployee.name}`}
          onClose={() => setViewEmployee(null)}
          size="lg"
        >
          <div className="space-y-6">
            {/* Header Persona Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <div className="flex items-center gap-3.5">
                <img
                  src={viewEmployee.avatar}
                  alt={viewEmployee.name}
                  className="h-16 w-16 rounded-2xl object-cover border-2 border-white shadow-sm"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-[#00373A]">
                      {viewEmployee.name}
                    </h3>
                    <StatusBadge status={viewEmployee.status} size="sm" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">
                    {viewEmployee.designation} • {viewEmployee.department}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    ID: {viewEmployee.id} • Joined: {viewEmployee.joiningDate}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Tabs */}
            <Tabs
              tabs={[
                { id: "personal", label: "Personal Info" },
                { id: "employment", label: "Employment" },
                { id: "emergency", label: "Emergency Contact" },
                { id: "documents", label: "Documents" },
                { id: "leave", label: "Leave Info" },
                { id: "attendance", label: "Attendance" },
              ]}
              activeTab={profileTab}
              onChange={setProfileTab}
              variant="underline"
            />

            {/* Tab 1: Personal Info */}
            {profileTab === "personal" && (
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium">Full Legal Name</span>
                  <p className="font-bold text-[#00373A] mt-1">{viewEmployee.name}</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium">Date of Birth</span>
                  <p className="font-bold text-[#00373A] mt-1">
                    {viewEmployee.personal?.dob || "Not specified"}
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium">Gender</span>
                  <p className="font-bold text-[#00373A] mt-1">
                    {viewEmployee.personal?.gender || "Not specified"}
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium">Phone Number</span>
                  <p className="font-bold text-[#00373A] mt-1">
                    {viewEmployee.personal?.phone || "Not specified"}
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium">Corporate Email</span>
                  <p className="font-bold text-[#00373A] mt-1">
                    {viewEmployee.personal?.email || "Not specified"}
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium">Residential Address</span>
                  <p className="font-bold text-[#00373A] mt-1">
                    {viewEmployee.personal?.address || "Not specified"}
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: Employment */}
            {profileTab === "employment" && (
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium">Employee ID</span>
                  <p className="font-bold text-[#00373A] mt-1">{viewEmployee.id}</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium">Department</span>
                  <p className="font-bold text-[#00373A] mt-1">{viewEmployee.department}</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium">Official Designation</span>
                  <p className="font-bold text-[#00373A] mt-1">{viewEmployee.designation}</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium">Employment Type</span>
                  <p className="font-bold text-[#00373A] mt-1">{viewEmployee.employmentType}</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium">Joining Date</span>
                  <p className="font-bold text-[#00373A] mt-1">{viewEmployee.joiningDate}</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium">Reporting Manager</span>
                  <p className="font-bold text-[#00373A] mt-1">{viewEmployee.reportingManager}</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 col-span-2">
                  <span className="text-slate-400 font-medium">Work Location Hub</span>
                  <p className="font-bold text-[#00373A] mt-1">{viewEmployee.location}</p>
                </div>
              </div>
            )}

            {/* Tab 3: Emergency Contact */}
            {profileTab === "emergency" && (
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium">Contact Person</span>
                  <p className="font-bold text-[#00373A] mt-1">
                    {viewEmployee.emergency?.name || "Not provided"}
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium">Relationship</span>
                  <p className="font-bold text-[#00373A] mt-1">
                    {viewEmployee.emergency?.relation || "Not provided"}
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium">Emergency Phone</span>
                  <p className="font-bold text-[#00373A] mt-1">
                    {viewEmployee.emergency?.phone || "Not provided"}
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium">Address</span>
                  <p className="font-bold text-[#00373A] mt-1">
                    {viewEmployee.emergency?.address || "Same as primary residence"}
                  </p>
                </div>
              </div>
            )}

            {/* Tab 4: Documents */}
            {profileTab === "documents" && (
              <div className="space-y-3">
                {(viewEmployee.documents || []).map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-100 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText size={18} className="text-[#00373A]" />
                      <div>
                        <p className="font-bold text-[#00373A]">{doc.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {doc.type} • {doc.size} • Uploaded: {doc.date}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => alert(`Simulating secure download for ${doc.name}`)}
                      className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[#00373A] border border-slate-200 hover:bg-slate-50"
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 5: Leave Summary */}
            {profileTab === "leave" && (
              <div className="grid grid-cols-4 gap-3 text-center text-xs">
                <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                  <span className="text-slate-400 uppercase font-semibold text-[10px]">Total Quota</span>
                  <p className="text-base font-extrabold text-[#00373A] mt-1">
                    {viewEmployee.leaveSummary?.total || 30}
                  </p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-3.5 border border-emerald-100">
                  <span className="text-emerald-700 uppercase font-semibold text-[10px]">Available</span>
                  <p className="text-base font-extrabold text-emerald-700 mt-1">
                    {viewEmployee.leaveSummary?.available || 20}
                  </p>
                </div>
                <div className="rounded-xl bg-amber-50 p-3.5 border border-amber-100">
                  <span className="text-amber-700 uppercase font-semibold text-[10px]">Utilized</span>
                  <p className="text-base font-extrabold text-amber-700 mt-1">
                    {viewEmployee.leaveSummary?.used || 10}
                  </p>
                </div>
                <div className="rounded-xl bg-purple-50 p-3.5 border border-purple-100">
                  <span className="text-purple-700 uppercase font-semibold text-[10px]">Pending</span>
                  <p className="text-base font-extrabold text-purple-700 mt-1">
                    {viewEmployee.leaveSummary?.pending || 0}
                  </p>
                </div>
              </div>
            )}

            {/* Tab 6: Attendance Summary */}
            {profileTab === "attendance" && (
              <div className="grid grid-cols-4 gap-3 text-center text-xs">
                <div className="rounded-xl bg-emerald-50 p-3.5 border border-emerald-100">
                  <span className="text-emerald-700 uppercase font-semibold text-[10px]">Present</span>
                  <p className="text-base font-extrabold text-emerald-700 mt-1">
                    {viewEmployee.attendanceSummary?.present || 20} Days
                  </p>
                </div>
                <div className="rounded-xl bg-rose-50 p-3.5 border border-rose-100">
                  <span className="text-rose-700 uppercase font-semibold text-[10px]">Absent</span>
                  <p className="text-base font-extrabold text-rose-700 mt-1">
                    {viewEmployee.attendanceSummary?.absent || 0} Days
                  </p>
                </div>
                <div className="rounded-xl bg-amber-50 p-3.5 border border-amber-100">
                  <span className="text-amber-700 uppercase font-semibold text-[10px]">Late Marks</span>
                  <p className="text-base font-extrabold text-amber-700 mt-1">
                    {viewEmployee.attendanceSummary?.late || 0}
                  </p>
                </div>
                <div className="rounded-xl bg-blue-50 p-3.5 border border-blue-100">
                  <span className="text-blue-700 uppercase font-semibold text-[10px]">On Leave</span>
                  <p className="text-base font-extrabold text-blue-700 mt-1">
                    {viewEmployee.attendanceSummary?.leave || 0} Days
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewEmployee(null)}
                className="rounded-xl bg-[#00373A] px-5 py-2 text-xs font-bold text-white hover:bg-[#00373A]/90 transition"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ADD / EDIT EMPLOYEE MODAL */}
      {(showAddModal || editEmployee) && (
        <Modal
          isOpen={true}
          title={editEmployee ? `Edit Employee: ${editEmployee.name}` : "Add New Employee"}
          onClose={() => {
            setShowAddModal(false);
            setEditEmployee(null);
          }}
          size="lg"
        >
          <form onSubmit={editEmployee ? handleEditSubmit : handleAddSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-[#00373A] mb-1">
                  Full Legal Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-[#00373A] focus:outline-none focus:border-[#00373A]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#00373A] mb-1">
                  Corporate Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ramesh.k@infiniq.com"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-[#00373A] focus:outline-none focus:border-[#00373A]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#00373A] mb-1">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-[#00373A] focus:outline-none"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Finance & Accounts">Finance & Accounts</option>
                  <option value="Sales & Marketing">Sales & Marketing</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#00373A] mb-1">Designation</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g. Staff Engineer"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-[#00373A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#00373A] mb-1">Location</label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-[#00373A] focus:outline-none"
                >
                  <option value="Bangalore (HQ)">Bangalore (HQ)</option>
                  <option value="Mumbai Branch">Mumbai Branch</option>
                  <option value="Hyderabad Technology Center">Hyderabad Technology Center</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#00373A] mb-1">Employment Type</label>
                <select
                  value={formData.employmentType}
                  onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-[#00373A] focus:outline-none"
                >
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Contract">Contract</option>
                  <option value="Intern">Intern</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#00373A] mb-1">Joining Date</label>
                <input
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-[#00373A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#00373A] mb-1">Reporting Manager</label>
                <input
                  type="text"
                  value={formData.reportingManager}
                  onChange={(e) => setFormData({ ...formData, reportingManager: e.target.value })}
                  placeholder="e.g. Vikram Malhotra"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-[#00373A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#00373A] mb-1">Mobile Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98000 00000"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-[#00373A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#00373A] mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-[#00373A] focus:outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Probation">Probation</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Resigned">Resigned</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setEditEmployee(null);
                }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#00373A] px-5 py-2 text-xs font-bold text-white hover:bg-[#00373A]/90 transition disabled:opacity-50"
              >
                {saving ? "Saving..." : editEmployee ? "Update Profile" : "Create Employee"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* CONFIRM DEACTIVATE / REACTIVATE */}
      <ConfirmDialog
        isOpen={!!deactivateTarget}
        title={
          deactivateTarget?.status === "Active"
            ? "Deactivate Employee"
            : "Reactivate Employee"
        }
        message={`Are you sure you want to change the status of ${deactivateTarget?.name} (${deactivateTarget?.id}) to ${
          deactivateTarget?.status === "Active" ? "Inactive" : "Active"
        }?`}
        confirmLabel={deactivateTarget?.status === "Active" ? "Deactivate" : "Reactivate"}
        variant={deactivateTarget?.status === "Active" ? "danger" : "success"}
        onConfirm={handleToggleStatus}
        onCancel={() => setDeactivateTarget(null)}
      />
    </div>
  );
}
