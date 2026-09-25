import React, { useEffect, useState } from "react";
import {
  Search,
  Filter,
  LogIn,
  LogOut,
  ShieldCheck,
  Monitor,
} from "lucide-react";
import api from "../../services/api";

function formatDateTime(dateValue) {
  if (!dateValue) {
    return {
      date: "-",
      time: "-",
    };
  }

  const date = new Date(dateValue);

  return {
    date: date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

function getDevice(userAgent = "") {
  if (!userAgent) return "Unknown device";

  let browser = "Browser";

  if (userAgent.includes("Edg/")) {
    browser = "Edge";
  } else if (userAgent.includes("Chrome/")) {
    browser = "Chrome";
  } else if (userAgent.includes("Firefox/")) {
    browser = "Firefox";
  } else if (userAgent.includes("Safari/")) {
    browser = "Safari";
  }

  let os = "Unknown OS";

  if (userAgent.includes("Windows")) {
    os = "Windows";
  } else if (userAgent.includes("Android")) {
    os = "Android";
  } else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
    os = "iOS";
  } else if (userAgent.includes("Mac OS")) {
    os = "macOS";
  } else if (userAgent.includes("Linux")) {
    os = "Linux";
  }

  return `${browser} / ${os}`;
}

export default function LoginHistory() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadLoginHistory();
  }, []);

  async function loadLoginHistory() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/audit");

      const data = response.data;

      const auditLogs = Array.isArray(data)
        ? data
        : data.logs || [];

      const loginLogs = auditLogs
        .filter(
          (item) =>
            item.module === "Authentication" &&
            item.action === "Login"
        )
        .map((item) => ({
          id: item.id,
          user: item.user || item.target_name || "Unknown User",
          email: item.email || "-",
          status: "Successful",
          ip: item.ip_address || "-",
          device: getDevice(item.user_agent),
          created_at: item.created_at,
        }));

      setLogs(loginLogs);
    } catch (err) {
      console.error("Failed to load login history:", err);

      if (err.status === 401) {
        setError("Session expired. Please login again.");
      } else {
        setError(
          err.message || "Failed to fetch login history."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  const filteredLogs = logs.filter((log) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      log.user.toLowerCase().includes(searchText) ||
      log.email.toLowerCase().includes(searchText) ||
      log.ip.toLowerCase().includes(searchText) ||
      log.device.toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "All" ||
      log.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const successful = logs.filter(
    (log) => log.status === "Successful"
  ).length;

  const failed = logs.filter(
    (log) => log.status === "Failed"
  ).length;

  return (
    <div className="min-h-full bg-[#f7f7f2] p-6">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-wider text-primary/40">
            Administration
          </p>

          <h1 className="mt-1 text-2xl font-black text-primary">
            Login History
          </h1>

          <p className="mt-1 text-sm text-primary/60">
            Monitor user login activity and authentication attempts.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Attempts"
            value={logs.length}
          />

          <StatCard
            label="Successful"
            value={successful}
          />

          <StatCard
            label="Failed Attempts"
            value={failed}
          />
        </div>

        {/* Main Card */}
        <div className="overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm">

          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b border-primary/10 p-5 md:flex-row md:items-center md:justify-between">

            <div className="relative w-full md:max-w-sm">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user, email or IP..."
                className="w-full rounded-xl border border-primary/10 bg-[#fafaf7] py-2.5 pl-9 pr-3 text-xs outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter
                size={15}
                className="text-primary/40"
              />

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="rounded-xl border border-primary/10 bg-[#fafaf7] px-3 py-2.5 text-xs font-semibold text-primary outline-none"
              >
                <option value="All">All Status</option>
                <option value="Successful">Successful</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="border-b border-red-100 bg-red-50 px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-red-600">
                  {error}
                </p>

                <button
                  onClick={loadLoginHistory}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">

              <thead>
                <tr className="border-b border-primary/10 bg-[#fafaf7]">

                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-primary/50">
                    User
                  </th>

                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-primary/50">
                    Status
                  </th>

                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-primary/50">
                    IP Address
                  </th>

                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-primary/50">
                    Device
                  </th>

                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-primary/50">
                    Date & Time
                  </th>

                </tr>
              </thead>

              <tbody>

                {loading && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-sm text-primary/40"
                    >
                      Loading login history...
                    </td>
                  </tr>
                )}

                {!loading &&
                  filteredLogs.map((log) => {
                    const dateTime = formatDateTime(
                      log.created_at
                    );

                    return (
                      <tr
                        key={log.id}
                        className="border-b border-primary/5 last:border-0 hover:bg-primary/[0.02]"
                      >

                        {/* User */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/5 text-primary">
                              <ShieldCheck size={16} />
                            </div>

                            <div>
                              <p className="text-sm font-bold text-primary">
                                {log.user}
                              </p>

                              <p className="text-[11px] text-primary/40">
                                {log.email}
                              </p>
                            </div>

                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-600">
                            <LogIn size={13} />
                            Successful
                          </span>
                        </td>

                        {/* IP */}
                        <td className="px-6 py-4">
                          <span className="rounded-lg bg-primary/5 px-2.5 py-1 text-xs font-mono text-primary/70">
                            {log.ip}
                          </span>
                        </td>

                        {/* Device */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-primary/60">
                            <Monitor size={15} />
                            {log.device}
                          </div>
                        </td>

                        {/* Date */}
                        <td className="whitespace-nowrap px-6 py-4">
                          <p className="text-xs font-semibold text-primary">
                            {dateTime.date}
                          </p>

                          <p className="mt-0.5 text-[11px] text-primary/40">
                            {dateTime.time}
                          </p>
                        </td>

                      </tr>
                    );
                  })}

                {!loading &&
                  filteredLogs.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-12 text-center text-sm text-primary/40"
                      >
                        No login records found.
                      </td>
                    </tr>
                  )}

              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="border-t border-primary/10 px-6 py-4">
            <p className="text-xs text-primary/40">
              Showing {filteredLogs.length} of{" "}
              {logs.length} login attempts
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-primary/10 bg-white p-5 shadow-sm">

      <p className="text-[11px] font-bold uppercase tracking-wide text-primary/40">
        {label}
      </p>

      <p className="mt-2 text-2xl font-black text-primary">
        {value}
      </p>

    </div>
  );
}