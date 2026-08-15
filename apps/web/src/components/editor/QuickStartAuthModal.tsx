"use client";

import { useState } from "react";
import { X, Lock, Mail, User, KeyRound, Globe, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { authApi, projectsApi } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { getPublishedBaseLabel } from "@/lib/siteUrl";

interface QuickStartAuthModalProps {
  draftSlug: string;
  onSuccess: (projectId: string, liveSlug: string) => void;
  onClose: () => void;
  draftConfig: any;
}

export function QuickStartAuthModal({
  draftSlug,
  onSuccess,
  onClose,
  draftConfig,
}: QuickStartAuthModalProps) {
  const [mode, setMode] = useState<"register" | "login">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (mode === "register" && !name) {
      setError("Please enter your name.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      let authRes;
      if (mode === "register") {
        authRes = await authApi.register({ name, email, password });
      } else {
        authRes = await authApi.login({ email, password });
      }

      if (authRes.data?.accessToken) {
        localStorage.setItem("accessToken", authRes.data.accessToken);
        if (authRes.data.user) {
          localStorage.setItem("user", JSON.stringify(authRes.data.user));
        }
      }

      // If user had a custom slug in draft, update slug first
      const createRes = await projectsApi.create({
        name: draftConfig?.meta?.title || name || draftSlug || "Digital Presence",
        category: draftConfig?.meta?.category || "portfolio",
        config: draftConfig,
      });

      if (!createRes.data?._id) {
        throw new Error("Could not save project to cloud.");
      }

      const newProjId = createRes.data._id;

      // Update custom slug if requested
      if (draftSlug && draftSlug !== createRes.data.slug) {
        try {
          await projectsApi.updateSlug(newProjId, draftSlug);
        } catch {
          /* ignore if slug conflicts — backend keeps assigned slug */
        }
      }

      // Publish the project
      await projectsApi.publish(newProjId);

      sessionStorage.removeItem("nexora-quick-start-draft");
      toast.success("Site Published Successfully", `${getPublishedBaseLabel()}/${draftSlug}`);
      onSuccess(newProjId, draftSlug);
    } catch (err: any) {
      console.error("[QuickStartAuthModal] Error:", err);
      setError(err.response?.data?.message || err.message || "An error occurred while saving.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-6 animate-scale-in text-white relative overflow-hidden">
        {/* Background ambient lighting */}
        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 size={13} />
              <span>Link Ready to Publish</span>
            </div>
            <h3 className="text-xl font-extrabold tracking-tight text-white">
              Claim & Publish Your Site
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              {getPublishedBaseLabel()}/<span className="text-indigo-400 font-bold">{draftSlug}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode switcher tabs */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => { setMode("register"); setError(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === "register"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => { setMode("login"); setError(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === "login"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 relative z-10">
          {mode === "register" && (
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                Full Name
              </label>
              <div className="flex items-center rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 focus-within:border-indigo-500 transition-colors">
                <User size={15} className="text-slate-500 mr-2 shrink-0" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="flex-1 bg-transparent text-xs text-white placeholder-slate-600 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
              Email Address
            </label>
            <div className="flex items-center rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 focus-within:border-indigo-500 transition-colors">
              <Mail size={15} className="text-slate-500 mr-2 shrink-0" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="flex-1 bg-transparent text-xs text-white placeholder-slate-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
              Password
            </label>
            <div className="flex items-center rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 focus-within:border-indigo-500 transition-colors">
              <KeyRound size={15} className="text-slate-500 mr-2 shrink-0" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="flex-1 bg-transparent text-xs text-white placeholder-slate-600 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 mt-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Publishing site to cloud…</span>
              </>
            ) : (
              <>
                <Globe size={16} />
                <span>Publish /{draftSlug} Now</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        <p className="text-[11px] text-center text-slate-500">
          Standard SSL security & global CDN hosting included automatically.
        </p>
      </div>
    </div>
  );
}
