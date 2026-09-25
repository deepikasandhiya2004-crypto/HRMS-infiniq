import React, { useEffect, useState } from "react";

export default function Designations() {
  const [designations, setDesignations] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    title: "",
    code: "",
    department: "",
    level: "Junior Level",
  });

  // Load designations from backend
  useEffect(() => {
    loadDesignations();
  }, []);

  const loadDesignations = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/organization/designations"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load designations");
      }

      const formattedDesignations = (data.designations || []).map((item) => ({
        id: item.id,
        title: item.name,
        code: item.code,
        department: "—",
        level: "—",
        status:
          item.status?.toLowerCase() === "active"
            ? "Active"
            : "Inactive",
      }));

      setDesignations(formattedDesignations);
    } catch (error) {
      console.error("LOAD DESIGNATIONS ERROR:", error);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Create designation in database
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.code.trim()) return;

    try {
      const response = await fetch(
        "http://localhost:5000/api/organization/designations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.title,
            code: form.code,
            description: "",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create designation");
      }

      const newDesignation = data.designation;

      setDesignations((prev) => [
        ...prev,
        {
          id: newDesignation.id,
          title: newDesignation.name,
          code: newDesignation.code,
          department: "—",
          level: "—",
          status: "Active",
        },
      ]);

      setForm({
        title: "",
        code: "",
        department: "",
        level: "Junior Level",
      });

      setShowForm(false);
    } catch (error) {
      console.error("CREATE DESIGNATION ERROR:", error);
      alert(error.message);
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
              Designations
            </h1>

            <p className="mt-1 text-sm text-primary/60">
              Manage employee job titles, levels and organizational roles.
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white transition hover:opacity-90"
          >
            + Add Designation
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Designations"
            value={designations.length}
          />

          <StatCard
            label="Active"
            value={
              designations.filter(
                (item) => item.status === "Active"
              ).length
            }
          />

          <StatCard
            label="Departments Covered"
            value={
              new Set(
                designations
                  .map((item) => item.department)
                  .filter((item) => item !== "—")
              ).size
            }
          />
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm">
          <div className="border-b border-primary/10 px-6 py-4">
            <h2 className="text-sm font-bold text-primary">
              All Designations
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-primary/10 bg-[#fafaf7]">
                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-primary/50">
                    Designation
                  </th>

                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-primary/50">
                    Code
                  </th>

                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-primary/50">
                    Department
                  </th>

                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-primary/50">
                    Level
                  </th>

                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-primary/50">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {designations.map((designation) => (
                  <tr
                    key={designation.id}
                    className="border-b border-primary/5 last:border-0 hover:bg-primary/[0.02]"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-primary">
                        {designation.title}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-primary/5 px-2.5 py-1 text-xs font-bold text-primary">
                        {designation.code}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-primary/60">
                      {designation.department}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-accent/10 px-2.5 py-1 text-xs font-semibold text-primary">
                        {designation.level}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          designation.status === "Active"
                            ? "bg-green-50 text-green-600"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {designation.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Designation Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-primary">
                    Add Designation
                  </h2>

                  <p className="mt-1 text-xs text-primary/50">
                    Create a new employee designation.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-lg text-primary/40 hover:text-primary"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">

                <Field
                  label="Designation Title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Product Designer"
                  required
                />

                <Field
                  label="Designation Code"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="e.g. PD"
                  required
                />

                <Field
                  label="Department"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  placeholder="e.g. Product"
                />

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-primary/70">
                    Level
                  </label>

                  <select
                    name="level"
                    value={form.level}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-primary/10 bg-[#fafaf7] px-3.5 py-2.5 text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  >
                    <option>Junior Level</option>
                    <option>Mid Level</option>
                    <option>Senior Level</option>
                    <option>Lead</option>
                    <option>Manager</option>
                    <option>Director</option>
                  </select>
                </div>

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
                    className="rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white"
                  >
                    Create Designation
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
        {required && <span className="ml-1 text-red-500">*</span>}
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