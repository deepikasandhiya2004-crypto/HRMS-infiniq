import React, { useEffect, useState } from "react";
import { User, Bell, Lock } from "lucide-react";
import api from "../services/api.js";

const TABS = [
  { key: "account", label: "Account", icon: User },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "security", label: "Security", icon: Lock },
];

export default function Settings() {
  const [tab, setTab] = useState("account");
    const [pwForm, setPwForm] = useState({ current_password: "", new_password: "", confirm: "" });
  const [pwError, setPwError] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwBusy, setPwBusy] = useState(false);

  async function submitPassword(e) {
    e.preventDefault();
    setPwError(""); setPwMsg("");
    if (pwForm.new_password !== pwForm.confirm) {
      setPwError("New password and confirm password don't match");
      return;
    }
    setPwBusy(true);
    try {
      const r = await api.post("/auth/change-password", {
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
      });
      setPwMsg(r.data.message);
      setPwForm({ current_password: "", new_password: "", confirm: "" });
    } catch (err) {
      setPwError(err.message);
    } finally {
      setPwBusy(false);
    }
  }
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

  const Toggle = ({ on, onClick }) => (
    <button onClick={onClick} className={`h-6 w-11 rounded-full transition shrink-0 ${on ? "bg-primary" : "bg-primary/15"}`}>
      <span className={`block h-5 w-5 mt-0.5 rounded-full bg-white transition ${on ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );

  return (
    <div className="max-w-4xl space-y-4">
      <div>
        <p className="text-xs font-semibold text-primary/50">SETTINGS</p>
        <h1 className="text-xl font-extrabold text-primary">Account Settings</h1>
      </div>

      {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-xs text-red-600">{error}</div>}
      {msg && <div className="rounded-xl bg-accent/10 border border-accent/30 px-4 py-2 text-xs text-primary">{msg}</div>}

      <div className="flex gap-1 border-b border-primary/10">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 -mb-px ${
              tab === t.key ? "border-primary text-primary" : "border-transparent text-primary/50 hover:text-primary/70"
            }`}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "account" && (
        <div className="rounded-2xl bg-white p-5 border border-primary/10 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-primary/70 mb-5">
            <p><span className="block text-[10px] font-bold uppercase tracking-wide text-primary/40">Name</span>{data.account.full_name}</p>
            <p><span className="block text-[10px] font-bold uppercase tracking-wide text-primary/40">Employee Code</span>{data.account.employee_code}</p>
            <p><span className="block text-[10px] font-bold uppercase tracking-wide text-primary/40">Email</span>{data.account.email}</p>
            <p><span className="block text-[10px] font-bold uppercase tracking-wide text-primary/40">Department</span>{data.account.department || "—"}</p>
            <p><span className="block text-[10px] font-bold uppercase tracking-wide text-primary/40">Designation</span>{data.account.designation || "—"}</p>
            <p><span className="block text-[10px] font-bold uppercase tracking-wide text-primary/40">Reports To</span>{data.account.manager_name || "—"}</p>
          </div>
          <form onSubmit={saveAccount} className="flex gap-2 max-w-sm">
            <div className="flex-1">
              <label className="text-xs font-semibold text-primary/70">Phone Number</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9xxxxxxxxx" className="mt-1 w-full rounded-lg border border-primary/20 px-3 py-2 text-xs" />
            </div>
            <button type="submit" className="self-end rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white">Save</button>
          </form>
        </div>
      )}

      {tab === "notifications" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white p-4 border border-primary/10 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wide text-primary/40 mb-1">Delivery</p>
              <p className="text-lg font-extrabold text-primary">
                {[data.preferences.in_app_enabled && "In-app", data.preferences.email_enabled && "Email"].filter(Boolean).join(", ") || "None"}
              </p>
              <p className="text-[11px] text-primary/50 mt-0.5">Active channels</p>
            </div>
            <div className="rounded-2xl bg-white p-4 border border-primary/10 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wide text-primary/40 mb-1">Alert Types</p>
              <p className="text-lg font-extrabold text-primary">2</p>
              <p className="text-[11px] text-primary/50 mt-0.5">Request updates, approval reminders</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white p-5 border border-primary/10 shadow-sm">
              <h2 className="text-sm font-extrabold text-primary mb-3">Attendance & Requests</h2>
              <div className="divide-y divide-primary/5">
                <div className="flex items-center justify-between py-3">
                  <div className="pr-3">
                    <p className="text-xs font-bold text-primary">Request status updates</p>
                    <p className="text-[11px] text-primary/50">Notify when a submitted request is approved or rejected.</p>
                  </div>
                  <Toggle on={data.preferences.request_updates} onClick={() => togglePref("request_updates")} />
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="pr-3">
                    <p className="text-xs font-bold text-primary">Pending approvals</p>
                    <p className="text-[11px] text-primary/50">Alert reviewers when a request is waiting on them.</p>
                  </div>
                  <Toggle on={data.preferences.approval_reminders} onClick={() => togglePref("approval_reminders")} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 border border-primary/10 shadow-sm">
              <h2 className="text-sm font-extrabold text-primary mb-3">Delivery Channels</h2>
              <div className="divide-y divide-primary/5">
                <div className="flex items-center justify-between py-3">
                  <div className="pr-3">
                    <p className="text-xs font-bold text-primary">Email notifications</p>
                    <p className="text-[11px] text-primary/50">Get updates sent to your work email.</p>
                  </div>
                  <Toggle on={data.preferences.email_enabled} onClick={() => togglePref("email_enabled")} />
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="pr-3">
                    <p className="text-xs font-bold text-primary">In-app notifications</p>
                    <p className="text-[11px] text-primary/50">Show alerts inside the HRMS app.</p>
                  </div>
                  <Toggle on={data.preferences.in_app_enabled} onClick={() => togglePref("in_app_enabled")} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {tab === "security" && (
        <div className="rounded-2xl bg-white p-5 border border-primary/10 shadow-sm max-w-md">
          <h2 className="text-sm font-extrabold text-primary mb-1">Change Password</h2>
          <p className="text-xs text-primary/50 mb-4">Choose a strong password you don't use elsewhere.</p>

          {pwError && <div className="mb-3 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">{pwError}</div>}
          {pwMsg && <div className="mb-3 rounded-xl bg-accent/10 border border-accent/30 px-3 py-2 text-xs text-primary">{pwMsg}</div>}

          <form onSubmit={submitPassword} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-primary/70">Current Password</label>
              <input type="password" required value={pwForm.current_password} onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })} className="mt-1 w-full rounded-lg border border-primary/20 px-3 py-2 text-xs" />
            </div>
            <div>
              <label className="text-xs font-semibold text-primary/70">New Password</label>
              <input type="password" required minLength={8} value={pwForm.new_password} onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })} className="mt-1 w-full rounded-lg border border-primary/20 px-3 py-2 text-xs" placeholder="At least 8 characters" />
            </div>
            <div>
              <label className="text-xs font-semibold text-primary/70">Confirm New Password</label>
              <input type="password" required minLength={8} value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} className="mt-1 w-full rounded-lg border border-primary/20 px-3 py-2 text-xs" />
            </div>
            <button type="submit" disabled={pwBusy} className="w-full rounded-lg bg-primary py-2.5 text-xs font-bold text-white disabled:opacity-60">
              {pwBusy ? "Updating…" : "Update Password"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}