"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { ArrowRight, Eye, EyeOff, CheckCircle2, Globe, Zap, User, Mail, Lock } from "lucide-react";

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
      if (res.data.refreshToken) {
        localStorage.setItem("refreshToken", res.data.refreshToken);
      }
      localStorage.setItem("user", JSON.stringify(res.data.user));
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex select-none font-sans">

      {/* Left — Brand Panel */}
      <div className="hidden lg:flex flex-col justify-between w-[44%] bg-gradient-to-br from-violet-600 via-indigo-700 to-indigo-800 p-12 relative overflow-hidden">
        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }}
        />
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-16 -translate-y-16" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
            <span className="text-white font-black text-base">N</span>
          </div>
          <span className="font-bold text-white text-lg tracking-tight">Nexora</span>
        </div>

        {/* Main copy */}
        <div className="space-y-6 relative z-10 my-auto py-8">
          <h1 className="text-4xl xl:text-[44px] font-black text-white leading-tight tracking-tight">
            Your corner<br />
            <span className="text-indigo-200">of the internet.</span>
          </h1>

          <p className="text-indigo-100/80 text-sm leading-relaxed max-w-sm">
            It takes longer to make a cup of tea than to get your site live.
            No tech skills needed — just show up and we&apos;ll handle the rest.
          </p>

          <div className="space-y-3 pt-2">
            {[
              { icon: Zap,          text: "Live in under 3 minutes, seriously" },
              { icon: Globe,        text: "Your own address at nexora.site/you" },
              { icon: CheckCircle2, text: "Free — no credit card, ever" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-indigo-100/90">
                <Icon size={15} className="text-indigo-300 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 relative z-10">
          <p className="text-sm text-white/90 leading-relaxed">
            "Finally a tool that feels like it was built for normal people, not developers. Set up my restaurant menu page in one sitting."
          </p>
          <div className="flex items-center gap-2.5 pt-3 mt-3 border-t border-white/20">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs text-white">
              RK
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Raj Kapoor</div>
              <div className="text-[10px] text-indigo-200">Restaurant Owner</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm space-y-7 animate-fade-in">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-black text-sm">N</span>
            </div>
            <span className="font-bold text-slate-900 text-lg">Nexora</span>
          </div>

          {/* Header */}
          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold text-slate-900">Create your account</h2>
            <p className="text-sm text-slate-500">
              Free forever. No credit card needed.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700 animate-fade-in flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600">Full name</label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="register-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name"
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="register-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="register-password"
                  type={showPass ? "text" : "password"}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="At least 8 characters"
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20 group active:scale-[0.99]"
            >
              <span>{loading ? "Creating account…" : "Get started free"}</span>
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
