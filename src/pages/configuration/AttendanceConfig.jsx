import React, { useState, useEffect } from "react";
import {
  Clock,
  ShieldCheck,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Save,
  RotateCcw,
} from "lucide-react";
import { hrmsService } from "../../services/hrmsService.js";
import { useToast } from "../../components/Toast.jsx";

export default function AttendanceConfig() {
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
      const data = await hrmsService.getConfig("attendance");
      setConfig(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load attendance configuration");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      setSaving(true);
      await hrmsService.saveConfig("attendance", config);
      toast.success("Attendance policies and shift rules saved successfully!");
    } catch (err) {
      toast.error("Failed to save attendance configuration");
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    if (!window.confirm("Reset attendance policy settings to defaults?")) return;
    try {
      const resetData = await hrmsService.resetConfig("attendance");
      setConfig(resetData);
      toast.info("Attendance configuration reset to defaults.");
    } catch (err) {
      toast.error("Failed to reset settings");
    }
  }

  if (loading || !config) {
    return (
      <div className="rounded-2xl bg-white p-12 text-center text-xs text-slate-500 border border-slate-100">
        Loading attendance configuration...
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl bg-white p-5 border border-[#00373A]/10 shadow-sm">
        <div>
          <h2 className="text-lg font-extrabold text-[#00373A]">Attendance Configuration</h2>
          <p className="text-xs text-slate-500">
            Define daily working hours, late arrival grace thresholds, overtime rates, and biometric validation rules
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

      {/* SECTION 1: WORKING HOURS & SHIFTS */}
      <div className="rounded-2xl bg-white p-6 border border-[#00373A]/10 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-[#00373A] flex items-center gap-2 border-b border-slate-100 pb-3">
          <Clock size={16} className="text-[#00DC46]" />
          Standard Shift Hours & Work Schedule
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-bold text-[#00373A] mb-1">Standard Shift Start</label>
            <input
              type="time"
              value={config.workShiftStart}
              onChange={(e) => setConfig({ ...config, workShiftStart: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-[#00373A] focus:outline-none focus:border-[#00373A]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#00373A] mb-1">Standard Shift End</label>
            <input
              type="time"
              value={config.workShiftEnd}
              onChange={(e) => setConfig({ ...config, workShiftEnd: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-[#00373A] focus:outline-none focus:border-[#00373A]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#00373A] mb-1">Daily Work Hours</label>
            <input
              type="number"
              min="4"
              max="14"
              value={config.dailyWorkHours}
              onChange={(e) => setConfig({ ...config, dailyWorkHours: Number(e.target.value) })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-[#00373A] focus:outline-none focus:border-[#00373A]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#00373A] mb-1">Break Duration (Minutes)</label>
            <input
              type="number"
              min="0"
              max="180"
              value={config.breakDurationMinutes}
              onChange={(e) => setConfig({ ...config, breakDurationMinutes: Number(e.target.value) })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-[#00373A] focus:outline-none focus:border-[#00373A]"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: CHECK-IN & SECURITY CONTROLS */}
      <div className="rounded-2xl bg-white p-6 border border-[#00373A]/10 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-[#00373A] flex items-center gap-2 border-b border-slate-100 pb-3">
          <ShieldCheck size={16} className="text-[#00DC46]" />
          Punch Verification & Geofence Rules
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50">
            <div>
              <p className="font-bold text-[#00373A]">Web Check-In</p>
              <p className="text-[11px] text-slate-500">Allow portal browser punch</p>
            </div>
            <input
              type="checkbox"
              checked={config.webCheckIn}
              onChange={(e) => setConfig({ ...config, webCheckIn: e.target.checked })}
              className="h-5 w-5 rounded border-slate-300 text-[#00373A] focus:ring-[#00373A]"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50">
            <div>
              <p className="font-bold text-[#00373A]">Geo-Fencing Radius</p>
              <p className="text-[11px] text-slate-500">Enforce mobile GPS radius</p>
            </div>
            <input
              type="checkbox"
              checked={config.geoFencing}
              onChange={(e) => setConfig({ ...config, geoFencing: e.target.checked })}
              className="h-5 w-5 rounded border-slate-300 text-[#00373A] focus:ring-[#00373A]"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50">
            <div>
              <p className="font-bold text-[#00373A]">IP Restrictions</p>
              <p className="text-[11px] text-slate-500">Require corporate VPN or WiFi</p>
            </div>
            <input
              type="checkbox"
              checked={config.ipRestriction}
              onChange={(e) => setConfig({ ...config, ipRestriction: e.target.checked })}
              className="h-5 w-5 rounded border-slate-300 text-[#00373A] focus:ring-[#00373A]"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: LATE ARRIVAL & GRACE PERIOD RULES */}
      <div className="rounded-2xl bg-white p-6 border border-[#00373A]/10 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-[#00373A] flex items-center gap-2 border-b border-slate-100 pb-3">
          <AlertTriangle size={16} className="text-amber-500" />
          Late Arrival & Early Departure Rules
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-[#00373A] mb-1">
              Late Arrival Grace Period (Minutes)
            </label>
            <input
              type="number"
              min="0"
              max="60"
              value={config.gracePeriodMinutes}
              onChange={(e) => setConfig({ ...config, gracePeriodMinutes: Number(e.target.value) })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-[#00373A] focus:outline-none"
            />
            <p className="mt-1 text-[10px] text-slate-400">Punches after 09:45 AM will register as Late Mark</p>
          </div>

          <div>
            <label className="block font-bold text-[#00373A] mb-1">
              Late Marks Before Half-Day Penalty
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={config.lateThresholdDeductions}
              onChange={(e) =>
                setConfig({ ...config, lateThresholdDeductions: Number(e.target.value) })
              }
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-[#00373A] focus:outline-none"
            />
            <p className="mt-1 text-[10px] text-slate-400">3 Late marks = 0.5 Day leave deduction</p>
          </div>

          <div>
            <label className="block font-bold text-[#00373A] mb-1">
              Early Departure Threshold (Minutes)
            </label>
            <input
              type="number"
              min="0"
              max="120"
              value={config.earlyDepartureThresholdMinutes}
              onChange={(e) =>
                setConfig({ ...config, earlyDepartureThresholdMinutes: Number(e.target.value) })
              }
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-[#00373A] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: OVERTIME POLICY */}
      <div className="rounded-2xl bg-white p-6 border border-[#00373A]/10 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-[#00373A] flex items-center gap-2 border-b border-slate-100 pb-3">
          <Flame size={16} className="text-[#FF6A3D]" />
          Overtime (OT) Settings & Approval Rules
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50">
            <div>
              <p className="font-bold text-[#00373A]">Enable Overtime (OT)</p>
              <p className="text-[11px] text-slate-500">Calculate extra work hours</p>
            </div>
            <input
              type="checkbox"
              checked={config.overtimeEnabled}
              onChange={(e) => setConfig({ ...config, overtimeEnabled: e.target.checked })}
              className="h-5 w-5 rounded border-slate-300 text-[#00373A] focus:ring-[#00373A]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#00373A] mb-1">
              Minimum OT Duration (Minutes)
            </label>
            <input
              type="number"
              min="15"
              max="180"
              value={config.overtimeMinimumMinutes}
              onChange={(e) =>
                setConfig({ ...config, overtimeMinimumMinutes: Number(e.target.value) })
              }
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-[#00373A] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-[#00373A] mb-1">OT Wage Multiplier</label>
            <select
              value={config.overtimeMultiplier}
              onChange={(e) => setConfig({ ...config, overtimeMultiplier: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-[#00373A] focus:outline-none"
            >
              <option value="1.0x">1.0x (Standard hourly rate)</option>
              <option value="1.5x">1.5x (Time and a half)</option>
              <option value="2.0x">2.0x (Double time)</option>
            </select>
          </div>
        </div>
      </div>
    </form>
  );
}
