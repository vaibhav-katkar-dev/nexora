"use client";

import { useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import { aiApi } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { Sparkles, Send, Loader2, Zap, Cpu, CheckCircle2, Coins } from "lucide-react";

export function AiCopilotPanel() {
  const { projectId, config, setConfig } = useEditorStore();
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>(""); // empty = auto from server env
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastUsage, setLastUsage] = useState<{
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
    cached: boolean;
    modelUsed?: string;
  } | null>(null);

  const toast = useToast();

  const QUICK_PROMPTS = [
    "Add a high-converting Hero banner section",
    "Add a modern 3-tier Pricing section",
    "Make my about bio sound more executive and confident",
    "Add an interactive FAQ accordion section",
    "Generate a restaurant food menu section",
  ];

  const handleGenerate = async (customPrompt?: string) => {
    const textToRun = customPrompt || prompt;
    if (!textToRun.trim() || !config || !projectId) return;

    setIsGenerating(true);
    setLastUsage(null);
    try {
      const res = await aiApi.generateSite({
        prompt: textToRun,
        category: config.meta?.category || "portfolio",
        model: selectedModel || undefined, // Send undefined so backend resolves model from env
      });

      if (res.data?.config) {
        setConfig(res.data.config);
        if (res.data.tokensUsed) {
          setLastUsage({
            totalTokens: res.data.tokensUsed.totalTokens,
            promptTokens: res.data.tokensUsed.promptTokens,
            completionTokens: res.data.tokensUsed.completionTokens,
            cached: res.data.cached,
            modelUsed: res.data.modelUsed,
          });
        }
        toast.success(
          "AI Generation Complete!",
          `Generated with ${res.data.modelUsed || "Default Model"} (${res.data.cached ? "Cached" : `${res.data.tokensUsed?.totalTokens || 0} tokens`})`
        );
        setPrompt("");
      } else {
        toast.error("Generation error", "AI did not return a valid layout structure.");
      }
    } catch (err: any) {
      toast.error("AI Error", err.message || "Failed to generate AI content.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 w-full flex-shrink-0 select-none overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 space-y-2">
        <h2 className="text-sm font-extrabold text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" /> Nexora AI Copilot
          </span>
          <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800/60 px-2 py-0.5 rounded-full font-mono">
            v2.5
          </span>
        </h2>
        <p className="text-xs text-slate-400">Generate, expand or rewrite section content with AI</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Dynamic Model Selector */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Cpu size={13} className="text-indigo-400" /> AI Model Engine
          </label>
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            <button
              onClick={() => setSelectedModel("")}
              className={`p-2 rounded-xl border text-center transition-all ${
                selectedModel === ""
                  ? "bg-indigo-950/80 border-indigo-500 text-white font-bold"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              Auto (Env)
            </button>
            <button
              onClick={() => setSelectedModel("gemini-2.5-flash")}
              className={`p-2 rounded-xl border text-center transition-all ${
                selectedModel === "gemini-2.5-flash"
                  ? "bg-indigo-950/80 border-indigo-500 text-white font-bold"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              Gemini 2.5
            </button>
            <button
              onClick={() => setSelectedModel("gpt-4o-mini")}
              className={`p-2 rounded-xl border text-center transition-all ${
                selectedModel === "gpt-4o-mini"
                  ? "bg-indigo-950/80 border-indigo-500 text-white font-bold"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              GPT-4o Mini
            </button>
          </div>
        </div>

        {/* Prompt Input Box */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300">Prompt AI Assistant</label>
          <div className="relative">
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Add a section detailing my 5 years of machine learning experience..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all resize-none shadow-sm"
            />
            <button
              onClick={() => handleGenerate()}
              disabled={isGenerating || !prompt.trim()}
              className="mt-2 w-full py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-40 flex items-center justify-center gap-2 shadow-md transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>AI Thinking &amp; Generating…</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Generate with {selectedModel ? selectedModel : "Server Env Model"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Token Usage Stats Card */}
        {lastUsage && (
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Coins size={14} /> AI Token Check Summary
              </span>
              <span className="text-[11px] font-mono text-indigo-400">{lastUsage.modelUsed}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px] font-mono pt-1 text-center">
              <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800/60">
                <div className="text-[10px] text-slate-400 uppercase">Prompt</div>
                <div className="font-bold text-slate-200">{lastUsage.promptTokens}</div>
              </div>
              <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800/60">
                <div className="text-[10px] text-slate-400 uppercase">Response</div>
                <div className="font-bold text-slate-200">{lastUsage.completionTokens}</div>
              </div>
              <div className="bg-indigo-950/50 p-1.5 rounded-lg border border-indigo-800/50">
                <div className="text-[10px] text-indigo-300 uppercase">Total</div>
                <div className="font-bold text-indigo-400">{lastUsage.totalTokens}</div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Prompts */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
            Suggested Prompts
          </span>
          <div className="space-y-1.5">
            {QUICK_PROMPTS.map((qp, i) => (
              <button
                key={i}
                disabled={isGenerating}
                onClick={() => {
                  setPrompt(qp);
                  handleGenerate(qp);
                }}
                className="w-full text-left p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-900 text-xs text-slate-300 transition-all flex items-start gap-2 group"
              >
                <Zap size={13} className="text-amber-400 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="line-clamp-2">{qp}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
