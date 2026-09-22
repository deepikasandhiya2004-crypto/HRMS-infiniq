import React, { useEffect, useState } from "react";
import { Coffee, LogIn, LogOut, PlayCircle, PauseCircle } from "lucide-react";
import StatusBadge from "../components/common/StatusBadge.jsx";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { fmtTime, fmtDuration, fmtDate, currentMonth } from "../utils/format.js";

export default function Attendance() {
  const { isReviewer } = useAuth();
  const [today, setToday] = useState(null);
  const [history, setHistory] = useState(null);
  const [month, setMonth] = useState(currentMonth());
  const [myRequests, setMyRequests] = useState([]);
  const [pending, setPending] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ work_date: "", issue_type: "missed_check_in", time: "", reason: "" });

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

  useEffect(() => { loadAll(); }, [month, isReviewer]);

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

  return (
    <div className="space-y-6">
      {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-xs text-red-600">{error}</div>}

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

      {/* History */}
      <div className="rounded-2xl bg-white p-5 border border-primary/10 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-extrabold text-primary">History</h2>
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="rounded-lg border border-primary/20 px-2 py-1 text-xs" />
        </div>
        {history && (
          <>
            <div className="mb-3 flex flex-wrap gap-3 text-[11px] text-primary/60">
              <span>Present: <b>{history.summary.present_days}</b></span>
              <span>WFH: <b>{history.summary.wfh_days}</b></span>
              <span>Leave: <b>{history.summary.leave_days}</b></span>
              <span>Missed checkouts: <b>{history.summary.missed_checkouts}</b></span>
              <span>Total: <b>{fmtDuration(history.summary.total_work_seconds)}</b></span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-primary/50 border-b border-primary/10">
                    <th className="py-1.5 pr-3">Date</th><th className="py-1.5 pr-3">In</th><th className="py-1.5 pr-3">Out</th>
                    <th className="py-1.5 pr-3">Hours</th><th className="py-1.5 pr-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.records.map((r) => (
                    <tr key={r.id} className="border-b border-primary/5">
                      <td className="py-1.5 pr-3">{fmtDate(r.work_date)}</td>
                      <td className="py-1.5 pr-3">{fmtTime(r.check_in)}</td>
                      <td className="py-1.5 pr-3">{fmtTime(r.check_out)}</td>
                      <td className="py-1.5 pr-3">{fmtDuration(r.work_seconds)}</td>
                      <td className="py-1.5 pr-3">
                        <StatusBadge status={r.status} size="sm" />
                        {r.missed_checkout && <span className="ml-1 text-warning text-[10px] font-bold">missed checkout</span>}
                      </td>
                    </tr>
                  ))}
                  {history.records.length === 0 && (
                    <tr><td colSpan={5} className="py-3 text-center text-primary/40">No records this month.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
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

      {/* Approvals (manager/HR/admin only) */}
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
    </div>
  );
}