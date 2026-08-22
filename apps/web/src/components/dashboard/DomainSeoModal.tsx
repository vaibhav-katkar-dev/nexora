"use client";

import { useState, useEffect, useCallback } from "react";
import { domainsApi, projectsApi, mediaApi } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import {
  Globe,
  Shield,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Star,
  RefreshCw,
  Plus,
  X,
  Upload,
  Link2,
  Search,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react";

interface DomainSeoModalProps {
  isOpen: boolean;
  onClose: () => void;
  site: {
    _id: string;
    name: string;
    slug: string;
    status: string;
    seo?: {
      metaTitle?: string;
      metaDescription?: string;
      ogImage?: string;
      keywords?: string[];
      favicon?: string;
      canonicalUrl?: string;
      noIndex?: boolean;
    };
  } | null;
  onSiteUpdated?: () => void;
}

export function DomainSeoModal({ isOpen, onClose, site, onSiteUpdated }: DomainSeoModalProps) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"domains" | "seo">("domains");

  // Domain State
  const [domains, setDomains] = useState<any[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [addingDomain, setAddingDomain] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  // SEO State
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [favicon, setFavicon] = useState("");
  const [allowIndexing, setAllowIndexing] = useState(true);
  const [txtCopied, setTxtCopied] = useState(false);
  const [deleteDomainConfirm, setDeleteDomainConfirm] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: "",
    name: "",
  });
  const [savingSeo, setSavingSeo] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchDomains = useCallback(async () => {
    if (!site?._id) return;
    try {
      const res = await domainsApi.list(site._id);
      if (res?.data) setDomains(res.data);
    } catch (err: any) {
      console.error("Failed to load domains", err);
    }
  }, [site?._id]);

  useEffect(() => {
    if (site && isOpen) {
      fetchDomains();
      setMetaTitle(site.seo?.metaTitle || site.name || "");
      setMetaDescription(site.seo?.metaDescription || "");
      setOgImage(site.seo?.ogImage || "");
      setFavicon(site.seo?.favicon || "");
      setAllowIndexing(!(site.seo?.noIndex ?? false));
    }
  }, [site, isOpen, fetchDomains]);

  if (!isOpen || !site) return null;

  // Add Domain handler
  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;

    setAddingDomain(true);
    try {
      const res = await domainsApi.add({ domain: newDomain.trim(), siteId: site._id });
      toast.success("Domain Added!", "Configure your DNS records below.");
      setNewDomain("");
      fetchDomains();
    } catch (err: any) {
      toast.error("Failed to add domain", err.message || "Please check your domain format.");
    } finally {
      setAddingDomain(false);
    }
  };

  // Verify Domain handler
  const handleVerifyDomain = async (id: string) => {
    setVerifyingId(id);
    try {
      const res = await domainsApi.verify(id);
      if (res.data?.status === "active") {
        toast.success("Domain Verified & Active!", res.message);
      } else {
        toast.error("DNS Verification Pending", res.message || "Please verify your DNS records.");
      }
      fetchDomains();
    } catch (err: any) {
      toast.error("Verification failed", err.message);
    } finally {
      setVerifyingId(null);
    }
  };

  // Set Primary Domain handler
  const handleSetPrimary = async (id: string) => {
    try {
      const res = await domainsApi.setPrimary(id);
      toast.success("Primary domain updated", res.message);
      fetchDomains();
    } catch (err: any) {
      toast.error("Failed to set primary domain", err.message);
    }
  };

  // Delete Domain handler
  const handleDeleteDomain = (id: string, domainName: string) => {
    setDeleteDomainConfirm({
      isOpen: true,
      id,
      name: domainName,
    });
  };

  const confirmDeleteDomain = async () => {
    const { id } = deleteDomainConfirm;
    if (!id) return;
    try {
      await domainsApi.delete(id);
      toast.success("Domain removed");
      setDeleteDomainConfirm({ isOpen: false, id: "", name: "" });
      fetchDomains();
    } catch (err: any) {
      toast.error("Failed to remove domain", err.message);
    }
  };

  // Image Upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "og" | "favicon") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const uploadRes = await mediaApi.upload(file, site._id);
      if (uploadRes?.url) {
        if (target === "og") setOgImage(uploadRes.url);
        else setFavicon(uploadRes.url);
        toast.success("Image uploaded successfully!");
      }
    } catch (err: any) {
      toast.error("Upload failed", err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  // Save SEO Settings handler
  const handleSaveSeo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSeo(true);
    try {
      await projectsApi.update(site._id, {
        seo: {
          metaTitle,
          metaDescription,
          ogImage,
          favicon,
          noIndex: !allowIndexing,
        },
      });
      toast.success("SEO Settings Saved!", "Search engine directives updated.");
      if (onSiteUpdated) onSiteUpdated();
    } catch (err: any) {
      toast.error("Failed to save SEO settings", err.message);
    } finally {
      setSavingSeo(false);
    }
  };

  // Determine computed canonical URL
  const primaryDomain = domains.find((d) => d.isPrimary) || domains.find((d) => d.status === "active");
  const canonicalUrl = primaryDomain
    ? `https://${primaryDomain.normalizedDomain}/`
    : `https://Oninsite.site/${site.slug}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                Site Settings
              </span>
              <h2 className="text-lg font-extrabold text-slate-900">{site.name}</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Configure custom domain routing, DNS, canonical URLs, and search engine visibility.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Tab Switcher */}
        <div className="flex border-b border-slate-100 px-6 bg-slate-50/30">
          <button
            onClick={() => setActiveTab("domains")}
            className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "domains"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Globe size={15} /> Custom Domains ({domains.length})
          </button>
          <button
            onClick={() => setActiveTab("seo")}
            className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "seo"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Search size={15} /> SEO & Search Visibility
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ════ DOMAINS TAB ════ */}
          {activeTab === "domains" && (
            <div className="space-y-6">
              {/* Default Oninsite Subdomain Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">Oninsite.site/{site.slug}</span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      Default Subdomain
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Free permanent web address hosted on Oninsite global CDN.
                  </p>
                </div>
                <a
                  href={`https://Oninsite.site/${site.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-white border border-slate-200 transition-colors"
                  title="View live site"
                >
                  <ExternalLink size={14} />
                </a>
              </div>

              {/* Add Custom Domain Form */}
              <form onSubmit={handleAddDomain} className="space-y-3">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Connect a Custom Domain
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Globe size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={newDomain}
                      onChange={(e) => setNewDomain(e.target.value)}
                      placeholder="www.cafemumbai.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={addingDomain || !newDomain.trim()}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 shrink-0 transition-all"
                  >
                    {addingDomain ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Plus size={14} />
                    )}
                    <span>Connect Domain</span>
                  </button>
                </div>
              </form>

              {/* Domain List */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Connected Domains
                </h3>

                {domains.length === 0 ? (
                  <div className="p-6 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400 text-xs">
                    No custom domains connected yet. Enter your domain above to start.
                  </div>
                ) : (
                  domains.map((dom) => {
                    const isActive = dom.status === "active";
                    const isPending = dom.status === "pending" || dom.status === "verifying";

                    return (
                      <div
                        key={dom._id}
                        className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-sm text-slate-900">
                                {dom.normalizedDomain}
                              </span>
                              {dom.isPrimary && (
                                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 flex items-center gap-1">
                                  <Star size={10} className="fill-indigo-600" /> Primary Canonical
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span
                                className={`flex items-center gap-1 font-bold text-[11px] ${
                                  isActive
                                    ? "text-emerald-600"
                                    : isPending
                                    ? "text-amber-600"
                                    : "text-rose-600"
                                }`}
                              >
                                {isActive ? (
                                  <CheckCircle2 size={13} />
                                ) : isPending ? (
                                  <Clock size={13} />
                                ) : (
                                  <AlertCircle size={13} />
                                )}
                                {isActive
                                  ? "Connected & SSL Active"
                                  : isPending
                                  ? "Waiting for DNS propagation"
                                  : "Verification Failed"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleVerifyDomain(dom._id)}
                              disabled={verifyingId === dom._id}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1 transition-colors"
                            >
                              <RefreshCw
                                size={12}
                                className={verifyingId === dom._id ? "animate-spin text-indigo-600" : ""}
                              />
                              <span>{verifyingId === dom._id ? "Verifying…" : "Verify DNS"}</span>
                            </button>
                            {!dom.isPrimary && (
                              <button
                                onClick={() => handleSetPrimary(dom._id)}
                                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 text-xs font-bold text-slate-600 transition-colors"
                              >
                                Make Primary
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteDomain(dom._id, dom.normalizedDomain)}
                              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Remove domain"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {/* DNS Instructions Box */}
                        {isPending && (
                          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3 text-xs">
                            <div className="font-bold flex items-center gap-2 text-amber-300">
                              <AlertCircle size={14} />
                              <span>Step 1: Add the DNS record in your domain registrar (GoDaddy, Namecheap, Cloudflare)</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 font-mono text-[11px] bg-slate-950 p-3 rounded-lg border border-slate-800">
                              <div>
                                <span className="text-slate-500 block text-[10px]">RECORD TYPE</span>
                                <span className="text-indigo-400 font-bold">A Record</span>
                              </div>
                              <div>
                                <span className="text-slate-500 block text-[10px]">HOST / NAME</span>
                                <span className="text-white">@</span>
                              </div>
                              <div>
                                <span className="text-slate-500 block text-[10px]">VALUE / TARGET</span>
                                <span className="text-emerald-400 font-bold">76.76.21.21</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 font-mono text-[11px] bg-slate-950 p-3 rounded-lg border border-slate-800">
                              <div>
                                <span className="text-slate-500 block text-[10px]">RECORD TYPE</span>
                                <span className="text-indigo-400 font-bold">CNAME</span>
                              </div>
                              <div>
                                <span className="text-slate-500 block text-[10px]">HOST / NAME</span>
                                <span className="text-white">www</span>
                              </div>
                              <div>
                                <span className="text-slate-500 block text-[10px]">VALUE / TARGET</span>
                                <span className="text-emerald-400 font-bold">cname.vercel-dns.com</span>
                              </div>
                            </div>
                            <p className="text-[11px] text-slate-400">
                              Step 2: Wait 2-5 minutes for DNS propagation, then click <strong>Verify DNS</strong> above.
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ════ SEO TAB ════ */}
          {activeTab === "seo" && (
            <form onSubmit={handleSaveSeo} className="space-y-6">
              {/* Indexing Toggle */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <label className="text-xs font-extrabold text-slate-900 flex items-center gap-2 cursor-pointer">
                    {allowIndexing ? <Eye size={16} className="text-emerald-600" /> : <EyeOff size={16} className="text-rose-500" />}
                    <span>Search Engine Visibility</span>
                  </label>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-md">
                    Allow search engines such as Google to discover and display your website in search results.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setAllowIndexing(!allowIndexing)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    allowIndexing ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      allowIndexing ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Status Badge */}
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-2">
                  <Shield size={14} className={allowIndexing ? "text-emerald-600" : "text-amber-600"} />
                  <span>Canonical URL:</span>
                  <code className="text-slate-900 font-mono text-[11px] font-bold">{canonicalUrl}</code>
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    allowIndexing
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {allowIndexing ? "✓ Technically Indexable" : "noindex,nofollow"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-[11px] text-indigo-900 leading-relaxed font-medium">
                💡 <strong>Search Engine Notice:</strong> Your website is technically available for search engines. Search engines decide independently whether and how it appears in search results.
              </div>

              {/* SEO Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  SEO Meta Title
                </label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="e.g. Cafe Mumbai — Organic Coffee & Artisan Pastries"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium"
                />
                <p className="text-[10px] text-slate-400">
                  Appears in search engine results and browser tabs. Recommended length: 50-60 characters.
                </p>
              </div>

              {/* Meta Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Meta Description
                </label>
                <textarea
                  rows={3}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="e.g. Order fresh artisan coffee, view our breakfast menu, and reserve your table online at Cafe Mumbai."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium resize-none"
                />
                <p className="text-[10px] text-slate-400">
                  Summarizes page content in search engine results snippet. Recommended length: 120-160 characters.
                </p>
              </div>

              {/* Social Preview Image (OG Image) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Social Card Preview Image (OG Image)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={ogImage}
                    onChange={(e) => setOgImage(e.target.value)}
                    placeholder="https://example.com/og-preview.png"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-mono"
                  />
                  <label className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors">
                    <Upload size={14} />
                    <span>{uploadingImage ? "Uploading…" : "Upload"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "og")}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Favicon URL */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Custom Favicon URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={favicon}
                    onChange={(e) => setFavicon(e.target.value)}
                    placeholder="https://example.com/favicon.ico"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-mono"
                  />
                  <label className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors">
                    <Upload size={14} />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/x-icon,image/png,image/svg+xml"
                      onChange={(e) => handleImageUpload(e, "favicon")}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={savingSeo}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all"
                >
                  {savingSeo && <RefreshCw size={14} className="animate-spin" />}
                  <span>Save SEO Settings</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      <ConfirmModal
        isOpen={deleteDomainConfirm.isOpen}
        onClose={() => setDeleteDomainConfirm({ isOpen: false, id: "", name: "" })}
        onConfirm={confirmDeleteDomain}
        title="Disconnect Domain?"
        message={`Are you sure you want to disconnect "${deleteDomainConfirm.name}" from this site?`}
        confirmText="Disconnect Domain"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
