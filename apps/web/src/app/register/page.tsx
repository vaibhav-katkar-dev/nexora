"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { ArrowRight, Eye, EyeOff, Sparkles, User, Mail, Lock, ShieldCheck, Globe, Layers, Zap } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.register(form);
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex select-none relative overflow-hidden font-sans">
      {/* Ambient background glowing orbs */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: "2s" }} />

      {/* Left — Brand & Hero Panel */}
      <div className="hidden lg:flex flex-col justify-between w-[46%] bg-slate-900/60 border-r border-slate-800/80 p-12 relative overflow-hidden backdrop-blur-xl">
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

        {/* Top Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles size={20} className="text-white animate-spin-slow" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            Nexora <span className="text-indigo-400 font-medium">Studio</span>
          </span>
        </div>

        {/* Center Copy */}
        <div className="space-y-6 relative z-10 my-auto py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 text-xs font-semibold shadow-sm">
            <Sparkles size={14} className="text-emerald-400 animate-bounce" />
            <span>100% Free Creator Workspace</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-black tracking-tight text-white leading-[1.15]">
            A Creative Suite <br />
            <span className="bg-gradient-to-r from-emerald-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Built For Everyone.
            </span>
          </h1>

          <p className="text-slate-400 text-sm xl:text-base leading-relaxed max-w-lg">
            No coding skills required. Describe your vision and let AI generate stunning, production-ready websites in under 60 seconds.
          </p>

          {/* Feature Chips */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              { icon: Zap, text: "Instant 60s Generation" },
              { icon: Layers, text: "20+ Modular Section Types" },
              { icon: Globe, text: "Custom Domain Slugs" },
              { icon: ShieldCheck, text: "High-Res QR Code Export" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs font-medium text-slate-300">
                <Icon size={14} className="text-indigo-400 shrink-0" />
                <span className="truncate">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Testimonial Card */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-md relative z-10 shadow-xl space-y-3">
          <p className="text-xs text-slate-300 italic leading-relaxed">
            "Finally a platform that feels like a modern design studio rather than a complex developer dashboard. The QR code generator is amazing."
          </p>
          <div className="flex items-center gap-3 pt-1 border-t border-slate-800/60">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-sm">
              SM
            </div>
            <div>
              <div className="text-xs font-bold text-white">Sofia Marin</div>
              <div className="text-[10px] text-slate-400">Freelance Creator</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Form Section */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Mobile Header Logo */}
          <div className="flex lg:hidden items-center justify-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white">
              Nexora <span className="text-indigo-400 font-medium">Studio</span>
            </span>
          </div>

          {/* Form Header */}
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Create free account
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Join thousands of creators building beautiful digital presence with AI.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-xs text-rose-300 font-medium animate-fade-in flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  id="register-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Alex Rivera"
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  id="register-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="alex@example.com"
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  id="register-password"
                  type={showPass ? "text" : "password"}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 8 characters"
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 group active:scale-[0.99]"
            >
              <Sparkles size={15} className="text-indigo-200" />
              <span>{loading ? "Creating account…" : "Create Free Account"}</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Footer Navigation Switcher */}
          <div className="text-center pt-2">
            <p className="text-xs text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-bold underline-offset-4 hover:underline transition-colors">
                Sign in →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


