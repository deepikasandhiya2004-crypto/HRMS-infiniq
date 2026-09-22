import React, { useEffect, useState } from "react";
import { Users, Palmtree, Clock, UserCheck, UserX, Sparkles, FileCheck2 } from "lucide-react";
import StatCard from "../components/common/StatCard.jsx";
import StatusBadge from "../components/common/StatusBadge.jsx";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { fmtTime, fmtDuration } from "../utils/format.js";

export default function Dashboard() {
  const { user, role } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      setData((await api.get("/dashboard")).data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [role]);

  async function doCheckIn() {
    setBusy(true);
    try { await api.post("/attendance/check-in"); await load(); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function doCheckOut() {
    setBusy(true);
    try { await api.post("/attendance/check-out"); await load(); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  if (loading) return <p className="text-sm text-primary/60">Loading dashboard…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  const { attendance, summary, my_requests, scope } = data;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-primary p-6 lg:p-8 text-cream shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-accent">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              INFINIQ HRMS Workplace Active
            </div>
            <h1 className="mt-3 text-2xl lg:text-3xl font-extrabold text-white">Welcome back, {user.name} 👋</h1>
            <p className="mt-1 text-sm text-cream/70">
              Today's attendance and pending items for your account.
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-4 min-w-[220px]">
            {attendance ? (
              <>
                <p className="text-[11px] text-cream/70">Check-in: {fmtTime(attendance.check_in)}</p>
                <p className="text-lg font-bold text-accent">{fmtDuration(attendance.work_seconds)} worked</p>
                {attendance.check_out ? (
                  <p className="mt-1 text-[11px] text-cream/60">Checked out {fmtTime(attendance.check_out)}</p>
                ) : (
                  <button
                    disabled={busy}
                    onClick={doCheckOut}
                    className="mt-2 w-full rounded-lg bg-accent py-1.5 text-xs font-bold text-primary disabled:opacity-60"
                  >
                    Check Out
                  </button>
                )}
              </>
            ) : (
              <>
                <p className="text-xs text-cream/70 mb-2">You haven't checked in today.</p>
                <button
                  disabled={busy}
                  onClick={doCheckIn}
                  className="w-full rounded-lg bg-accent py-1.5 text-xs font-bold text-primary disabled:opacity-60"
                >
                  Check In
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Employees" value={summary.total} icon={Users} accentColor="#00DC46" />
          <StatCard title="Present" value={summary.present} subtitle={scope === "team" ? "Your team" : "Organization"} icon={UserCheck} accentColor="#00373A" />
          <StatCard title="On Leave" value={summary.on_leave} icon={Palmtree} accentColor="#FF6A3D" />
          <StatCard title="Pending Approvals" value={summary.pending_approvals} icon={Clock} accentColor="#7C3AED" />
          <StatCard title="WFH" value={summary.wfh} icon={Sparkles} accentColor="#7C3AED" />
          <StatCard title="Not Checked In" value={summary.not_checked_in} icon={UserX} accentColor="#FF6A3D" />
          <StatCard title="New Joiners" value={summary.new_joiners} subtitle="Last 30 days" icon={Users} accentColor="#00DC46" />
        </div>
      )}

      <div className="rounded-2xl bg-white p-5 border border-primary/10 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <FileCheck2 size={16} className="text-primary" />
          <h2 className="text-sm font-extrabold text-primary">Your Requests</h2>
        </div>
        <p className="text-xs text-primary/60">
          You have <StatusBadge status="pending" size="sm" /> <span className="font-bold ml-1">{my_requests.pending}</span> pending regularization request(s). See Attendance page for details.
        </p>
      </div>
    </div>
  );
}