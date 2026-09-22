import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import StatusBadge from "../components/common/StatusBadge.jsx";
import api from "../services/api.js";
import { fmtTime, fmtDate } from "../utils/format.js";

export default function Team() {
  const [team, setTeam] = useState(null);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get("/team/my").then((r) => setTeam(r.data)).catch((e) => setError(e.message));
  }, []);

  async function openProfile(id) {
    try {
      const r = await api.get(`/team/members/${id}`);
      setProfile(r.data.employee);
    } catch (err) {
      alert(err.message);
    }
  }

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!team) return <p className="text-sm text-primary/60">Loading team…</p>;

  return (
    <div className="space-y-4">
      {team.manager && (
        <p className="text-xs text-primary/60">Reporting to <b className="text-primary">{team.manager.full_name}</b> ({team.manager.designation})</p>
      )}

      <div className="rounded-2xl bg-white border border-primary/10 shadow-sm divide-y divide-primary/5">
        {team.members.map((m) => (
          <button key={m.id} onClick={() => openProfile(m.id)} className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-primary/5">
            <div>
              <p className="text-xs font-bold text-primary">{m.full_name}</p>
              <p className="text-[11px] text-primary/50">{m.designation} · {m.department}</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-primary/50">
              {m.check_in && <span>In: {fmtTime(m.check_in)}</span>}
              <StatusBadge status={m.today_status} size="sm" />
            </div>
          </button>
        ))}
        {team.members.length === 0 && <p className="px-5 py-6 text-center text-xs text-primary/40">No direct reports.</p>}
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
              <p><b className="text-primary">Department:</b> {profile.department}</p>
              <p><b className="text-primary">Designation:</b> {profile.designation}</p>
              <p><b className="text-primary">Manager:</b> {profile.manager_name || "—"}</p>
              <p><b className="text-primary">Joined:</b> {fmtDate(profile.joined_on)}</p>
              <p><b className="text-primary">Status:</b> {profile.status}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}