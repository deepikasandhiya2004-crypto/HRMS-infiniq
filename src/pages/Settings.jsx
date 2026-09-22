import React, { useEffect, useState } from "react";
import api from "../services/api.js";

export default function Settings() {
  const [data, setData] = useState(null);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    const r = await api.get("/settings");
    setData(r.data);
    setPhone(r.data.account.phone || "");
  }

  useEffect(() => { load().catch((e) => setError(e.message)); }, []);

  async function saveAccount(e) {
    e.preventDefault();
    setError(""); setMsg("");
    try {
      const r = await api.patch("/settings/account", { phone: phone.trim() || null });
      setData(r.data);
      setMsg("Account updated.");
    } catch (err) { setError(err.message); }
  }

  async function togglePref(key) {
    setError("");
    try {
      const r = await api.patch("/settings/preferences", { [key]: !data.preferences[key] });
      setData(r.data);
    } catch (err) { setError(err.message); }
  }

  if (error && !data) return <p className="text-sm text-red-600">{error}</p>;
  if (!data) return <p className="text-sm text-primary/60">Loading settings…</p>;

  const PREFS = [
    ["email_enabled", "Email notifications"],
    ["in_app_enabled", "In-app notifications"],
    ["request_updates", "Request status updates"],
    ["approval_reminders", "Approval reminders"],
  ];

  return (
    <div className="space-y-6 max-w-xl">
      {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-xs text-red-600">{error}</div>}
      {msg && <div className="rounded-xl bg-accent/10 border border-accent/30 px-4 py-2 text-xs text-primary">{msg}</div>}

      <div className="rounded-2xl bg-white p-5 border border-primary/10 shadow-sm">
        <h2 className="text-sm font-extrabold text-primary mb-3">Account</h2>
        <div className="text-xs text-primary/70 space-y-1 mb-4">
          <p><b className="text-primary">{data.account.full_name}</b> · {data.account.employee_code}</p>
          <p>{data.account.email}</p>
          <p>{data.account.designation} · {data.account.department}</p>
          {data.account.manager_name && <p>Reports to {data.account.manager_name}</p>}
        </div>
        <form onSubmit={saveAccount} className="flex gap-2">
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" className="flex-1 rounded-lg border border-primary/20 px-3 py-2 text-xs" />
          <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white">Save</button>
        </form>
      </div>

      <div className="rounded-2xl bg-white p-5 border border-primary/10 shadow-sm">
        <h2 className="text-sm font-extrabold text-primary mb-3">Notifications</h2>
        <div className="space-y-2">
          {PREFS.map(([key, label]) => (
            <label key={key} className="flex items-center justify-between text-xs text-primary/80">
              {label}
              <input type="checkbox" checked={data.preferences[key]} onChange={() => togglePref(key)} className="h-4 w-4 accent-accent" />
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 border border-primary/10 shadow-sm opacity-60">
        <h2 className="text-sm font-extrabold text-primary mb-1">Security</h2>
        <p className="text-xs text-primary/50">Password, 2FA and login history will be available once login is added.</p>
      </div>
    </div>
  );
}