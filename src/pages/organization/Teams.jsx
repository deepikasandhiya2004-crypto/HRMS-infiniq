
import React, { useEffect, useState } from "react";

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    code: "",
    department_id: "",
    manager_id: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [teamsRes, deptRes, empRes] = await Promise.all([
        fetch("http://localhost:5000/api/organization/teams"),
        fetch("http://localhost:5000/api/organization/departments"),
        fetch("http://localhost:5000/api/employees"),
      ]);

      const teamsData = await teamsRes.json();
      const deptData = await deptRes.json();
      const empData = await empRes.json();

      setTeams(teamsData.teams || []);
      setDepartments(deptData.departments || []);
      setEmployees(empData.employees || []);
    } catch (error) {
      console.error("LOAD TEAM DATA ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.code.trim()) {
      alert("Team name and code are required");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/organization/teams",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name.trim(),
            code: form.code.trim().toUpperCase(),
            description: null,
            department_id: form.department_id
              ? Number(form.department_id)
              : null,
            manager_id: form.manager_id
              ? Number(form.manager_id)
              : null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create team");
      }

      await loadData();

      setForm({
        name: "",
        code: "",
        department_id: "",
        manager_id: "",
      });

      setShowForm(false);
    } catch (error) {
      console.error("CREATE TEAM ERROR:", error);
      alert(error.message);
    }
  };

  return (
    <div className="min-h-full bg-[#f7f7f2] p-6">
      <div className="mx-auto max-w-6xl">

        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary/40">
              Organization
            </p>

            <h1 className="mt-1 text-2xl font-black text-primary">
              Teams
            </h1>

            <p className="mt-1 text-sm text-primary/60">
              Manage teams, team leads and department assignments.
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white"
          >
            + Add Team
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Total Teams" value={teams.length} />

          <StatCard
            label="Active Teams"
            value={teams.filter((team) => team.status === "active").length}
          />

          <StatCard
            label="Total Members"
            value={teams.reduce(
              (total, team) => total + Number(team.members || 0),
              0
            )}
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm">
          <div className="border-b border-primary/10 px-6 py-4">
            <h2 className="text-sm font-bold text-primary">
              All Teams
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-primary/10 bg-[#fafaf7]">
                  <th className="px-6 py-3 text-[11px] font-bold uppercase text-primary/50">
                    Team
                  </th>

                  <th className="px-6 py-3 text-[11px] font-bold uppercase text-primary/50">
                    Code
                  </th>

                  <th className="px-6 py-3 text-[11px] font-bold uppercase text-primary/50">
                    Department
                  </th>

                  <th className="px-6 py-3 text-[11px] font-bold uppercase text-primary/50">
                    Team Lead
                  </th>

                  <th className="px-6 py-3 text-[11px] font-bold uppercase text-primary/50">
                    Members
                  </th>

                  <th className="px-6 py-3 text-[11px] font-bold uppercase text-primary/50">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : (
                  teams.map((team) => (
                    <tr
                      key={team.id}
                      className="border-b border-primary/5"
                    >
                      <td className="px-6 py-4 text-sm font-bold text-primary">
                        {team.name}
                      </td>

                      <td className="px-6 py-4 text-sm">
                        {team.code}
                      </td>

                      <td className="px-6 py-4 text-sm text-primary/60">
                        {team.department_name || "—"}
                      </td>

                      <td className="px-6 py-4 text-sm text-primary/60">
                        {team.manager_name || "—"}
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold">
                        {team.members || 0}
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-600">
                          {team.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-primary">
                    Add Team
                  </h2>

                  <p className="mt-1 text-xs text-primary/50">
                    Create a new organizational team.
                  </p>
                </div>

                <button
                  onClick={() => setShowForm(false)}
                  className="text-xl text-primary/40"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">

                <Field
                  label="Team Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Backend Team"
                  required
                />

                <Field
                  label="Team Code"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="e.g. BE"
                  required
                />

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-primary/70">
                    Department
                  </label>

                  <select
                    name="department_id"
                    value={form.department_id}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-primary/10 bg-[#fafaf7] px-3.5 py-2.5 text-sm"
                  >
                    <option value="">Select Department</option>

                    {departments.map((department) => (
                      <option
                        key={department.id}
                        value={department.id}
                      >
                        {department.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-primary/70">
                    Team Lead
                  </label>

                  <select
                    name="manager_id"
                    value={form.manager_id}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-primary/10 bg-[#fafaf7] px-3.5 py-2.5 text-sm"
                  >
                    <option value="">Select Team Lead</option>

                    {employees.map((employee) => (
                      <option
                        key={employee.id}
                        value={employee.id}
                      >
                        {employee.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-xl border border-primary/10 px-4 py-2.5 text-xs font-bold"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white"
                  >
                    Create Team
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
      <p className="text-[11px] font-bold uppercase text-primary/40">
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
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-primary/10 bg-[#fafaf7] px-3.5 py-2.5 text-sm"
      />
    </div>
  );
}

