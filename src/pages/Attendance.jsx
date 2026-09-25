import React, { useEffect, useState } from "react";
import { Coffee, LogIn, LogOut, PlayCircle, PauseCircle, Search, CalendarDays, UserCheck, Palmtree, AlertTriangle, Clock, Users } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import StatCard from "../components/common/StatCard.jsx";
import StatusBadge from "../components/common/StatusBadge.jsx";
import Dropdown from "../components/common/Dropdown.jsx";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { fmtTime, fmtDuration, fmtDate, currentMonth } from "../utils/format.js";

export default function Attendance() {
  const { isReviewer } = useAuth();
  const [tab, setTab] = useState("mine");

  const [today, setToday] = useState(null);
  const [history, setHistory] = useState(null);
  const [month, setMonth] = useState(currentMonth());
  const [myRequests, setMyRequests] = useState([]);
  const [pending, setPending] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ work_date: "", issue_type: "missed_check_in", time: "", reason: "" });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [team, setTeam] = useState(null);
  const [teamMonth, setTeamMonth] = useState(currentMonth());
  const [teamError, setTeamError] = useState("");

  async function loadAll() {
    setError("");
    try {
      const [t, h, mine] = await Promise.all([
        api.get("/attendance/today"),
        api.get(`/attendance/history?month=${month}`),
        api.get("/attendance/requests/mine"),
      ]);
      setToday(t.data.attendance);
      setHistory(h.data);
      setMyRequests(mine.data.requests);
      if (isReviewer) {
        const p = await api.get("/attendance/requests/pending");
        setPending(p.data.requests);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadTeam() {
    setTeamError("");
    try {
      const r = await api.get(`/attendance/team?month=${teamMonth}`);
      setTeam(r.data);
    } catch (err) {
      setTeamError(err.message);
    }
  }

  useEffect(() => { loadAll(); }, [month, isReviewer]);
  useEffect(() => { if (tab === "team" && isReviewer) loadTeam(); }, [tab, teamMonth, isReviewer]);

  async function action(fn) {
    setBusy(true);
    setError("");
    try { await fn(); await loadAll(); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function submitRequest(e) {
    e.preventDefault();
    action(() => api.post("/attendance/requests", form).then(() => setForm({ work_date: "", issue_type: "missed_check_in", time: "", reason: "" })));
  }

  async function review(id, decision) {
    let note = "";
    if (decision === "reject") {
      note = window.prompt("Reason for rejecting this request:") || "";
      if (note.trim().length < 3) return alert("Please give a reason (at least 3 characters).");
    }
    action(() => api.post(`/attendance/requests/${id}/${decision}`, { note }));
  }

  if (!today && !history) return <p className="text-sm text-primary/60">Loading attendance…</p>;

  const avgHours = history && history.summary.present_days > 0
    ? history.summary.total_work_seconds / history.summary.present_days
    : 0;

  const filteredRecords = history
    ? history.records.filter((r) => {
        const matchesSearch = fmtDate(r.work_date).toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "All" || r.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
    : [];

  const teamChartData = team
    ? team.daily.map((d) => ({
        day: new Date(d.work_date + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
        Present: d.present,
        WFH: d.wfh,
        Leave: d.leave,
      }))
    : [];

  return (
    <div className="space-y-6">
      {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-xs text-red-600">{error}</div>}

      {isReviewer && (
        <div className="flex gap-1 border-b border-primary/10">
          <button onClick={() => setTab("mine")} className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 -mb-px ${tab === "mine" ? "border-primary text-primary" : "border-transparent text-primary/50 hover:text-primary/70"}`}>
            <Clock size={14} /> My Attendance
          </button>
          <button onClick={() => setTab("team")} className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 -mb-px ${tab === "team" ? "border-primary text-primary" : "border-transparent text-primary/50 hover:text-primary/70"}`}>
            <Users size={14} /> Team Attendance
          </button>
        </div>
      )}

      {tab === "mine" && (
        <>
          {/* Today card */}
          <div className="rounded-2xl bg-white p-5 border border-primary/10 shadow-sm">
            <h2 className="text-sm font-extrabold text-primary mb-3">Today</h2>
            {today ? (
              <div className="flex flex-wrap items-center gap-4 text-xs text-primary/70">
                <span>Check-in: <b className="text-primary">{fmtTime(today.check_in)}</b></span>
                <span>Check-out: <b className="text-primary">{fmtTime(today.check_out)}</b></span>
                <span>Worked: <b className="text-primary">{fmtDuration(today.work_seconds)}</b></span>
                <span>Break: <b className="text-primary">{fmtDuration(today.break_seconds)}</b></span>
                <StatusBadge status={today.status} />
              </div>
            ) : (
              <p className="text-xs text-primary/60">Not checked in yet.</p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {!today && (
                <button disabled={busy} onClick={() => action(() => api.post("/attendance/check-in"))} className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-bold text-primary disabled:opacity-60">
                  <LogIn size={14} /> Check In
                </button>
              )}
              {today && !today.check_out && !today.on_break && (
                <button disabled={busy} onClick={() => action(() => api.post("/attendance/break/start"))} className="flex items-center gap-1.5 rounded-lg bg-purple/10 px-3 py-2 text-xs font-bold text-purple disabled:opacity-60">
                  <PauseCircle size={14} /> Start Break
                </button>
              )}
              {today && today.on_break && (
                <button disabled={busy} onClick={() => action(() => api.post("/attendance/break/end"))} className="flex items-center gap-1.5 rounded-lg bg-purple px-3 py-2 text-xs font-bold text-white disabled:opacity-60">
                  <PlayCircle size={14} /> End Break
                </button>
              )}
              {today && !today.check_out && (
                <button disabled={busy} onClick={() => action(() => api.post("/attendance/check-out"))} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white disabled:opacity-60">
                  <LogOut size={14} /> Check Out
                </button>
              )}
            </div>
          </div>

          {/* My Attendance — stat cards + table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-primary/50">ATTENDANCE</p>
                <h1 className="text-xl font-extrabold text-primary">My Attendance</h1>
              </div>
              <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="rounded-lg border border-primary/20 px-2 py-1.5 text-xs" />
            </div>

            {history && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <StatCard title="Present" value={history.summary.present_days} icon={UserCheck} accentColor="#00DC46" />
                <StatCard title="WFH" value={history.summary.wfh_days} icon={CalendarDays} accentColor="#7C3AED" />
                <StatCard title="On Leave" value={history.summary.leave_days} icon={Palmtree} accentColor="#FF6A3D" />
                <StatCard title="Missed Checkouts" value={history.summary.missed_checkouts} icon={AlertTriangle} accentColor="#FF6A3D" />
                <StatCard title="Avg. Hours / Day" value={fmtDuration(avgHours)} icon={Clock} accentColor="#00373A" />
              </div>
            )}

            <div className="rounded-2xl bg-white border border-primary/10 shadow-sm overflow-hidden">
              <div className="flex flex-col sm:flex-row gap-2 p-4 border-b border-primary/10">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by date…" className="w-full rounded-lg border border-primary/15 pl-8 pr-3 py-2 text-xs" />
                </div>
                <Dropdown
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: "All", label: "All Status" },
                    { value: "present", label: "Present" },
                    { value: "wfh", label: "Work From Home" },
                    { value: "leave", label: "On Leave" },
                    { value: "absent", label: "Absent" },
                  ]}
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-primary/50 border-b border-primary/10 bg-primary/5">
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4">Check-in</th>
                      <th className="py-2.5 px-4">Check-out</th>
                      <th className="py-2.5 px-4">Hours</th>
                      <th className="py-2.5 px-4">Break</th>
                      <th className="py-2.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((r) => (
                      <tr key={r.id} className="border-b border-primary/5">
                        <td className="py-2.5 px-4 font-semibold text-primary">{fmtDate(r.work_date)}</td>
                        <td className="py-2.5 px-4 text-primary/70">{fmtTime(r.check_in)}</td>
                        <td className="py-2.5 px-4 text-primary/70">{fmtTime(r.check_out)}</td>
                        <td className="py-2.5 px-4 text-primary/70">{fmtDuration(r.work_seconds)}</td>
                        <td className="py-2.5 px-4 text-primary/70">{fmtDuration(r.break_seconds)}</td>
                        <td className="py-2.5 px-4">
                          <StatusBadge status={r.status} size="sm" />
                          {r.missed_checkout && <span className="ml-1 text-warning text-[10px] font-bold">missed checkout</span>}
                        </td>
                      </tr>
                    ))}
                    {filteredRecords.length === 0 && (
                      <tr><td colSpan={6} className="py-6 text-center text-primary/40">No records found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Regularization request */}
          <div className="rounded-2xl bg-white p-5 border border-primary/10 shadow-sm">
            <h2 className="text-sm font-extrabold text-primary mb-3">Request Correction</h2>
            <form onSubmit={submitRequest} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <input type="date" required value={form.work_date} onChange={(e) => setForm({ ...form, work_date: e.target.value })} className="rounded-lg border border-primary/20 px-2 py-1.5" />
              <select value={form.issue_type} onChange={(e) => setForm({ ...form, issue_type: e.target.value })} className="rounded-lg border border-primary/20 px-2 py-1.5">
                <option value="missed_check_in">Missed Check-in</option>
                <option value="missed_check_out">Missed Check-out</option>
              </select>
              <input type="time" required value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="rounded-lg border border-primary/20 px-2 py-1.5" />
              <input type="text" required placeholder="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="rounded-lg border border-primary/20 px-2 py-1.5" />
              <button disabled={busy} type="submit" className="sm:col-span-2 rounded-lg bg-primary py-2 text-xs font-bold text-white disabled:opacity-60">Submit Request</button>
            </form>

            {myRequests.length > 0 && (
              <div className="mt-4 divide-y divide-primary/5">
                {myRequests.map((r) => (
                  <div key={r.id} className="flex items-center justify-between py-2 text-xs">
                    <div>
                      <p className="font-semibold text-primary">{fmtDate(r.work_date)} — {r.issue_type.replace(/_/g, " ")}</p>
                      <p className="text-primary/50">{r.reason}{r.reviewer_name ? ` · reviewed by ${r.reviewer_name}` : ""}</p>
                    </div>
                    <StatusBadge status={r.status} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Approvals */}
          {isReviewer && (
            <div className="rounded-2xl bg-white p-5 border border-primary/10 shadow-sm">
              <h2 className="text-sm font-extrabold text-primary mb-3">Pending Approvals</h2>
              {pending.length === 0 && <p className="text-xs text-primary/50">Nothing pending.</p>}
              <div className="divide-y divide-primary/5">
                {pending.map((r) => (
                  <div key={r.id} className="flex items-center justify-between py-2 text-xs gap-3">
                    <div>
                      <p className="font-semibold text-primary">{r.employee_name} · {fmtDate(r.work_date)} · {r.issue_type.replace(/_/g, " ")}</p>
                      <p className="text-primary/50">{r.reason}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button disabled={busy} onClick={() => review(r.id, "approve")} className="rounded-lg bg-accent px-3 py-1.5 font-bold text-primary">Approve</button>
                      <button disabled={busy} onClick={() => review(r.id, "reject")} className="rounded-lg bg-red-100 px-3 py-1.5 font-bold text-red-600">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {tab === "team" && isReviewer && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-primary/50">ATTENDANCE</p>
              <h1 className="text-xl font-extrabold text-primary">Team Attendance</h1>
            </div>
            <input type="month" value={teamMonth} onChange={(e) => setTeamMonth(e.target.value)} className="rounded-lg border border-primary/20 px-2 py-1.5 text-xs" />
          </div>

          {teamError && <p className="text-sm text-red-600">{teamError}</p>}
          {!team && !teamError && <p className="text-sm text-primary/60">Loading team attendance…</p>}

          {team && (
            <>
              <div className="rounded-2xl bg-white border border-primary/10 shadow-sm p-5">
                <h2 className="text-sm font-extrabold text-primary">Attendance Trend</h2>
                <p className="text-xs text-primary/50 mb-4">Team status by day, {teamMonth}</p>
                {teamChartData.length === 0 ? (
                  <p className="text-xs text-primary/40">No attendance recorded this month.</p>
                ) : (
                  <div style={{ width: "100%", height: 240 }}>
                    <ResponsiveContainer>
                      <LineChart data={teamChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#00373A1A" />
                        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#00373A99" }} />
                        <YAxis tick={{ fontSize: 11, fill: "#00373A99" }} allowDecimals={false} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Line type="monotone" dataKey="Present" stroke="#00DC46" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="WFH" stroke="#7C3AED" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="Leave" stroke="#FF6A3D" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="rounded-2xl bg-white border border-primary/10 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-primary/10">
                  <h2 className="text-sm font-extrabold text-primary">Monthly Summary by Member</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-primary/50 border-b border-primary/10 bg-primary/5">
                        <th className="py-2.5 px-4">Employee</th>
                        <th className="py-2.5 px-4">Present</th>
                        <th className="py-2.5 px-4">WFH</th>
                        <th className="py-2.5 px-4">Leave</th>
                        <th className="py-2.5 px-4">Missed Checkouts</th>
                        <th className="py-2.5 px-4">Total Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {team.members.map((m) => (
                        <tr key={m.id} className="border-b border-primary/5">
                          <td className="py-2.5 px-4">
                            <p className="font-bold text-primary">{m.full_name}</p>
                            <p className="text-[10px] text-primary/50">{m.employee_code} · {m.designation || "—"}</p>
                          </td>
                          <td className="py-2.5 px-4 text-primary/70">{m.present_days}</td>
                          <td className="py-2.5 px-4 text-primary/70">{m.wfh_days}</td>
                          <td className="py-2.5 px-4 text-primary/70">{m.leave_days}</td>
                          <td className="py-2.5 px-4 text-primary/70">{m.missed_checkouts}</td>
                          <td className="py-2.5 px-4 text-primary/70">{fmtDuration(m.total_work_seconds)}</td>
                        </tr>
                      ))}
                      {team.members.length === 0 && (
                        <tr><td colSpan={6} className="py-6 text-center text-primary/40">No team members found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}