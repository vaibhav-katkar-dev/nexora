"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  X,
  Pencil,
  Send,
  ExternalLink,
  Copy,
  QrCode,
  Settings,
  FolderKanban,
  Trash2,
  CheckCircle2,
  Clock,
  Globe,
  ArrowRight,
  Calendar,
  Tag,
} from "lucide-react";
import { buildPublishedSiteUrl } from "@/lib/siteUrl";

type Project = {
  _id: string;
  name: string;
  category: string;
  status: string;
  slug: string;
  updatedAt: string;
};

interface ProjectSettingsPanelProps {
  project: Project | null;
  onClose: () => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenDomainSeo: (proj: Project) => void;
  onOpenQr: (proj: Project, liveUrl: string) => void;
  onCopyLink: (liveUrl: string) => void;
}

export function ProjectSettingsPanel({
  project,
  onClose,
  onDuplicate,
  onDelete,
  onOpenDomainSeo,
  onOpenQr,
  onCopyLink,
}: ProjectSettingsPanelProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (project) {
      // Small delay to trigger CSS transition after mount
      const t = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [project]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 280);
  };

  if (!project) return null;

  const isPublished = project.status === "published";
  const liveUrl = buildPublishedSiteUrl(project.slug);
  const updatedDate = new Date(project.updatedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out"
        style={{ transform: visible ? "translateX(0)" : "translateX(100%)" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-5 border-b border-slate-100">
          <div className="flex-1 min-w-0 pr-3">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isPublished
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-600"
                }`}
              >
                {isPublished ? <CheckCircle2 size={9} /> : <Clock size={9} />}
                {isPublished ? "Live" : "Draft"}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 leading-snug line-clamp-2">
              {project.name}
            </h2>
            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Tag size={10} />
                <span className="capitalize">{project.category.replace(/_/g, " ")}</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={10} />
                {updatedDate}
              </span>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* ── Primary Actions ─────────────────────────────────── */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
              Quick Actions
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href={`/editor/${project._id}`}
                onClick={handleClose}
                className="flex items-center gap-2.5 px-4 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm"
              >
                <Pencil size={15} />
                Open Editor
              </Link>

              {isPublished && project.slug ? (
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-4 py-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-semibold text-sm transition-colors border border-emerald-200"
                >
                  <ExternalLink size={15} />
                  View Live
                </a>
              ) : (
                <Link
                  href={`/publish/${project._id}`}
                  onClick={handleClose}
                  className="flex items-center gap-2.5 px-4 py-3.5 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-xl font-semibold text-sm transition-colors border border-slate-200 hover:border-indigo-200"
                >
                  <Send size={15} />
                  Publish Site
                </Link>
              )}
            </div>
          </section>

          {/* ── Publishing ──────────────────────────────────────── */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
              Publishing
            </p>
            <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
              <Link
                href={`/publish/${project._id}`}
                onClick={handleClose}
                className="flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <Send size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {isPublished ? "Republish" : "Publish"}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {isPublished ? "Push latest changes live" : "Make your site publicly visible"}
                    </p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
              </Link>

              {isPublished && project.slug && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onCopyLink(liveUrl);
                      handleClose();
                    }}
                    className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <Copy size={14} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-slate-800">Copy Site Link</p>
                        <p className="text-[11px] text-slate-400 truncate max-w-[200px]">{liveUrl}</p>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onOpenQr(project, liveUrl);
                      handleClose();
                    }}
                    className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <QrCode size={14} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-slate-800">QR Code</p>
                        <p className="text-[11px] text-slate-400">Generate & download QR for this site</p>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </button>
                </>
              )}
            </div>
          </section>

          {/* ── Site URL info ─────────────────────────────────── */}
          {isPublished && project.slug && (
            <section>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                Site URL
              </p>
              <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
                <Globe size={13} className="text-indigo-500 shrink-0" />
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 hover:underline truncate font-mono"
                >
                  {liveUrl}
                </a>
              </div>
            </section>
          )}

          {/* ── Settings ────────────────────────────────────────── */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
              Settings
            </p>
            <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
              <button
                type="button"
                onClick={() => {
                  onOpenDomainSeo(project);
                  handleClose();
                }}
                className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <Settings size={14} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-slate-800">Domain & SEO</p>
                    <p className="text-[11px] text-slate-400">Custom domain, meta tags, indexing</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onDuplicate(project._id);
                  handleClose();
                }}
                className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <FolderKanban size={14} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-slate-800">Duplicate Project</p>
                    <p className="text-[11px] text-slate-400">Create an identical copy of this site</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
              </button>
            </div>
          </section>

          {/* ── Danger Zone ─────────────────────────────────────── */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400 mb-3">
              Danger Zone
            </p>
            <div className="rounded-xl border border-rose-100 overflow-hidden">
              <button
                type="button"
                onClick={() => {
                  onDelete(project._id);
                  handleClose();
                }}
                className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-rose-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500">
                    <Trash2 size={14} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-rose-700">Delete Project</p>
                    <p className="text-[11px] text-rose-400">This action is permanent and cannot be undone</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-rose-300 group-hover:text-rose-500 transition-colors" />
              </button>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}
