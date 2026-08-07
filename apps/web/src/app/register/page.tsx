"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";

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
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex" }}>
      {/* Left — decorative brand panel */}
      <div className="hidden lg:flex flex-col justify-between" style={{ width: "44%", background: "linear-gradient(145deg, #3D2DB8 0%, #5B47E0 50%, #9B87F5 100%)", padding: "48px", position: "relative", overflow: "hidden" }}>
        {/* Orbs */}
        <div className="orb orb-warm w-80 h-80" style={{ top: "-60px", right: "-60px", opacity: 0.35 }} />
        <div className="orb w-48 h-48" style={{ bottom: "60px", left: "-20px", background: "radial-gradient(circle, rgba(255,255,255,0.15), transparent 70%)" }} />

        {/* Logo */}
        <div className="flex items-center gap-2 relative">
          <div style={{ width: "36px", height: "36px", borderRadius: "12px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontWeight: 900, fontSize: "16px" }}>N</span>
          </div>
          <span style={{ color: "white", fontWeight: 700, fontSize: "18px" }}>Nexora <span style={{ fontWeight: 500, opacity: 0.8 }}>Studio</span></span>
        </div>

        {/* Center copy */}
        <div className="relative">
          <div className="badge badge-brand bg-white/20 text-white mb-4">Start Free Today</div>
          <h2 style={{ color: "white", fontWeight: 900, fontSize: "2.4rem", lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: "20px" }}>
            A creative workspace<br />for everyone.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.72)", lineHeight: 1.7, fontSize: "1.02rem" }}>
            No coding required. Describe what you need and let AI shape your digital presence in 60 seconds flat.
          </p>
        </div>

        {/* Testimonial chip */}
        <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: "16px", padding: "20px 24px", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.18)", position: "relative" }}>
          <p style={{ color: "white", fontSize: "0.9rem", lineHeight: 1.65, marginBottom: "14px", fontStyle: "italic" }}>
            "Finally a platform that feels like a modern design studio rather than a complex developer dashboard."
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "13px", color: "white" }}>SM</div>
            <div>
              <div style={{ color: "white", fontWeight: 600, fontSize: "13px" }}>Sofia Marin</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "12px" }}>Freelance Creator</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right — register form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div style={{ width: "100%", maxWidth: "420px" }}>
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-10">
            <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-brand)" }}>
              <span style={{ color: "white", fontWeight: 900, fontSize: "14px" }}>N</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: "17px" }}>Nexora Studio</span>
          </div>

          <div className="animate-fade-up">
            <h1 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "8px", letterSpacing: "-0.02em" }}>Create free account</h1>
            <p style={{ color: "var(--text-secondary)", marginBottom: "32px", fontSize: "0.95rem" }}>
              Join creators building beautiful sites with AI.
            </p>

            {error && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: "12px", padding: "12px 16px", marginBottom: "20px", color: "#DC2626", fontSize: "14px" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>Full Name</label>
                <input id="register-name" type="text" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input" placeholder="Alex Rivera" />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>Email</label>
                <input id="register-email" type="email" required value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input" placeholder="alex@example.com" />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input id="register-password" type={showPass ? "text" : "password"} required minLength={8} value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="input" placeholder="Min. 8 characters" style={{ paddingRight: "44px" }} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", display: "flex" }}>
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button id="register-submit" type="submit" disabled={loading}
                className="btn btn-primary"
                style={{ width: "100%", padding: "13px", fontSize: "15px", marginTop: "8px", opacity: loading ? 0.7 : 1 }}>
                {loading ? "Creating account…" : <><Sparkles className="w-4 h-4" /> Create Free Account</>}
              </button>
            </form>

            <p style={{ textAlign: "center", marginTop: "28px", fontSize: "14px", color: "var(--text-secondary)" }}>
              Already have an account?{" "}
              <Link href="/login" style={{ color: "var(--brand)", fontWeight: 600, textDecoration: "none" }}>
                Sign in →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

