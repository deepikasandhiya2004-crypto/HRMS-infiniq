import React, { useEffect, useState, useMemo } from "react";
import { X, Users, UserCheck, Palmtree, Clock, Search, UserPlus } from "lucide-react";
import StatCard from "../components/common/StatCard.jsx";
import StatusBadge from "../components/common/StatusBadge.jsx";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { fmtTime, fmtDate } from "../utils/format.js";
import Dropdown from "../components/common/Dropdown.jsx";

export default function Team() {
  const { isReviewer } = useAuth();
  const [team, setTeam] = useState(null);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);
  const [pendingCount, setPendingCount] = useState(null);
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("All");
  const [status, setStatus] = useState("All");

  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ full_name: "", email: "", department: "", designation: "" });
  const [addError, setAddError] = useState("");
  const [addMsg, setAddMsg] = useState("");
  const [addBusy, setAddBusy] = useState(false);

  async function loadTeam() {
    try {
      const r = await api.get("/team/my");
      setTeam(r.data);
    } catch (e) { setError(e.message); }
  }

  useEffect(() => {
    loadTeam();
    if (isReviewer) {
      api.get("/attendance/requests/pending").then((r) => setPendingCount(r.data.requests.length)).catch(() => {});
    }
  }, [isReviewer]);

  async function openProfile(id) {
    try {
      const r = await api.get(`/team/members/${id}`);
      setProfile(r.data.employee);
    } catch (err) {
      alert(err.message);
    }
  }

  async function submitAdd(e) {
    e.preventDefault();
    setAddError(""); setAddMsg("");
    setAddBusy(true);
    try {
      await api.post("/team/members", addForm);
      setAddMsg(`${addForm.full_name} added. Ask them to use "Forgot password" with ${addForm.email} to set a login password.`);
      setAddForm({ full_name: "", email: "", department: "", designation: "" });
      await loadTeam();
    } catch (err) {
      setAddError(err.message);
    } finally {
      setAddBusy(false);
    }
  }

  const departments = useMemo(() => {
    if (!team) return [];
    return ["All", ...new Set(team.members.map((m) => m.department).filter(Boolean))];
  }, [team]);

  const statuses = useMemo(() => {
    if (!team) return [];
    return ["All", ...new Set(team.members.map((m) => m.today_status))];
  }, [team]);

  const filtered = useMemo(() => {
    if (!team) return [];
    return team.members.filter((m) => {
      const q = search.toLowerCase();
      const matchesSearch = m.full_name.toLowerCase().includes(q) || m.employee_code.toLowerCase().includes(q) || (m.designation || "").toLowerCase().includes(q);
      const matchesDept = dept === "All" || m.department === dept;
      const matchesStatus = status === "All" || m.today_status === status;
      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [team, search, dept, status]);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!team) return <p className="text-sm text-primary/60">Loading team…</p>;

  const presentCount = team.members.filter((m) => m.today_status === "present" || m.today_status === "wfh").length;
  const onLeaveCount = team.members.filter((m) => m.today_status === "leave").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-primary/50">TEAM</p>
          <h1 className="text-xl font-extrabold text-primary">My Team</h1>
          <p className="text-xs text-primary/50 mt-0.5">
            {team.manager ? `Colleagues reporting to ${team.manager.full_name}` : "Your direct reports"}
          </p>
        </div>
        {isReviewer && (
          <button onClick={() => { setShowAdd(true); setAddError(""); setAddMsg(""); }} className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white">
            <UserPlus size={15} /> Add Team Member
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Team Size" value={team.members.length} icon={Users} accentColor="#00373A" />
        <StatCard title="Present Today" value={presentCount} icon={UserCheck} accentColor="#00DC46" />
        <StatCard title="On Leave" value={onLeaveCount} icon={Palmtree} accentColor="#FF6A3D" />
        {isReviewer && <StatCard title="Pending Approvals" value={pendingCount ?? "—"} subtitle="Attendance requests" icon={Clock} accentColor="#7C3AED" />}
      </div>

      <div className="rounded-2xl bg-white border border-primary/10 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-2 p-4 border-b border-primary/10">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, ID or designation…" className="w-full rounded-lg border border-primary/15 pl-8 pr-3 py-2 text-xs" />
          </div>
          <Dropdown
            value={dept}
            onChange={setDept}
            options={departments.map((d) => ({ value: d, label: d === "All" ? "All Department" : d }))}
          />
          <Dropdown
            value={status}
            onChange={setStatus}
            options={statuses.map((s) => ({
              value: s,
              label: s === "All" ? "All Status" : { present: "Present", wfh: "WFH", leave: "On Leave", not_checked_in: "Not Checked In" }[s] || s,
            }))}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-primary/50 border-b border-primary/10 bg-primary/5">
                <th className="py-2.5 px-4">Employee</th>
                <th className="py-2.5 px-4">Designation</th>
                <th className="py-2.5 px-4">Department</th>
                <th className="py-2.5 px-4">Today</th>
                <th className="py-2.5 px-4">Check-in</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} onClick={() => openProfile(m.id)} className="border-b border-primary/5 cursor-pointer hover:bg-primary/5">
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                        {m.full_name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("")}
                      </div>
                      <div>
                        <p className="font-bold text-primary">{m.full_name}</p>
                        <p className="text-[10px] text-primary/50">{m.employee_code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-primary/70">{m.designation || "—"}</td>
                  <td className="py-2.5 px-4 text-primary/70">{m.department || "—"}</td>
                  <td className="py-2.5 px-4"><StatusBadge status={m.today_status} size="sm" /></td>
                  <td className="py-2.5 px-4 text-primary/70">{fmtTime(m.check_in)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-primary/40">No team members found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {profile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setProfile(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold text-primary">{profile.full_name}</h3>
              <button onClick={() => setProfile(null)}><X size={18} className="text-primary/50" /></button>
            </div>
            <div className="space-y-1.5 text-xs text-primary/70">
              <p><b className="text-primary">Code:</b> {profile.employee_code}</p>
              <p><b className="text-primary">Email:</b> {profile.email}</p>
              <p><b className="text-primary">Department:</b> {profile.department || "—"}</p>
              <p><b className="text-primary">Designation:</b> {profile.designation || "—"}</p>
              <p><b className="text-primary">Manager:</b> {profile.manager_name || "—"}</p>
              <p><b className="text-primary">Joined:</b> {fmtDate(profile.joined_on)}</p>
              <p><b className="text-primary">Status:</b> <span className="capitalize">{profile.status}</span></p>
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setShowAdd(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold text-primary">Add Team Member</h3>
              <button onClick={() => setShowAdd(false)}><X size={18} className="text-primary/50" /></button>
            </div>

            {addError && <div className="mb-3 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">{addError}</div>}
            {addMsg && <div className="mb-3 rounded-xl bg-accent/10 border border-accent/30 px-3 py-2 text-xs text-primary">{addMsg}</div>}

            <form onSubmit={submitAdd} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-primary/70">Full Name</label>
                <input required value={addForm.full_name} onChange={(e) => setAddForm({ ...addForm, full_name: e.target.value })} className="mt-1 w-full rounded-lg border border-primary/20 px-3 py-2 text-xs" />
              </div>
              <div>
                <label className="text-xs font-semibold text-primary/70">Email</label>
                <input type="email" required value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} className="mt-1 w-full rounded-lg border border-primary/20 px-3 py-2 text-xs" placeholder="name@infiniqstudios.com" />
              </div>
              <div>
                <label className="text-xs font-semibold text-primary/70">Department</label>
                <input value={addForm.department} onChange={(e) => setAddForm({ ...addForm, department: e.target.value })} className="mt-1 w-full rounded-lg border border-primary/20 px-3 py-2 text-xs" placeholder="e.g. Design" />
              </div>
              <div>
                <label className="text-xs font-semibold text-primary/70">Designation</label>
                <input value={addForm.designation} onChange={(e) => setAddForm({ ...addForm, designation: e.target.value })} className="mt-1 w-full rounded-lg border border-primary/20 px-3 py-2 text-xs" placeholder="e.g. UI/UX Designer" />
              </div>
              <button type="submit" disabled={addBusy} className="w-full rounded-lg bg-primary py-2.5 text-xs font-bold text-white disabled:opacity-60">
                {addBusy ? "Adding…" : "Add to Team"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}