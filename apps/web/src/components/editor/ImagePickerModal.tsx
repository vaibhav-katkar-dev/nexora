"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { X, Image as ImageIcon, Upload, Search, Check, Sparkles, Loader2, Trash2, FolderOpen } from "lucide-react";
import { mediaApi } from "@/lib/api";
import { useEditorStore } from "@/store/editorStore";

interface ImagePickerModalProps {
  currentUrl: string;
  onSelect: (url: string) => void;
  onClose: () => void;
}

type Tab = "upload" | "library" | "stock" | "url";

const STOCK_IMAGES = [
  { label: "Modern Office", url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80" },
  { label: "Tech Developer", url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80" },
  { label: "Abstract Gradient", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80" },
  { label: "Portrait Studio", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80" },
  { label: "Gourmet Dish", url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80" },
  { label: "Luxury Architecture", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80" },
  { label: "Team Collaboration", url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" },
  { label: "Mountain Landscape", url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80" },
  { label: "City Skyline", url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=800&q=80" },
  { label: "Coffee Shop", url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80" },
  { label: "Creative Studio", url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80" },
  { label: "Medical & Health", url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80" },
];

export function ImagePickerModal({ currentUrl, onSelect, onClose }: ImagePickerModalProps) {
  const [tab, setTab] = useState<Tab>("upload");
  const [urlInput, setUrlInput] = useState(currentUrl);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [libraryItems, setLibraryItems] = useState<any[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [stockSearch, setStockSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { projectId } = useEditorStore();

  // Load library when tab switches to "library"
  useEffect(() => {
    if (tab === "library") {
      setLoadingLibrary(true);
      mediaApi.list()
        .then((res) => setLibraryItems(res.data || []))
        .catch(() => setLibraryItems([]))
        .finally(() => setLoadingLibrary(false));
    }
  }, [tab]);

  /** Compress image in browser using HTML5 Canvas to WebP (max 1200px, 82% quality) */
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1400;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, w, h);
          const compressedDataUrl = canvas.toDataURL("image/webp", 0.82);
          resolve(compressedDataUrl);
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("Only image files are allowed.");
      return;
    }
    setIsUploading(true);
    setUploadError("");
    setUploadSuccess("");

    try {
      // First try backend Cloudinary / S3 upload if connected
      const result = await mediaApi.upload(file, projectId || undefined);
      if (result?.url) {
        setUploadSuccess(result.url);
        onSelect(result.url);
        onClose();
        return;
      }
    } catch {
      // Graceful instant fallback: client-side compressed WebP
    }

    try {
      const compressedDataUrl = await compressImage(file);
      setUploadSuccess(compressedDataUrl);
      onSelect(compressedDataUrl);
      onClose();
    } catch (err: any) {
      setUploadError(err.message || "Failed to process image.");
    } finally {
      setIsUploading(false);
    }
  }, [projectId, onSelect, onClose]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const filteredStock = STOCK_IMAGES.filter(img =>
    img.label.toLowerCase().includes(stockSearch.toLowerCase())
  );

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "upload", label: "Upload", icon: <Upload size={13} /> },
    { id: "library", label: "My Media", icon: <FolderOpen size={13} /> },
    { id: "stock", label: "Stock", icon: <Sparkles size={13} /> },
    { id: "url", label: "URL", icon: <Search size={13} /> },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl max-w-2xl w-full shadow-2xl text-white select-none flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <ImageIcon size={18} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">Media Manager</h3>
              <p className="text-[11px] text-slate-400">Upload to Cloudinary or pick from your library</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 p-3 border-b border-slate-800 bg-slate-950/40">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tab === t.id
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* ─── UPLOAD TAB ─── */}
          {tab === "upload" && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-indigo-500 bg-indigo-950/30 scale-[1.01]"
                    : "border-slate-700 hover:border-indigo-500/60 hover:bg-slate-800/30"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                    e.target.value = "";
                  }}
                />
                {isUploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 size={36} className="text-indigo-400 animate-spin" />
                    <p className="text-sm font-bold text-indigo-300">Uploading to Cloudinary...</p>
                    <p className="text-xs text-slate-400">Auto-optimized to WebP/AVIF</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${isDragging ? "bg-indigo-600/30" : "bg-slate-800"}`}>
                      <Upload size={28} className={isDragging ? "text-indigo-400" : "text-slate-400"} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Drag & drop your image here</p>
                      <p className="text-xs text-slate-400 mt-1">or click to browse files</p>
                    </div>
                    <div className="flex gap-2 text-[10px] font-mono text-slate-500">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">JPG</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">PNG</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">WebP</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">GIF</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">max 5MB</span>
                    </div>
                  </div>
                )}
              </div>

              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-700/40 text-xs text-rose-300 font-semibold">
                  ⚠ {uploadError}
                </div>
              )}
              {uploadSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-700/40 text-xs text-emerald-300 font-semibold flex items-center gap-2">
                  <Check size={14} /> Uploaded and applied successfully!
                </div>
              )}

              <p className="text-[11px] text-slate-500 text-center">
                Images auto-converted to WebP/AVIF and served via Cloudinary CDN
              </p>
            </div>
          )}

          {/* ─── LIBRARY TAB ─── */}
          {tab === "library" && (
            <div className="space-y-3">
              {loadingLibrary ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={24} className="animate-spin text-indigo-400" />
                </div>
              ) : libraryItems.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <FolderOpen size={36} className="mx-auto text-slate-600" />
                  <p className="text-sm text-slate-400 font-semibold">No uploads yet</p>
                  <p className="text-xs text-slate-500">Switch to the Upload tab to add your first image</p>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-slate-500">{libraryItems.length} image{libraryItems.length !== 1 ? "s" : ""} in your library</p>
                  <div className="grid grid-cols-3 gap-3">
                    {libraryItems.map((item: any, i: number) => (
                      <div
                        key={item._id || i}
                        onClick={() => { onSelect(item.url); onClose(); }}
                        className={`group relative h-28 rounded-xl overflow-hidden border cursor-pointer transition-all hover:border-indigo-500 hover:shadow-xl ${
                          currentUrl === item.url ? "border-indigo-500 ring-2 ring-indigo-500/40" : "border-slate-700"
                        }`}
                      >
                        <img src={item.url} alt={item.fileName || "media"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-2">
                          <Check size={18} className="text-white" />
                          <span className="text-[9px] font-bold text-white text-center leading-tight truncate w-full text-center">{item.fileName || "Select"}</span>
                        </div>
                        {currentUrl === item.url && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                            <Check size={11} className="text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ─── STOCK TAB ─── */}
          {tab === "stock" && (
            <div className="space-y-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={stockSearch}
                  onChange={(e) => setStockSearch(e.target.value)}
                  placeholder="Search stock images..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {filteredStock.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => { onSelect(img.url); onClose(); }}
                    className="group relative h-28 rounded-xl overflow-hidden border border-slate-700 hover:border-indigo-500 cursor-pointer transition-all hover:shadow-xl"
                  >
                    <img src={img.url} alt={img.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <span className="text-[10px] font-bold text-white leading-tight">{img.label}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 text-center">Royalty-free images from Unsplash</p>
            </div>
          )}

          {/* ─── URL TAB ─── */}
          {tab === "url" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Paste any image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => { if (urlInput.trim()) { onSelect(urlInput.trim()); onClose(); } }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
              {urlInput && (
                <div className="rounded-xl overflow-hidden border border-slate-700 h-48 bg-slate-950">
                  <img src={urlInput} alt="preview" className="w-full h-full object-contain" onError={(e) => (e.currentTarget.style.display = "none")} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
