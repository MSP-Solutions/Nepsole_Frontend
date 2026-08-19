"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate auth action and redirect to dashboard
    setTimeout(() => {
      setIsLoading(false);
      router.push("/admin/dashboard");
    }, 800);
  };

  return (
    <div className="min-h-screen w-full bg-[#071020] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] rounded-full bg-[#1749A0]/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative z-10 w-full max-w-md bg-[#0F2557]/60 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/50">
        
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1749A0] text-white shadow-lg shadow-blue-900/50 group-hover:scale-105 transition-transform">
              <BookOpen size={20} strokeWidth={2.2} />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              Nepsole
            </span>
          </Link>

          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Admin Portal Login
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Sign in to manage books, inventory, authors & orders
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Email or Username
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                placeholder="admin@nepsole.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#1749A0] focus:ring-1 focus:ring-[#1749A0] transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Password
              </label>
              <a
                href="#"
                className="text-[11px] font-medium text-amber-400 hover:text-amber-300 transition-colors"
              >
                Forgot Password?
              </a>
            </div>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#1749A0] focus:ring-1 focus:ring-[#1749A0] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-[#1749A0] focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-xs text-slate-400">Remember this session</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#1749A0] to-[#0F2557] hover:from-[#1d59c4] hover:to-[#143275] text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70"
          >
            {isLoading ? (
              <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Security Footer Note */}
        <div className="mt-8 pt-5 border-t border-slate-700/50 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
          <span>256-Bit SSL Encrypted • Authorized Personnel Only</span>
        </div>
      </div>
    </div>
  );
}