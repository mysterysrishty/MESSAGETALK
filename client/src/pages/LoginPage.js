import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, Zap } from "lucide-react";
import AuthShell from "../components/auth/AuthShell";
import Input from "../components/common/Input";
import Button from "../components/common/Button";

// ─── Demo credentials (matches your seedAdmin in authController.js) ──────────
const DEMO_EMAIL    = "test@msgmate.com";
const DEMO_PASSWORD = "test123";

const LoginPage = () => {
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);

  const { login, user } = useAuth();
  const navigate        = useNavigate();

  useEffect(() => {
    if (user) navigate("/chat", { replace: true });
  }, [user, navigate]);

  // ── shared submit logic ───────────────────────────────────────────────────
  const doLogin = async (loginEmail, loginPassword) => {
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      toast.success("Welcome back! 👋");
      navigate("/chat");
    } catch {
      toast.error("Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Please fill in all fields"); return; }
    doLogin(email, password);
  };

  // ── demo login ────────────────────────────────────────────────────────────
  const handleDemoLogin = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    doLogin(DEMO_EMAIL, DEMO_PASSWORD);
  };

  return (
    <AuthShell
      eyebrow="Welcome Back"
      title="Log in to MsgMate"
      subtitle="Pick up where you left off with a focused, modern chat experience."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-semibold text-[#00a884] hover:text-[#7fe7c8]">
            Create one
          </Link>
        </>
      }
    >
      {/* ── Demo login banner ─────────────────────────────────────────────── */}
      <div className="mb-5 rounded-2xl border border-[#00a884]/25 bg-[#00a884]/10 px-4 py-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#00a884]">
          Try it instantly
        </p>
        <p className="mb-3 text-xs leading-5 text-[#8ea2ab]">
          No sign-up needed. Use our demo account to explore all features right away.
        </p>
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#00a884]/40 bg-[#00a884]/15 py-2.5 text-sm font-semibold text-[#00a884] transition hover:bg-[#00a884]/25 disabled:opacity-50"
        >
          <Zap size={15} />
          {loading ? "Signing in…" : "Demo Login — one click"}
        </button>
      </div>

      {/* ── Divider ───────────────────────────────────────────────────────── */}
      <div className="mb-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-[#223239]" />
        <span className="text-xs text-[#8696a0]">or sign in with your account</span>
        <div className="h-px flex-1 bg-[#223239]" />
      </div>

      {/* ── Credentials form ──────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          autoComplete="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail size={16} />}
          className="rounded-2xl border border-[#223239] bg-[#182229] py-3.5"
        />

        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={16} />}
            className="rounded-2xl border border-[#223239] bg-[#182229] py-3.5 pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8ea2ab] transition-colors hover:text-white"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-2xl py-3.5 text-sm font-semibold"
        >
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  );
};

export default LoginPage;
