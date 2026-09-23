import React, { useState, useEffect } from "react";
import {
  Building2,
  Globe,
  Clock,
  Coins,
  Calendar,
  Save,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { hrmsService } from "../../services/hrmsService.js";
import { useToast } from "../../components/Toast.jsx";

export default function GeneralConfig() {
  const toast = useToast();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    try {
      setLoading(true);
      const data = await hrmsService.getConfig("general");
      setConfig(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load general settings");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      setSaving(true);
      await hrmsService.saveConfig("general", config);
      toast.success("General company & regional configuration saved successfully!");
    } catch (err) {
      toast.error("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    if (!window.confirm("Reset general configuration to system defaults?")) return;
    try {
      const resetData = await hrmsService.resetConfig("general");
      setConfig(resetData);
      toast.info("General configuration reset to initial defaults.");
    } catch (err) {
      toast.error("Failed to reset settings");
    }
  }

  const toggleWorkingDay = (day) => {
    const days = config.workingDays || [];
    if (days.includes(day)) {
      setConfig({ ...config, workingDays: days.filter((d) => d !== day) });
    } else {
      setConfig({ ...config, workingDays: [...days, day] });
    }
  };

  if (loading || !config) {
    return (
      <div className="rounded-2xl bg-white p-12 text-center text-xs text-slate-500 border border-slate-100">
        Loading general configuration...
      </div>
    );
  }

  const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* HEADER BAR WITH ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl bg-white p-5 border border-[#00373A]/10 shadow-sm">
        <div>
          <h2 className="text-lg font-extrabold text-[#00373A]">General Configuration</h2>
          <p className="text-xs text-slate-500">
            Company branding, official contact channels, and localization parameters
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

      {/* SECTION 1: COMPANY INFORMATION */}
      <div className="rounded-2xl bg-white p-6 border border-[#00373A]/10 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-[#00373A] flex items-center gap-2 border-b border-slate-100 pb-3">
          <Building2 size={16} className="text-[#00DC46]" />
          Company Identity & Branding
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-[#00373A] mb-1">Company Legal Name</label>
            <input
              type="text"
              value={config.companyName}
              onChange={(e) => setConfig({ ...config, companyName: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-[#00373A] focus:outline-none focus:border-[#00373A]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#00373A] mb-1">Company Website URL</label>
            <input
              type="text"
              value={config.website}
              onChange={(e) => setConfig({ ...config, website: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-[#00373A] focus:outline-none focus:border-[#00373A]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#00373A] mb-1">Official People / HR Email</label>
            <input
              type="email"
              value={config.companyEmail}
              onChange={(e) => setConfig({ ...config, companyEmail: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-[#00373A] focus:outline-none focus:border-[#00373A]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#00373A] mb-1">Corporate Phone Number</label>
            <input
              type="text"
              value={config.companyPhone}
              onChange={(e) => setConfig({ ...config, companyPhone: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-[#00373A] focus:outline-none focus:border-[#00373A]"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: REGIONAL & LOCALIZATION */}
      <div className="rounded-2xl bg-white p-6 border border-[#00373A]/10 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-[#00373A] flex items-center gap-2 border-b border-slate-100 pb-3">
          <Globe size={16} className="text-[#00DC46]" />
          Regional & Localization Settings
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-bold text-[#00373A] mb-1">Time Zone</label>
            <select
              value={config.timeZone}
              onChange={(e) => setConfig({ ...config, timeZone: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-[#00373A] focus:outline-none"
            >
              <option value="Asia/Kolkata (IST +05:30)">Asia/Kolkata (IST +05:30)</option>
              <option value="America/New_York (EST -05:00)">America/New_York (EST -05:00)</option>
              <option value="America/Los_Angeles (PST -08:00)">America/Los_Angeles (PST -08:00)</option>
              <option value="Europe/London (GMT +00:00)">Europe/London (GMT +00:00)</option>
              <option value="Asia/Singapore (SGT +08:00)">Asia/Singapore (SGT +08:00)</option>
              <option value="Asia/Dubai (GST +04:00)">Asia/Dubai (GST +04:00)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#00373A] mb-1">Date Format</label>
            <select
              value={config.dateFormat}
              onChange={(e) => setConfig({ ...config, dateFormat: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-[#00373A] focus:outline-none"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY (21/09/2026)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (09/21/2026)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (2026-09-21)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#00373A] mb-1">Time Format</label>
            <select
              value={config.timeFormat}
              onChange={(e) => setConfig({ ...config, timeFormat: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-[#00373A] focus:outline-none"
            >
              <option value="12-hour">12-hour (02:30 PM)</option>
              <option value="24-hour">24-hour (14:30)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#00373A] mb-1">Reporting Currency</label>
            <select
              value={config.currency}
              onChange={(e) => setConfig({ ...config, currency: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-[#00373A] focus:outline-none"
            >
              <option value="INR (₹)">INR (₹)</option>
              <option value="USD ($)">USD ($)</option>
              <option value="EUR (€)">EUR (€)</option>
              <option value="GBP (£)">GBP (£)</option>
              <option value="SGD ($)">SGD ($)</option>
              <option value="AED (د.إ)">AED (د.إ)</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 3: WORK WEEK SETTINGS */}
      <div className="rounded-2xl bg-white p-6 border border-[#00373A]/10 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-[#00373A] flex items-center gap-2 border-b border-slate-100 pb-3">
          <Calendar size={16} className="text-[#00DC46]" />
          Work Week & Business Schedule
        </h3>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#00373A] mb-2">
              Official Working Days (Selected days are treated as billable time-off deductions)
            </label>
            <div className="flex flex-wrap gap-2">
              {allDays.map((day) => {
                const isSelected = (config.workingDays || []).includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleWorkingDay(day)}
                    className={`rounded-xl px-3.5 py-2 text-xs font-bold border transition ${
                      isSelected
                        ? "bg-[#00373A] text-white border-[#00373A] shadow-xs"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {isSelected ? "✓ " : ""}
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="max-w-xs">
            <label className="block font-bold text-[#00373A] mb-1">Week Start Day</label>
            <select
              value={config.weekStartDay}
              onChange={(e) => setConfig({ ...config, weekStartDay: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-[#00373A] focus:outline-none"
            >
              <option value="Monday">Monday (Standard)</option>
              <option value="Sunday">Sunday (Middle East)</option>
            </select>
          </div>
        </div>
      </div>
    </form>
  );
}
