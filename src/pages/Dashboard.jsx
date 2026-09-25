import React, { useEffect, useState } from "react";
import { Clock, Coffee, LogOut, User, ClipboardList, CalendarDays, Users, Palmtree, FileCheck2, UserX, Sparkles, Mail, Building2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import StatCard from "../components/common/StatCard.jsx";
import StatusBadge from "../components/common/StatusBadge.jsx";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { fmtTime, fmtDuration, fmtDate } from "../utils/format.js";

export default function Dashboard() {
  const { user, isReviewer } = useAuth();
  const [data, setData] = useState(null);
  const [trend, setTrend] = useState(null);
  const [pendingList, setPendingList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const calls = [api.get("/dashboard"), api.get("/attendance/history")];
      if (isReviewer) calls.push(api.get("/attendance/requests/pending"));

      const [dash, hist, pend] = await Promise.all(calls);
      setData(dash.data);
      setTrend(buildTrend(hist.data.records));
      if (isReviewer) setPendingList(pend.data.requests);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function buildTrend(records) {
    const last7 = records.slice(-7);
    return last7.map((r) => ({
      day: new Date(r.work_date + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      hours: Math.round((r.work_seconds / 3600) * 10) / 10,
    }));
  }

  useEffect(() => { load(); }, [isReviewer]);

  async function run(fn) {
    setBusy(true);
    setError("");
    try { await fn(); await load(); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  if (loading) return <p className="text-sm text-primary/60">Loading dashboard…</p>;
  if (error && !data) return <p className="text-sm text-red-600">{error}</p>;

  const { attendance, summary, my_requests, scope, today } = data;
  const todayLabel = new Date(today + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-xs text-red-600">{error}</div>}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">Good day, {user.name.split(" ")[0]} 👋</h1>
          <p className="mt-0.5 text-xs text-primary/60">{todayLabel} · {user.roleTitle || "—"} · {user.department || "—"}</p>
        </div>
        {!attendance?.check_out && (
          <div className="flex gap-2">
            {!attendance ? (
              <button disabled={busy} onClick={() => run(() => api.post("/attendance/check-in"))} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white disabled:opacity-60">
                <Clock size={15} /> Check In
              </button>
            ) : (
              <button disabled={busy} onClick={() => run(() => api.post("/attendance/check-out"))} className="flex items-center gap-2 rounded-xl bg-warning px-4 py-2.5 text-xs font-bold text-white disabled:opacity-60">
                <LogOut size={15} /> Check Out
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's attendance */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-primary/10 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-primary/10">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-primary" />
              <h2 className="text-sm font-extrabold text-primary">Today's Attendance</h2>
            </div>
            {attendance && (
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-accent/15 px-2.5 py-1 text-[10px] font-bold text-accent capitalize">{attendance.status}</span>
                <span className="text-xs text-primary/50">{fmtTime(attendance.check_in)}</span>
              </div>
            )}
          </div>

          {attendance ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-5 py-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-primary/40">Check-in</p>
                <p className="mt-1 text-lg font-extrabold text-primary">{fmtTime(attendance.check_in)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-primary/40">Working Hours</p>
                <p className="mt-1 text-lg font-extrabold text-primary">{fmtDuration(attendance.work_seconds)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-primary/40">Break</p>
                <p className="mt-1 text-lg font-extrabold text-primary">{fmtDuration(attendance.break_seconds)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-primary/40">Check-out</p>
                <p className="mt-1 text-lg font-extrabold text-primary">{fmtTime(attendance.check_out)}</p>
              </div>
            </div>
          ) : (
            <p className="px-5 py-4 text-xs text-primary/50">You haven't checked in today.</p>
          )}

          {attendance && !attendance.check_out && (
            <div className="flex gap-2 px-5 pb-4">
              {!attendance.on_break ? (
                <button disabled={busy} onClick={() => run(() => api.post("/attendance/break/start"))} className="flex items-center gap-1.5 rounded-lg bg-purple/10 px-3 py-1.5 text-xs font-bold text-purple">
                  <Coffee size={13} /> Start Break
                </button>
              ) : (
                <button disabled={busy} onClick={() => run(() => api.post("/attendance/break/end"))} className="flex items-center gap-1.5 rounded-lg bg-purple px-3 py-1.5 text-xs font-bold text-white">
                  <Coffee size={13} /> End Break
                </button>
              )}
            </div>
          )}
        </div>

        {/* My Profile card */}
        <div className="rounded-2xl bg-white border border-primary/10 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <img src={user.avatar} alt={user.name} className="h-12 w-12 rounded-full border border-accent/40" />
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-primary truncate">{user.name}</p>
              <p className="text-[11px] text-primary/50 capitalize">{user.role.replace(/_/g, " ")}</p>
            </div>
          </div>
          <div className="space-y-2 text-xs text-primary/70">
            <p className="flex items-center gap-2"><Mail size={13} className="text-primary/40" /> {user.email}</p>
            <p className="flex items-center gap-2"><Building2 size={13} className="text-primary/40" /> {user.department || "—"} · {user.roleTitle || "—"}</p>
          </div>
          <a href="/settings" className="mt-4 inline-block text-xs font-bold text-primary hover:underline">Edit Profile →</a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-primary/10 shadow-sm p-5">
          <h2 className="text-sm font-extrabold text-primary mb-1">Quick Actions</h2>
          <p className="text-xs text-primary/50 mb-4">Everything you need in one click</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Check In / Out", sub: "Mark attendance", icon: Clock, to: "/attendance" },
              { label: "View Attendance", sub: "History & requests", icon: CalendarDays, to: "/attendance" },
              { label: "My Team", sub: "Reports & status", icon: Users, to: "/team" },
              { label: "My Profile", sub: "Account settings", icon: User, to: "/settings" },
            ].map((a) => (
              <a key={a.label} href={a.to} className="rounded-xl border border-primary/10 bg-primary/5 px-3 py-3 hover:bg-primary/10 transition">
                <a.icon size={18} className="text-primary mb-2" />
                <p className="text-xs font-bold text-primary">{a.label}</p>
                <p className="text-[10px] text-primary/50">{a.sub}</p>
              </a>
            ))}
          </div>
        </div>

        {/* My requests */}
        <div className="rounded-2xl bg-white border border-primary/10 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList size={16} className="text-primary" />
            <h2 className="text-sm font-extrabold text-primary">Your Requests</h2>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-primary">{my_requests.pending}</p>
          <p className="text-xs text-primary/50 mt-1">pending regularization request(s)</p>
          <a href="/attendance" className="mt-4 inline-block text-xs font-bold text-primary hover:underline">View on Attendance page →</a>
        </div>
      </div>

      {/* Pending Approvals list (reviewers only) */}
      {isReviewer && (
        <div className="rounded-2xl bg-white border border-primary/10 shadow-sm p-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <FileCheck2 size={16} className="text-primary" />
              <h2 className="text-sm font-extrabold text-primary">Pending Approvals</h2>
            </div>
            {pendingList && pendingList.length > 0 && (
              <a href="/attendance" className="text-xs font-bold text-primary hover:underline">View all →</a>
            )}
          </div>
          <p className="text-xs text-primary/50 mb-3">Attendance regularization requests waiting on you</p>

          {pendingList && pendingList.length === 0 && (
            <p className="text-xs text-primary/40 py-2">Nothing pending right now.</p>
          )}
          {pendingList && pendingList.length > 0 && (
            <div className="divide-y divide-primary/5">
              {pendingList.slice(0, 4).map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2.5 text-xs">
                  <div>
                    <p className="font-semibold text-primary">{r.employee_name} · {fmtDate(r.work_date)}</p>
                    <p className="text-primary/50">{r.issue_type.replace(/_/g, " ")} — {r.reason}</p>
                  </div>
                  <StatusBadge status={r.status} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Attendance trend (real data) */}
      {trend && trend.length > 0 && (
        <div className="rounded-2xl bg-white border border-primary/10 shadow-sm p-5">
          <h2 className="text-sm font-extrabold text-primary">Your Attendance Trend</h2>
          <p className="text-xs text-primary/50 mb-4">Hours worked over your last {trend.length} recorded days</p>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#00373A1A" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#00373A99" }} />
                <YAxis tick={{ fontSize: 11, fill: "#00373A99" }} />
                <Tooltip />
                <Line type="monotone" dataKey="hours" stroke="#00373A" strokeWidth={2} dot={{ r: 3 }} name="Hours worked" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Team / org summary */}
      {summary && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title={scope === "team" ? "Team Size" : "Total Employees"} value={summary.total} icon={Users} accentColor="#00373A" />
          <StatCard title="Present Today" value={summary.present} subtitle={`${summary.wfh} working remotely`} icon={FileCheck2} accentColor="#00DC46" />
          <StatCard title="On Leave" value={summary.on_leave} icon={Palmtree} accentColor="#FF6A3D" />
          <StatCard title="Absent" value={summary.absent} icon={UserX} accentColor="#FF6A3D" />
          <StatCard title="Not Checked In" value={summary.not_checked_in} icon={Clock} accentColor="#00373A" />
          <StatCard title="Pending Approvals" value={summary.pending_approvals} icon={ClipboardList} accentColor="#7C3AED" />
          <StatCard title="WFH Today" value={summary.wfh} icon={Sparkles} accentColor="#7C3AED" />
          <StatCard title="New Joiners" value={summary.new_joiners} subtitle="Last 30 days" icon={CalendarDays} accentColor="#00DC46" />
        </div>
      )}
    </div>
  );
}