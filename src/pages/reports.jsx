import React, { useEffect, useState } from "react";
import {
  BarChart3,
  FileText,
  Users,
  Building2,
  Download,
  CalendarDays,
  Search,
  Eye,
  X,
  TrendingUp,
  Clock,
  CheckCircle2,
  Home,
  Palmtree,
} from "lucide-react";

import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";
import { useSearchParams } from "react-router-dom";

const tabs = [
  { id: "my", label: "My Reports", icon: FileText },
  { id: "team", label: "Team Reports", icon: Users },
  { id: "organization", label: "Organization Reports", icon: Building2 },
  { id: "export", label: "Export Center", icon: Download },
];

const reportCards = [
  {
    id: "attendance",
    title: "Attendance Report",
    description: "View attendance, present days, leave and WFH records.",
    icon: CalendarDays,
  },
  {
    id: "leave",
    title: "Leave Report",
    description: "View leave requests, approvals and leave usage.",
    icon: Palmtree,
  },
  {
    id: "employee",
    title: "Employee Report",
    description: "View employee information and organization details.",
    icon: Users,
  },
  {
    id: "performance",
    title: "Performance Report",
    description: "Attendance and working-hour based performance metrics.",
    icon: TrendingUp,
  },
];

export default function Reports() {
  const { user } = useAuth();
const [searchParams, setSearchParams] = useSearchParams();

const activeTab = searchParams.get("tab") || "my";
  const [selectedReport, setSelectedReport] = useState("");
  const [range, setRange] = useState("This Month");

  const [attendanceData, setAttendanceData] = useState([]);
  const [leaveData, setLeaveData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);

  const [reportScope, setReportScope] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!selectedReport) return;
    if (!user?.id) return;

    async function loadReport() {
      setLoading(true);
      setError("");

      try {
        let endpoint = "";

        if (selectedReport === "attendance") {
          endpoint = `/reports/attendance?range=${encodeURIComponent(range)}`;
        }

        if (selectedReport === "leave") {
          endpoint = "/reports/leave";
        }

        if (selectedReport === "employee") {
          endpoint = "/reports/employees";
        }

        if (selectedReport === "performance") {
          endpoint = `/reports/performance?range=${encodeURIComponent(
            range
          )}`;
        }

        const response = await api.get(endpoint, {
          headers: {
            "x-employee-id": user.id,
          },
        });

        if (selectedReport === "attendance") {
          setAttendanceData(response.data.data || []);
          setReportScope(response.data.scope || "");
        }

        if (selectedReport === "leave") {
          setLeaveData(response.data.data || []);
          setReportScope(response.data.scope || "");
        }

        if (selectedReport === "employee") {
          setEmployeeData(response.data.data || []);
          setReportScope(response.data.scope || "");
        }

        if (selectedReport === "performance") {
          setPerformanceData(response.data.data || []);
          setReportScope(response.data.scope || "");
        }
      } catch (err) {
        console.error("Report loading error:", err);

        setError(
          err.response?.data?.message ||
            err.message ||
            "Could not load report."
        );
      } finally {
        setLoading(false);
      }
    }

    loadReport();
  }, [selectedReport, range, user?.id]);

  function openReport(reportId) {
    setSelectedReport(reportId);
    setSearch("");
  }

  function closeReport() {
    setSelectedReport("");
    setError("");
    setSearch("");
  }

  function downloadCSV(filename, rows) {
    if (!rows || rows.length === 0) {
      alert("There is no data to export.");
      return;
    }

    const headers = Object.keys(rows[0]);

    const csvRows = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((header) => {
            const value = row[header];

            if (value === null || value === undefined) {
              return "";
            }

            const text = String(value).replace(/"/g, '""');
            return `"${text}"`;
          })
          .join(",")
      ),
    ];

    const blob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  function handleExport(type) {
    if (type === "attendance") {
      downloadCSV("attendance-report.csv", attendanceData);
    }

    if (type === "leave") {
      downloadCSV("leave-report.csv", leaveData);
    }

    if (type === "employee") {
      downloadCSV("employee-report.csv", employeeData);
    }

    if (type === "performance") {
      downloadCSV("performance-report.csv", performanceData);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary/50">
            REPORTS
          </p>

          <h1 className="mt-1 text-2xl font-extrabold text-primary">
            Reports & Analytics
          </h1>

          <p className="mt-1 text-sm text-primary/60">
            View attendance, leave, employee and performance reports.
          </p>
        </div>

        {selectedReport && (
          <button
            type="button"
            onClick={closeReport}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
          >
            <X size={16} />
            Close Report
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto">
        <div className="flex min-w-max gap-2 rounded-2xl border border-primary/10 bg-white p-2 shadow-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
  setSearchParams({ tab: tab.id });
  setSelectedReport("");
  setError("");
}}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  activeTab === tab.id
                    ? "bg-primary text-white"
                    : "text-primary/60 hover:bg-primary/5 hover:text-primary"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* My Reports */}
      {activeTab === "my" && !selectedReport && (
        <div className="space-y-5">
          {/* Filters */}
          <div className="flex flex-col gap-3 rounded-2xl border border-primary/10 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-extrabold text-primary">
                Available Reports
              </p>

              <p className="mt-1 text-xs text-primary/50">
                Select a report to view detailed information.
              </p>
            </div>

            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="rounded-xl border border-primary/15 bg-white px-3 py-2 text-sm font-semibold text-primary outline-none"
            >
              <option>This Month</option>
              <option>Last Month</option>
              <option>Last 3 Months</option>
              <option>This Year</option>
            </select>
          </div>

          {/* Report cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {reportCards.map((report) => {
              const Icon = report.icon;

              return (
                <div
                  key={report.id}
                  className="group rounded-2xl border border-primary/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/5 text-primary">
                      <Icon size={21} />
                    </div>

                    <BarChart3
                      size={17}
                      className="text-primary/20 transition group-hover:text-primary/50"
                    />
                  </div>

                  <h2 className="mt-5 text-base font-extrabold text-primary">
                    {report.title}
                  </h2>

                  <p className="mt-2 min-h-[40px] text-xs leading-5 text-primary/55">
                    {report.description}
                  </p>

                  <button
                    type="button"
                    onClick={() => openReport(report.id)}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-white transition hover:opacity-90"
                  >
                    <Eye size={14} />
                    View Report
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Team Reports */}
      {activeTab === "team" && !selectedReport && (
        <EmptyState
          icon={Users}
          title="Team Reports"
          description="Team-level reporting will appear here for managers and reviewers."
        />
      )}

      {/* Organization Reports */}
      {activeTab === "organization" && !selectedReport && (
        <EmptyState
          icon={Building2}
          title="Organization Reports"
          description="Organization-wide reporting will appear here for HR and administrative roles."
        />
      )}

      {/* Export Center */}
      {activeTab === "export" && !selectedReport && (
        <ExportCenter
          attendanceData={attendanceData}
          leaveData={leaveData}
          employeeData={employeeData}
          performanceData={performanceData}
          handleExport={handleExport}
          onOpenReport={openReport}
        />
      )}

      {/* Report viewer */}
      {selectedReport && (
        <div className="space-y-5">
          {/* Report toolbar */}
          <div className="rounded-2xl border border-primary/10 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary/40">
                  {reportScope
                    ? `${reportScope} scope`
                    : "Report details"}
                </p>

                <h2 className="mt-1 text-lg font-extrabold text-primary">
                  {getReportTitle(selectedReport)}
                </h2>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                {(selectedReport === "attendance" ||
                  selectedReport === "performance") && (
                  <select
                    value={range}
                    onChange={(e) => setRange(e.target.value)}
                    className="rounded-xl border border-primary/15 bg-white px-3 py-2 text-sm font-semibold text-primary outline-none"
                  >
                    <option>This Month</option>
                    <option>Last Month</option>
                    <option>Last 3 Months</option>
                    <option>This Year</option>
                  </select>
                )}

                <button
                  type="button"
                  onClick={() => handleExport(selectedReport)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/15 px-3 py-2 text-sm font-bold text-primary transition hover:bg-primary/5"
                >
                  <Download size={15} />
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          {loading && (
            <div className="rounded-2xl border border-primary/10 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />

              <p className="mt-3 text-sm font-semibold text-primary/60">
                Loading report...
              </p>
            </div>
          )}

          {!loading && !error && (
            <>
              {selectedReport === "attendance" && (
                <AttendanceReport
                  data={attendanceData}
                  range={range}
                  search={search}
                  setSearch={setSearch}
                />
              )}

              {selectedReport === "leave" && (
                <LeaveReport
                  data={leaveData}
                  search={search}
                  setSearch={setSearch}
                />
              )}

              {selectedReport === "employee" && (
                <EmployeeReport
                  data={employeeData}
                  search={search}
                  setSearch={setSearch}
                />
              )}

              {selectedReport === "performance" && (
                <PerformanceReport
                  data={performanceData}
                  range={range}
                  loading={loading}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   ATTENDANCE REPORT
========================================================= */

function AttendanceReport({ data, range, search, setSearch }) {
  const filteredData = data.filter((employee) => {
    const value = `${employee.full_name || ""} ${
      employee.employee_code || ""
    } ${employee.department || ""} ${employee.designation || ""}`;

    return value.toLowerCase().includes(search.toLowerCase());
  });

  const totalPresent = data.reduce(
    (sum, item) => sum + Number(item.present_days || 0),
    0
  );

  const totalWFH = data.reduce(
    (sum, item) => sum + Number(item.wfh_days || 0),
    0
  );

  const totalLeave = data.reduce(
    (sum, item) => sum + Number(item.leave_days || 0),
    0
  );

  const totalAbsent = data.reduce(
    (sum, item) => sum + Number(item.absent_days || 0),
    0
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Present"
          value={totalPresent}
          icon={CheckCircle2}
        />

        <SummaryCard
          title="Work From Home"
          value={totalWFH}
          icon={Home}
        />

        <SummaryCard
          title="Leave"
          value={totalLeave}
          icon={Palmtree}
        />

        <SummaryCard
          title="Absent"
          value={totalAbsent}
          icon={CalendarDays}
        />
      </div>

      <div className="rounded-2xl border border-primary/10 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-primary/10 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-primary">
              Attendance Report
            </h2>

            <p className="mt-1 text-xs text-primary/50">
              Attendance summary for {range}.
            </p>
          </div>

          <div className="relative w-full lg:w-72">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee..."
              className="w-full rounded-xl border border-primary/15 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary/30"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead>
              <tr className="border-b border-primary/10 bg-primary/[0.03] text-left text-xs font-bold uppercase tracking-wide text-primary/45">
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Total Days</th>
                <th className="px-5 py-3">Present</th>
                <th className="px-5 py-3">Absent</th>
                <th className="px-5 py-3">Leave</th>
                <th className="px-5 py-3">WFH</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((employee) => (
                <tr
                  key={employee.id}
                  className="border-b border-primary/5 last:border-0"
                >
                  <td className="px-5 py-4">
                    <p className="font-bold text-primary">
                      {employee.full_name}
                    </p>

                    <p className="mt-0.5 text-xs text-primary/45">
                      {employee.employee_code}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-primary/65">
                    {employee.department || "—"}
                  </td>

                  <td className="px-5 py-4 font-semibold text-primary">
                    {employee.total_days || 0}
                  </td>

                  <td className="px-5 py-4 font-semibold text-green-600">
                    {employee.present_days || 0}
                  </td>

                  <td className="px-5 py-4 font-semibold text-red-500">
                    {employee.absent_days || 0}
                  </td>

                  <td className="px-5 py-4 font-semibold text-orange-500">
                    {employee.leave_days || 0}
                  </td>

                  <td className="px-5 py-4 font-semibold text-purple-600">
                    {employee.wfh_days || 0}
                  </td>
                </tr>
              ))}

              {filteredData.length === 0 && (
                <EmptyTableRow message="No attendance records found." />
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   LEAVE REPORT
========================================================= */

function LeaveReport({ data, search, setSearch }) {
  const filteredData = data.filter((employee) => {
    const value = `${employee.full_name || ""} ${
      employee.employee_code || ""
    } ${employee.department || ""}`;

    return value.toLowerCase().includes(search.toLowerCase());
  });

  const totalRequests = data.reduce(
    (sum, item) => sum + Number(item.total_requests || 0),
    0
  );

  const approved = data.reduce(
    (sum, item) => sum + Number(item.approved || 0),
    0
  );

  const pending = data.reduce(
    (sum, item) => sum + Number(item.pending || 0),
    0
  );

  const rejected = data.reduce(
    (sum, item) => sum + Number(item.rejected || 0),
    0
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Total Requests" value={totalRequests} icon={FileText} />
        <SummaryCard title="Approved" value={approved} icon={CheckCircle2} />
        <SummaryCard title="Pending" value={pending} icon={Clock} />
        <SummaryCard title="Rejected" value={rejected} icon={X} />
      </div>

      <div className="rounded-2xl border border-primary/10 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-primary/10 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-primary">
              Leave Report
            </h2>

            <p className="mt-1 text-xs text-primary/50">
              Leave request and approval summary.
            </p>
          </div>

          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search employee..."
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead>
              <tr className="border-b border-primary/10 bg-primary/[0.03] text-left text-xs font-bold uppercase tracking-wide text-primary/45">
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Requests</th>
                <th className="px-5 py-3">Approved</th>
                <th className="px-5 py-3">Pending</th>
                <th className="px-5 py-3">Rejected</th>
                <th className="px-5 py-3">Approved Days</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((employee) => (
                <tr
                  key={employee.id}
                  className="border-b border-primary/5 last:border-0"
                >
                  <td className="px-5 py-4">
                    <p className="font-bold text-primary">
                      {employee.full_name}
                    </p>

                    <p className="mt-0.5 text-xs text-primary/45">
                      {employee.employee_code}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-primary/65">
                    {employee.department || "—"}
                  </td>

                  <td className="px-5 py-4 font-semibold text-primary">
                    {employee.total_requests || 0}
                  </td>

                  <td className="px-5 py-4 font-semibold text-green-600">
                    {employee.approved || 0}
                  </td>

                  <td className="px-5 py-4 font-semibold text-orange-500">
                    {employee.pending || 0}
                  </td>

                  <td className="px-5 py-4 font-semibold text-red-500">
                    {employee.rejected || 0}
                  </td>

                  <td className="px-5 py-4 font-semibold text-primary">
                    {employee.approved_days || 0}
                  </td>
                </tr>
              ))}

              {filteredData.length === 0 && (
                <EmptyTableRow message="No leave records found." />
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   EMPLOYEE REPORT
========================================================= */

function EmployeeReport({ data, search, setSearch }) {
  const filteredData = data.filter((employee) => {
    const value = `${employee.full_name || ""} ${
      employee.employee_code || ""
    } ${employee.email || ""} ${employee.department || ""} ${
      employee.designation || ""
    } ${employee.role || ""}`;

    return value.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="rounded-2xl border border-primary/10 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-primary/10 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-sm font-extrabold text-primary">
            Employee Report
          </h2>

          <p className="mt-1 text-xs text-primary/50">
            Employee directory and organization information.
          </p>
        </div>

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search employee..."
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-sm">
          <thead>
            <tr className="border-b border-primary/10 bg-primary/[0.03] text-left text-xs font-bold uppercase tracking-wide text-primary/45">
              <th className="px-5 py-3">Employee</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Department</th>
              <th className="px-5 py-3">Designation</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Joined</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((employee) => (
              <tr
                key={employee.id}
                className="border-b border-primary/5 last:border-0"
              >
                <td className="px-5 py-4">
                  <p className="font-bold text-primary">
                    {employee.full_name}
                  </p>

                  <p className="mt-0.5 text-xs text-primary/45">
                    {employee.employee_code}
                  </p>
                </td>

                <td className="px-5 py-4 text-primary/65">
                  {employee.email || "—"}
                </td>

                <td className="px-5 py-4 text-primary/65">
                  {employee.department || "—"}
                </td>

                <td className="px-5 py-4 text-primary/65">
                  {employee.designation || "—"}
                </td>

                <td className="px-5 py-4">
                  <span className="rounded-lg bg-primary/5 px-2 py-1 text-xs font-bold capitalize text-primary">
                    {(employee.role || "employee").replaceAll("_", " ")}
                  </span>
                </td>

                <td className="px-5 py-4 text-primary/65">
                  {formatDate(employee.joined_on)}
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`rounded-lg px-2 py-1 text-xs font-bold ${
                      employee.status === "active"
                        ? "bg-green-50 text-green-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {employee.status || "—"}
                  </span>
                </td>
              </tr>
            ))}

            {filteredData.length === 0 && (
              <EmptyTableRow message="No employee records found." />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =========================================================
   PERFORMANCE REPORT
========================================================= */

function PerformanceReport({ data, range, loading }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-primary/10 bg-white p-10 text-center shadow-sm">
        Loading performance report...
      </div>
    );
  }

  const totalEmployees = data.length;

  const totalDays = data.reduce(
    (sum, employee) => sum + Number(employee.total_days || 0),
    0
  );

  const totalPresent = data.reduce(
    (sum, employee) => sum + Number(employee.present_days || 0),
    0
  );

  const totalWFH = data.reduce(
    (sum, employee) => sum + Number(employee.wfh_days || 0),
    0
  );

  const totalLeave = data.reduce(
    (sum, employee) => sum + Number(employee.leave_days || 0),
    0
  );

  const totalWorkingDays = totalPresent + totalWFH;

  const overallAttendance =
    totalDays > 0
      ? ((totalWorkingDays / totalDays) * 100).toFixed(2)
      : "0.00";

  const averageHours =
    totalEmployees > 0
      ? (
          data.reduce(
            (sum, employee) =>
              sum + Number(employee.average_working_hours || 0),
            0
          ) / totalEmployees
        ).toFixed(2)
      : "0.00";

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-extrabold text-primary">
          Performance Report
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Attendance and working-hour based performance metrics · {range}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Employees"
          value={totalEmployees}
          icon={Users}
        />

        <SummaryCard
          title="Attendance Rate"
          value={`${overallAttendance}%`}
          icon={TrendingUp}
        />

        <SummaryCard
          title="Working Days"
          value={totalWorkingDays}
          icon={CheckCircle2}
        />

        <SummaryCard
          title="Avg Working Hours"
          value={`${averageHours} hrs`}
          icon={Clock}
        />
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatusSummary
          title="Present"
          value={totalPresent}
          icon={CheckCircle2}
          className="text-green-600 bg-green-50"
        />

        <StatusSummary
          title="Work From Home"
          value={totalWFH}
          icon={Home}
          className="text-purple-600 bg-purple-50"
        />

        <StatusSummary
          title="Leave"
          value={totalLeave}
          icon={Palmtree}
          className="text-orange-600 bg-orange-50"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-primary/10 bg-white shadow-sm">
        <div className="border-b border-primary/10 p-4">
          <h2 className="text-sm font-extrabold text-primary">
            Employee Performance
          </h2>

          <p className="mt-1 text-xs text-primary/50">
            Attendance and working-hour metrics for each employee.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm">
            <thead>
              <tr className="border-b border-primary/10 bg-primary/[0.03] text-left text-xs font-bold uppercase tracking-wide text-primary/45">
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Attendance</th>
                <th className="px-5 py-3">Present</th>
                <th className="px-5 py-3">WFH</th>
                <th className="px-5 py-3">Leave</th>
                <th className="px-5 py-3">Avg Hours</th>
              </tr>
            </thead>

            <tbody>
              {data.map((employee) => (
                <tr
                  key={employee.id}
                  className="border-b border-primary/5 last:border-0"
                >
                  <td className="px-5 py-4">
                    <p className="font-bold text-primary">
                      {employee.full_name}
                    </p>

                    <p className="mt-0.5 text-xs text-primary/45">
                      {employee.employee_code}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-primary/65">
                    {employee.department || "—"}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-lg px-2 py-1 text-xs font-bold ${
                        Number(employee.attendance_rate || 0) >= 80
                          ? "bg-green-50 text-green-600"
                          : Number(employee.attendance_rate || 0) >= 60
                          ? "bg-orange-50 text-orange-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {Number(employee.attendance_rate || 0).toFixed(2)}%
                    </span>
                  </td>

                  <td className="px-5 py-4 font-semibold text-green-600">
                    {employee.present_days || 0}
                  </td>

                  <td className="px-5 py-4 font-semibold text-purple-600">
                    {employee.wfh_days || 0}
                  </td>

                  <td className="px-5 py-4 font-semibold text-orange-500">
                    {employee.leave_days || 0}
                  </td>

                  <td className="px-5 py-4 font-semibold text-primary">
                    {Number(
                      employee.average_working_hours || 0
                    ).toFixed(2)}{" "}
                    hrs
                  </td>
                </tr>
              ))}

              {data.length === 0 && (
                <EmptyTableRow message="No performance records found." />
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   EXPORT CENTER
========================================================= */

function ExportCenter({
  attendanceData,
  leaveData,
  employeeData,
  performanceData,
  handleExport,
  onOpenReport,
}) {
  const exports = [
    {
      id: "attendance",
      title: "Attendance CSV",
      description: "Export attendance records and attendance summary.",
      icon: CalendarDays,
      count: attendanceData.length,
    },
    {
      id: "leave",
      title: "Leave CSV",
      description: "Export leave requests and approval summary.",
      icon: Palmtree,
      count: leaveData.length,
    },
    {
      id: "employee",
      title: "Employee CSV",
      description: "Export employee information and organization details.",
      icon: Users,
      count: employeeData.length,
    },
    {
      id: "performance",
      title: "Performance CSV",
      description: "Export attendance and working-hour performance metrics.",
      icon: TrendingUp,
      count: performanceData.length,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-primary/10 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-extrabold text-primary">
          Export Center
        </h2>

        <p className="mt-1 text-sm text-primary/55">
          Download report data as CSV files for further analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {exports.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              className="rounded-2xl border border-primary/10 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/5 text-primary">
                  <Icon size={20} />
                </div>

                <span className="rounded-lg bg-primary/5 px-2 py-1 text-xs font-bold text-primary/60">
                  {item.count} records
                </span>
              </div>

              <h3 className="mt-4 text-base font-extrabold text-primary">
                {item.title}
              </h3>

              <p className="mt-1 text-sm text-primary/55">
                {item.description}
              </p>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => onOpenReport(item.id)}
                  className="inline-flex items-center gap-2 rounded-xl border border-primary/15 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/5"
                >
                  <Eye size={14} />
                  View
                </button>

                <button
                  type="button"
                  onClick={() => handleExport(item.id)}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white hover:opacity-90"
                >
                  <Download size={14} />
                  Export CSV
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   COMMON COMPONENTS
========================================================= */

function SummaryCard({ title, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-primary/10 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-primary/50">
            {title}
          </p>

          <p className="mt-2 text-2xl font-extrabold text-primary">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary">
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

function StatusSummary({ title, value, icon: Icon, className }) {
  return (
    <div className="rounded-2xl border border-primary/10 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${className}`}
        >
          <Icon size={20} />
        </div>

        <div>
          <p className="text-xs font-semibold text-primary/50">
            {title}
          </p>

          <p className="mt-1 text-xl font-extrabold text-primary">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="relative w-full lg:w-72">
      <Search
        size={15}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40"
      />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-primary/15 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary/30"
      />
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="rounded-2xl border border-primary/10 bg-white p-12 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5 text-primary">
        <Icon size={25} />
      </div>

      <h2 className="mt-4 text-lg font-extrabold text-primary">
        {title}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm text-primary/50">
        {description}
      </p>
    </div>
  );
}

function EmptyTableRow({ message }) {
  return (
    <tr>
      <td
        colSpan={10}
        className="px-5 py-10 text-center text-sm text-primary/40"
      >
        {message}
      </td>
    </tr>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getReportTitle(report) {
  if (report === "attendance") return "Attendance Report";
  if (report === "leave") return "Leave Report";
  if (report === "employee") return "Employee Report";
  if (report === "performance") return "Performance Report";

  return "Report";
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}