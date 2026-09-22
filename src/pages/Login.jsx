import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email.trim(), password);
      navigate(location.state?.from || "/", { replace: true });
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
            <p className="text-[11px] text-primary/50">Welcome back</p>
          </div>
        </div>

        {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-primary/70">Work Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-primary/20 px-3 py-2.5 text-sm" placeholder="you@infiniq.test" />
          </div>
          <div>
            <label className="text-xs font-semibold text-primary/70">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-primary/20 px-3 py-2.5 text-sm" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={busy}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-white disabled:opacity-60">
            {busy ? "Signing in…" : "Login"}
          </button>
        </form>
                <div className="mt-4 flex items-center justify-between text-xs">
          <Link to="/forgot-password" className="font-bold text-primary hover:underline">Forgot password?</Link>
          <Link to="/signup" className="font-bold text-primary hover:underline">Create account</Link>
        </div>
      </div>
    </div>
  );
}