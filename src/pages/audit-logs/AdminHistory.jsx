import React, { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Shield,
  UserPlus,
  UserCog,
  Settings,
  Trash2,
} from "lucide-react";
import api from "../../services/api";

const actionStyles = {
  Created: "bg-green-50 text-green-600",
  Updated: "bg-blue-50 text-blue-600",
  Configuration: "bg-purple-50 text-purple-600",
  Deleted: "bg-red-50 text-red-600",
};

function ActionIcon({ action }) {
  if (action === "Created") return <UserPlus size={14} />;
  if (action === "Updated") return <UserCog size={14} />;
  if (action === "Configuration") return <Settings size={14} />;
  if (action === "Deleted") return <Trash2 size={14} />;

  return <Shield size={14} />;
}

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

export default function AdminHistory() {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAdminHistory();
  }, []);

  async function loadAdminHistory() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/audit/admin-history");

      const data = response.data;

      setHistory(
        Array.isArray(data)
          ? data
          : data.history || []
      );
    } catch (err) {
      console.error("Failed to load admin history:", err);

      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to fetch admin history."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  const filteredHistory = history.filter((item) => {
    const admin = item.admin || "";
    const target = item.target || "";
    const module = item.module || "";
    const description = item.description || "";
    const action = item.action || "";

    const searchText = search.toLowerCase();

    const matchesSearch =
      admin.toLowerCase().includes(searchText) ||
      target.toLowerCase().includes(searchText) ||
      module.toLowerCase().includes(searchText) ||
      description.toLowerCase().includes(searchText);

    const matchesAction =
      actionFilter === "All" ||
      action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const administrators = new Set(
    history
      .map((item) => item.admin)
      .filter(Boolean)
  ).size;

  const modulesAffected = new Set(
    history
      .map((item) => item.module)
      .filter(Boolean)
  ).size;

  return (
    <div className="min-h-full bg-[#f7f7f2] p-6">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-wider text-primary/40">
            Administration
          </p>

          <h1 className="mt-1 text-2xl font-black text-primary">
            Admin History
          </h1>

          <p className="mt-1 text-sm text-primary/60">
            Track important actions performed by administrators.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <StatCard
            label="Total Admin Actions"
            value={history.length}
          />

          <StatCard
            label="Administrators"
            value={administrators}
          />

          <StatCard
            label="Modules Affected"
            value={modulesAffected}
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
                placeholder="Search admin, target or module..."
                className="w-full rounded-xl border border-primary/10 bg-[#fafaf7] py-2.5 pl-9 pr-3 text-xs outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter
                size={15}
                className="text-primary/40"
              />

              <select
                value={actionFilter}
                onChange={(e) =>
                  setActionFilter(e.target.value)
                }
                className="rounded-xl border border-primary/10 bg-[#fafaf7] px-3 py-2.5 text-xs font-semibold text-primary outline-none"
              >
                <option value="All">All Actions</option>
                <option value="Created">Created</option>
                <option value="Updated">Updated</option>
                <option value="Configuration">
                  Configuration
                </option>
                <option value="Deleted">Deleted</option>
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
                  onClick={loadAdminHistory}
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
                    Administrator
                  </th>

                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-primary/50">
                    Action
                  </th>

                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-primary/50">
                    Target
                  </th>

                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-primary/50">
                    Module
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
                      Loading admin history...
                    </td>
                  </tr>
                )}

                {!loading &&
                  filteredHistory.map((item) => {
                    const dateTime = formatDateTime(
                      item.created_at
                    );

                    const admin =
                      item.admin || "Unknown Administrator";

                    const action =
                      item.action || "Activity";

                    const target =
                      item.target || "-";

                    const module =
                      item.module || "-";

                    const description =
                      item.description ||
                      "No description available";

                    return (
                      <tr
                        key={item.id}
                        className="border-b border-primary/5 last:border-0 hover:bg-primary/[0.02]"
                      >

                        {/* Administrator */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/5 text-primary">
                              <Shield size={16} />
                            </div>

                            <div>
                              <p className="text-sm font-bold text-primary">
                                {admin}
                              </p>

                              <p className="text-[11px] text-primary/40">
                                Administrator
                              </p>
                            </div>

                          </div>
                        </td>

                        {/* Action */}
                        <td className="px-6 py-4">

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                              actionStyles[action] ||
                              "bg-primary/5 text-primary"
                            }`}
                          >
                            <ActionIcon action={action} />
                            {action}
                          </span>

                          <p className="mt-1 max-w-xs text-xs text-primary/45">
                            {description}
                          </p>

                        </td>

                        {/* Target */}
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-primary">
                            {target}
                          </span>
                        </td>

                        {/* Module */}
                        <td className="px-6 py-4">
                          <span className="rounded-lg bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary/70">
                            {module}
                          </span>
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
                  filteredHistory.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-12 text-center text-sm text-primary/40"
                      >
                        No admin history found.
                      </td>
                    </tr>
                  )}

              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="border-t border-primary/10 px-6 py-4">
            <p className="text-xs text-primary/40">
              Showing {filteredHistory.length} of{" "}
              {history.length} admin actions
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