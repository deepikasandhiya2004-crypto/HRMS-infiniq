import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signup(form.full_name.trim(), form.email.trim(), form.password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream font-gellix px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-md border border-primary/10">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary font-black text-xl">iQ</div>
          <div>
            <p className="text-lg font-black text-primary">INFINIQ HRMS</p>
            <p className="text-[11px] text-primary/50">Create your account</p>
          </div>
        </div>

        {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-primary/70">Full Name</label>
            <input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="mt-1 w-full rounded-xl border border-primary/20 px-3 py-2.5 text-sm" placeholder="Your name" />
          </div>
          <div>
            <label className="text-xs font-semibold text-primary/70">Email</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full rounded-xl border border-primary/20 px-3 py-2.5 text-sm" placeholder="you@gmail.com" />
          </div>
          <div>
            <label className="text-xs font-semibold text-primary/70">Password</label>
            <input type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1 w-full rounded-xl border border-primary/20 px-3 py-2.5 text-sm" placeholder="At least 8 characters" />
          </div>
          <button type="submit" disabled={busy}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-white disabled:opacity-60">
            {busy ? "Creating account…" : "Sign Up"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-primary/60">
          Already have an account? <Link to="/login" className="font-bold text-primary hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}