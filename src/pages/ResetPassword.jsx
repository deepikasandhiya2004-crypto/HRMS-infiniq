import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "../services/api.js";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      setDone(true);
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream font-gellix px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-md border border-primary/10">
        <p className="text-lg font-black text-primary mb-1">Reset Password</p>
        <p className="text-xs text-primary/50 mb-6">Choose a new password for your account.</p>

        {!token && <p className="text-xs text-red-600 mb-3">No reset token found in this link.</p>}
        {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">{error}</div>}
        {done && <div className="mb-4 rounded-xl bg-accent/10 border border-accent/30 px-3 py-2 text-xs text-primary">Password updated. Redirecting to login…</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="password" required minLength={8} disabled={!token} value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-primary/20 px-3 py-2.5 text-sm" placeholder="New password (min 8 chars)" />
          <button type="submit" disabled={busy || !token}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-white disabled:opacity-60">
            {busy ? "Updating…" : "Update Password"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-primary/60">
          <Link to="/login" className="font-bold text-primary hover:underline">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}