import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api/organization/locations";

export default function Locations() {
  const [locations, setLocations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    code: "",
    address: "",
    city: "",
    state: "",
    country: "India",
  });

  // ==================== LOAD LOCATIONS ====================

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Could not load locations");
      }

      const data = await response.json();

      setLocations(data.locations || []);
    } catch (error) {
      console.error("LOAD LOCATIONS ERROR:", error);
      setError("Could not load locations");
    } finally {
      setLoading(false);
    }
  };

  // ==================== FORM ====================

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ==================== CREATE LOCATION ====================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.code.trim() || !form.city.trim()) {
      return;
    }

    try {
      setError("");

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not create location");
      }

      setLocations((prev) => [...prev, data.location]);

      setForm({
        name: "",
        code: "",
        address: "",
        city: "",
        state: "",
        country: "India",
      });

      setShowForm(false);
    } catch (error) {
      console.error("CREATE LOCATION ERROR:", error);
      setError(error.message);
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
              Locations
            </h1>

            <p className="mt-1 text-sm text-primary/60">
              Manage office locations and workplace addresses.
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white transition hover:opacity-90"
          >
            + Add Location
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Locations"
            value={locations.length}
          />

          <StatCard
            label="Active"
            value={
              locations.filter(
                (location) => location.status === "active"
              ).length
            }
          />

          <StatCard
            label="Countries"
            value={
              new Set(
                locations.map((location) => location.country)
              ).size
            }
          />
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm">
          <div className="border-b border-primary/10 px-6 py-4">
            <h2 className="text-sm font-bold text-primary">
              All Locations
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-primary/10 bg-[#fafaf7]">
                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-primary/50">
                    Location
                  </th>

                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-primary/50">
                    Code
                  </th>

                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-primary/50">
                    City
                  </th>

                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-primary/50">
                    State
                  </th>

                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-primary/50">
                    Country
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
                      colSpan="6"
                      className="px-6 py-10 text-center text-sm text-primary/50"
                    >
                      Loading locations...
                    </td>
                  </tr>
                ) : locations.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-10 text-center text-sm text-primary/50"
                    >
                      No locations found.
                    </td>
                  </tr>
                ) : (
                  locations.map((location) => (
                    <tr
                      key={location.id}
                      className="border-b border-primary/5 last:border-0 hover:bg-primary/[0.02]"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-primary">
                          {location.name}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-lg bg-primary/5 px-2.5 py-1 text-xs font-bold text-primary">
                          {location.code}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-primary/60">
                        {location.city}
                      </td>

                      <td className="px-6 py-4 text-sm text-primary/60">
                        {location.state || "—"}
                      </td>

                      <td className="px-6 py-4 text-sm text-primary/60">
                        {location.country}
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-600">
                          {location.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Location Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-primary">
                    Add Location
                  </h2>

                  <p className="mt-1 text-xs text-primary/50">
                    Add a new workplace location.
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
                  label="Location Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Chennai Office"
                  required
                />

                <Field
                  label="Location Code"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="e.g. CHE"
                  required
                />

                <Field
                  label="Address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="e.g. TIDEL Park"
                />

                <Field
                  label="City"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="e.g. Chennai"
                  required
                />

                <Field
                  label="State"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="e.g. Tamil Nadu"
                />

                <Field
                  label="Country"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  placeholder="e.g. India"
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
                    className="rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white"
                  >
                    Create Location
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
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-primary/10 bg-[#fafaf7] px-3.5 py-2.5 text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
    </div>
  );
}