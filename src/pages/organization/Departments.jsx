import React, { useEffect, useState } from "react";

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    code: "",
    manager: "",
  });

  const loadDepartments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/organization/departments"
      );

      if (!response.ok) {
        throw new Error("Could not load departments");
      }

      const data = await response.json();

      setDepartments(data.departments || []);
    } catch (err) {
      console.error("LOAD DEPARTMENTS ERROR:", err);
      setError("Could not load departments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.code.trim()) return;

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/organization/departments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
  name: form.name,
  code: form.code,
  manager: form.manager,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not create department");
      }

      setDepartments((previous) => [
        ...previous,
        data.department,
      ]);

      setForm({
        name: "",
        code: "",
        manager: "",
      });

      setShowForm(false);
    } catch (err) {
      console.error("CREATE DEPARTMENT ERROR:", err);
      setError(err.message || "Could not create department");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-full bg-[#f7f7f2] p-6">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary/40">
              Organization
            </p>

            <h1 className="mt-1 text-2xl font-black text-primary">
              Departments
            </h1>

            <p className="mt-1 text-sm text-primary/60">
              Manage departments and their organizational structure.
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white transition hover:opacity-90"
          >
            + Add Department
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Departments"
            value={departments.length}
          />

          <StatCard
            label="Active"
            value={
              departments.filter(
                (d) => d.status === "active"
              ).length
            }
          />

          <StatCard
            label="Inactive"
            value={
              departments.filter(
                (d) => d.status !== "active"
              ).length
            }
          />
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm">
          <div className="border-b border-primary/10 px-6 py-4">
            <h2 className="text-sm font-bold text-primary">
              All Departments
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-primary/10 bg-[#fafaf7]">
                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-primary/50">
                    Department
                  </th>

                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-primary/50">
                    Code
                  </th>

                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-primary/50">
                    Manager
                  </th>

                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-primary/50">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-10 text-center text-sm text-primary/50"
                    >
                      Loading departments...
                    </td>
                  </tr>
                ) : departments.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-10 text-center text-sm text-primary/50"
                    >
                      No departments found.
                    </td>
                  </tr>
                ) : (
                  departments.map((department) => (
                    <tr
                      key={department.id}
                      className="border-b border-primary/5 last:border-0 hover:bg-primary/[0.02]"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-primary">
                          {department.name}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-lg bg-primary/5 px-2.5 py-1 text-xs font-bold text-primary">
                          {department.code}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-primary/60">
                        —
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                            department.status === "active"
                              ? "bg-green-50 text-green-600"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {department.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Department Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-primary">
                    Add Department
                  </h2>

                  <p className="mt-1 text-xs text-primary/50">
                    Create a new department.
                  </p>
                </div>

                <button
                  onClick={() => setShowForm(false)}
                  className="text-lg text-primary/40 hover:text-primary"
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <Field
                  label="Department Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Marketing"
                  required
                />

                <Field
                  label="Department Code"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="e.g. MKT"
                  required
                />

                <Field
                  label="Department Manager"
                  name="manager"
                  value={form.manager}
                  onChange={handleChange}
                  placeholder="Manager name"
                />

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-xl border border-primary/10 px-4 py-2.5 text-xs font-bold text-primary"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50"
                  >
                    {saving
                      ? "Creating..."
                      : "Create Department"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
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

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold text-primary/70">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-primary/10 bg-[#fafaf7] px-3.5 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
    </div>
  );
}
