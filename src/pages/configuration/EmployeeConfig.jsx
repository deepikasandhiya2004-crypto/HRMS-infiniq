import React, { useState, useEffect } from "react";
import {
  Users,
  Briefcase,
  Building2,
  MapPin,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  ListFilter,
} from "lucide-react";
import { hrmsService } from "../../services/hrmsService.js";
import { useToast } from "../../components/Toast.jsx";

export default function EmployeeConfig() {
  const toast = useToast();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Quick Add inputs
  const [newDept, setNewDept] = useState("");
  const [newDesig, setNewDesig] = useState("");
  const [newLoc, setNewLoc] = useState("");

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    try {
      setLoading(true);
      const data = await hrmsService.getConfig("employee");
      setConfig(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load employee configuration");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      setSaving(true);
      await hrmsService.saveConfig("employee", config);
      toast.success("Employee lifecycle configuration saved successfully!");
    } catch (err) {
      toast.error("Failed to save employee configuration");
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    if (!window.confirm("Reset employee configuration to defaults?")) return;
    try {
      const resetData = await hrmsService.resetConfig("employee");
      setConfig(resetData);
      toast.info("Employee configuration reset to defaults.");
    } catch (err) {
      toast.error("Failed to reset settings");
    }
  }

  // List manipulators
  const addDepartment = () => {
    if (!newDept.trim()) return;
    if (config.departments.includes(newDept.trim())) return;
    setConfig({ ...config, departments: [...config.departments, newDept.trim()] });
    setNewDept("");
  };

  const removeDepartment = (dept) => {
    setConfig({ ...config, departments: config.departments.filter((d) => d !== dept) });
  };

  const addDesignation = () => {
    if (!newDesig.trim()) return;
    if (config.designations.includes(newDesig.trim())) return;
    setConfig({ ...config, designations: [...config.designations, newDesig.trim()] });
    setNewDesig("");
  };

  const removeDesignation = (title) => {
    setConfig({ ...config, designations: config.designations.filter((d) => d !== title) });
  };

  const addLocation = () => {
    if (!newLoc.trim()) return;
    if (config.locations.includes(newLoc.trim())) return;
    setConfig({ ...config, locations: [...config.locations, newLoc.trim()] });
    setNewLoc("");
  };

  const removeLocation = (loc) => {
    setConfig({ ...config, locations: config.locations.filter((l) => l !== loc) });
  };

  const toggleRequiredField = (index) => {
    const fields = [...config.requiredFields];
    fields[index].required = !fields[index].required;
    setConfig({ ...config, requiredFields: fields });
  };

  if (loading || !config) {
    return (
      <div className="rounded-2xl bg-white p-12 text-center text-xs text-slate-500 border border-slate-100">
        Loading employee configuration...
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl bg-white p-5 border border-[#00373A]/10 shadow-sm">
        <div>
          <h2 className="text-lg font-extrabold text-[#00373A]">Employee Configuration</h2>
          <p className="text-xs text-slate-500">
            Configure employee numbering schemes, corporate taxonomy, and mandatory dossier fields
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 rounded-xl bg-[#00373A] px-5 py-2 text-xs font-bold text-white hover:bg-[#00373A]/90 transition shadow-sm disabled:opacity-50"
          >
            <Save size={14} />
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: EMPLOYEE ID SCHEME */}
      <div className="rounded-2xl bg-white p-6 border border-[#00373A]/10 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-[#00373A] flex items-center gap-2 border-b border-slate-100 pb-3">
          <Briefcase size={16} className="text-[#00DC46]" />
          Employee Identification Format
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-[#00373A] mb-1">Prefix String</label>
            <input
              type="text"
              value={config.idPrefix}
              onChange={(e) => setConfig({ ...config, idPrefix: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-[#00373A] font-mono focus:outline-none focus:border-[#00373A]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#00373A] mb-1">Starting Sequence Number</label>
            <input
              type="number"
              value={config.startSequence}
              onChange={(e) => setConfig({ ...config, startSequence: Number(e.target.value) })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-[#00373A] font-mono focus:outline-none focus:border-[#00373A]"
            />
          </div>

          <div className="rounded-xl bg-[#00373A]/5 p-3 flex flex-col justify-center border border-[#00373A]/10">
            <span className="text-[10px] uppercase font-bold text-slate-400">Live Format Preview</span>
            <p className="text-base font-black text-[#00373A] font-mono mt-0.5">
              {config.idPrefix}{config.startSequence}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: DEPARTMENTS MANAGEMENT */}
      <div className="rounded-2xl bg-white p-6 border border-[#00373A]/10 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-[#00373A] flex items-center gap-2 border-b border-slate-100 pb-3">
          <Building2 size={16} className="text-[#00DC46]" />
          Department Taxonomy ({config.departments.length})
        </h3>

        <div className="flex gap-2">
          <input
            type="text"
            value={newDept}
            onChange={(e) => setNewDept(e.target.value)}
            placeholder="Add new department name..."
            className="flex-1 rounded-xl border border-slate-200 p-2 text-xs text-[#00373A] focus:outline-none focus:border-[#00373A]"
          />
          <button
            type="button"
            onClick={addDepartment}
            className="rounded-xl bg-[#00373A] px-4 py-2 text-xs font-bold text-white hover:bg-[#00373A]/90 transition"
          >
            Add Department
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {config.departments.map((d) => (
            <span
              key={d}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-800 border border-slate-200"
            >
              <span>{d}</span>
              <button
                type="button"
                onClick={() => removeDepartment(d)}
                className="text-slate-400 hover:text-rose-600 transition"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* SECTION 3: DESIGNATIONS & TITLES */}
      <div className="rounded-2xl bg-white p-6 border border-[#00373A]/10 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-[#00373A] flex items-center gap-2 border-b border-slate-100 pb-3">
          <Users size={16} className="text-[#00DC46]" />
          Designations & Job Titles ({config.designations.length})
        </h3>

        <div className="flex gap-2">
          <input
            type="text"
            value={newDesig}
            onChange={(e) => setNewDesig(e.target.value)}
            placeholder="Add official designation title..."
            className="flex-1 rounded-xl border border-slate-200 p-2 text-xs text-[#00373A] focus:outline-none focus:border-[#00373A]"
          />
          <button
            type="button"
            onClick={addDesignation}
            className="rounded-xl bg-[#00373A] px-4 py-2 text-xs font-bold text-white hover:bg-[#00373A]/90 transition"
          >
            Add Designation
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {config.designations.map((title) => (
            <span
              key={title}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-800 border border-slate-200"
            >
              <span>{title}</span>
              <button
                type="button"
                onClick={() => removeDesignation(title)}
                className="text-slate-400 hover:text-rose-600 transition"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* SECTION 4: OFFICE LOCATIONS */}
      <div className="rounded-2xl bg-white p-6 border border-[#00373A]/10 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-[#00373A] flex items-center gap-2 border-b border-slate-100 pb-3">
          <MapPin size={16} className="text-[#00DC46]" />
          Office Hubs & Locations ({config.locations.length})
        </h3>

        <div className="flex gap-2">
          <input
            type="text"
            value={newLoc}
            onChange={(e) => setNewLoc(e.target.value)}
            placeholder="Add new location / facility hub..."
            className="flex-1 rounded-xl border border-slate-200 p-2 text-xs text-[#00373A] focus:outline-none focus:border-[#00373A]"
          />
          <button
            type="button"
            onClick={addLocation}
            className="rounded-xl bg-[#00373A] px-4 py-2 text-xs font-bold text-white hover:bg-[#00373A]/90 transition"
          >
            Add Location
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {config.locations.map((loc) => (
            <span
              key={loc}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-800 border border-slate-200"
            >
              <span>{loc}</span>
              <button
                type="button"
                onClick={() => removeLocation(loc)}
                className="text-slate-400 hover:text-rose-600 transition"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* SECTION 5: MANDATORY FIELDS CHECKLIST */}
      <div className="rounded-2xl bg-white p-6 border border-[#00373A]/10 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-[#00373A] flex items-center gap-2 border-b border-slate-100 pb-3">
          <ListFilter size={16} className="text-[#00DC46]" />
          Mandatory Employee Profile Fields
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {config.requiredFields.map((field, idx) => (
            <label
              key={idx}
              className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                field.required
                  ? "bg-[#00373A]/5 border-[#00373A]/30 text-[#00373A] font-bold"
                  : "bg-slate-50 border-slate-200 text-slate-500 font-medium"
              }`}
            >
              <input
                type="checkbox"
                checked={field.required}
                onChange={() => toggleRequiredField(idx)}
                className="h-4 w-4 rounded border-slate-300 text-[#00373A] focus:ring-[#00373A]"
              />
              <span>{field.field}</span>
            </label>
          ))}
        </div>
      </div>
    </form>
  );
}
