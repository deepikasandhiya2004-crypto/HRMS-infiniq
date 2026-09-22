import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [devLink, setDevLink] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setMessage(""); setDevLink("");
    setBusy(true);
    try {
      const r = await api.post("/auth/forgot-password", { email: email.trim() });
      setMessage(r.data.message);
      if (r.data.dev_reset_link) setDevLink(r.data.dev_reset_link);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream font-gellix px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-md border border-primary/10">
        <p className="text-lg font-black text-primary mb-1">Forgot Password</p>
        <p className="text-xs text-primary/50 mb-6">Enter your email and we'll generate a reset link.</p>

        {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">{error}</div>}
        {message && <div className="mb-4 rounded-xl bg-accent/10 border border-accent/30 px-3 py-2 text-xs text-primary">{message}</div>}
        {devLink && (
          <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800 break-all">
            <p className="font-bold mb-1">Dev mode (no email service connected yet):</p>
            <Link to={devLink.replace(window.location.origin, "")} className="underline">{devLink}</Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-primary/20 px-3 py-2.5 text-sm" placeholder="you@gmail.com" />
          <button type="submit" disabled={busy}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-white disabled:opacity-60">
            {busy ? "Sending…" : "Send Reset Link"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-primary/60">
          <Link to="/login" className="font-bold text-primary hover:underline">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}