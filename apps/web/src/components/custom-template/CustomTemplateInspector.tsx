"use client";

import React, { useState } from "react";
import type { Section } from "@ai-platform/shared";
import { getCustomTemplate } from "./customTemplateRegistry";
import { useEditorStore } from "@/store/editorStore";
import { LinkBuilderModal } from "@/components/editor/LinkBuilderModal";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  X,
  ChevronUp,
  ChevronDown,
  Copy,
  MessageCircle,
  ExternalLink,
  Layers,
} from "lucide-react";

interface CustomTemplateInspectorProps {
  section: Section;
  onOpenImagePicker?: (currentUrl: string, onSelect: (url: string) => void) => void;
}

export function CustomTemplateInspector({
  section,
  onOpenImagePicker,
}: CustomTemplateInspectorProps) {
  const updateSection = useEditorStore((state) => state.updateSection);

  const templateId =
    section.content?.templateId ||
    (section as any).templateId ||
    section.variant ||
    "noir-premium";

  const templateDef = getCustomTemplate(templateId) || getCustomTemplate("noir-premium");

  const [linkModalState, setLinkModalState] = useState<{
    isOpen: boolean;
    currentUrl: string;
    fieldPath: string;
  }>({
    isOpen: false,
    currentUrl: "",
    fieldPath: "",
  });

  const inputClass =
    "w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors shadow-sm";
  const labelClass = "block text-xs font-semibold text-slate-300 mb-1";

  if (!templateDef) {
    return (
      <div className="p-4 text-center text-slate-400 text-xs">
        Custom template definition not found for "{templateId}".
      </div>
    );
  }

  // Current structured data
  const currentData = section.content?.data || section.content || templateDef.defaultData;

  const updateDataField = (path: string, value: any) => {
    const nextData = JSON.parse(JSON.stringify(currentData));
    const parts = path.split(".");

    let cursor = nextData;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!cursor[part]) cursor[part] = {};
      cursor = cursor[part];
    }
    cursor[parts[parts.length - 1]] = value;

    updateSection(section.id, {
      content: {
        ...(section.content || {}),
        templateId,
        data: nextData,
      },
    });
  };

  const getDataField = (path: string): any => {
    const parts = path.split(".");
    let cursor = currentData;
    for (const part of parts) {
      if (!cursor || typeof cursor !== "object") return undefined;
      cursor = cursor[part];
    }
    return cursor;
  };

  const handleSaveLink = (url: string) => {
    if (!linkModalState.fieldPath) return;
    updateDataField(linkModalState.fieldPath, url);
  };

  return (
    <div className="space-y-6">
      {/* Template Badge Header */}
      <div className="p-3 bg-indigo-950/30 border border-indigo-800/40 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-indigo-400" />
          <span className="text-xs font-bold text-indigo-300">{templateDef.name}</span>
        </div>
        <span className="text-[10px] font-mono text-indigo-400/80 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800/60">
          v1.0.1
        </span>
      </div>

      {/* Schema-driven groups */}
      {templateDef.schema.map((group, groupIdx) => (
        <div key={groupIdx} className="space-y-3 pt-3 border-t border-slate-800">
          <div>
            <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
              {group.groupName}
            </h4>
            {group.description && (
              <p className="text-[10px] text-slate-500 mt-0.5">{group.description}</p>
            )}
          </div>

          <div className="space-y-4">
            {group.fields.map((field) => {
              const fieldPath = field.key;
              const val = getDataField(fieldPath);

              // 1. TEXT INPUT
              if (field.type === "text") {
                return (
                  <div key={field.key} data-field-path={`content.data.${field.key}`}>
                    <label className={labelClass}>{field.label}</label>
                    <input
                      type="text"
                      value={val ?? ""}
                      onChange={(e) => updateDataField(field.key, e.target.value)}
                      placeholder={field.placeholder || ""}
                      className={inputClass}
                    />
                  </div>
                );
              }

              // 2. TEXTAREA
              if (field.type === "textarea") {
                return (
                  <div key={field.key} data-field-path={`content.data.${field.key}`}>
                    <label className={labelClass}>{field.label}</label>
                    <textarea
                      rows={3}
                      value={val ?? ""}
                      onChange={(e) => updateDataField(field.key, e.target.value)}
                      placeholder={field.placeholder || ""}
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                );
              }

              // 3. IMAGE
              if (field.type === "image") {
                const imgUrl = String(val || "");
                return (
                  <div key={field.key} data-field-path={`content.data.${field.key}`} className="space-y-1.5">
                    <label className={labelClass}>🖼️ {field.label}</label>
                    {imgUrl ? (
                      <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950 border border-slate-700">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imgUrl}
                            alt={field.label}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </div>
                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                          {onOpenImagePicker && (
                            <button
                              type="button"
                              onClick={() =>
                                onOpenImagePicker(imgUrl, (newUrl) =>
                                  updateDataField(field.key, newUrl)
                                )
                              }
                              className="text-[10px] font-bold text-indigo-300 hover:text-white bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-700/50 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors w-fit"
                            >
                              <ImageIcon size={10} /> Change Image
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => updateDataField(field.key, "")}
                            className="text-[10px] text-slate-500 hover:text-rose-400 px-2 py-1 rounded-lg hover:bg-rose-950/30 border border-transparent hover:border-rose-800/30 flex items-center gap-1 transition-colors w-fit"
                          >
                            <X size={10} /> Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {onOpenImagePicker && (
                          <button
                            type="button"
                            onClick={() =>
                              onOpenImagePicker("", (newUrl) =>
                                updateDataField(field.key, newUrl)
                              )
                            }
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950 hover:bg-indigo-950/20 text-slate-500 hover:text-indigo-300 transition-all cursor-pointer"
                          >
                            <ImageIcon size={14} />
                            <span className="text-[10px] font-bold">Upload {field.label}</span>
                          </button>
                        )}
                        <input
                          type="text"
                          value={imgUrl}
                          onChange={(e) => updateDataField(field.key, e.target.value)}
                          placeholder="Or paste image URL..."
                          className={inputClass}
                        />
                      </div>
                    )}
                  </div>
                );
              }

              // 4. STATS ARRAY
              if (field.type === "stats-array") {
                const stats: Array<{ value: string; label: string }> = Array.isArray(val) ? val : [];
                return (
                  <div key={field.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className={labelClass}>{field.label} ({stats.length})</label>
                      <button
                        type="button"
                        onClick={() => {
                          updateDataField(field.key, [...stats, { value: "10K", label: "Stat Label" }]);
                        }}
                        className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-950/60 border border-indigo-800/40 px-2 py-0.5 rounded-lg flex items-center gap-1"
                      >
                        <Plus size={12} /> Add Stat
                      </button>
                    </div>

                    <div className="space-y-2">
                      {stats.map((stat, idx) => (
                        <div
                          key={idx}
                          data-field-path={`content.data.${field.key}.${idx}`}
                          className="flex items-center gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800"
                        >
                          <input
                            type="text"
                            value={stat.value || ""}
                            onChange={(e) => {
                              const next = [...stats];
                              next[idx] = { ...next[idx], value: e.target.value };
                              updateDataField(field.key, next);
                            }}
                            placeholder="Value (e.g. 10K)"
                            className="w-24 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                          />
                          <input
                            type="text"
                            value={stat.label || ""}
                            onChange={(e) => {
                              const next = [...stats];
                              next[idx] = { ...next[idx], label: e.target.value };
                              updateDataField(field.key, next);
                            }}
                            placeholder="Label (e.g. Followers)"
                            className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const next = stats.filter((_, i) => i !== idx);
                              updateDataField(field.key, next);
                            }}
                            className="p-1 text-slate-500 hover:text-rose-400"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              // 5. LINKS ARRAY (With WhatsApp and Badge integration)
              if (field.type === "links-array") {
                const links: any[] = Array.isArray(val) ? val : [];
                return (
                  <div key={field.key} className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className={labelClass}>{field.label} ({links.length})</label>
                      <button
                        type="button"
                        onClick={() => {
                          updateDataField(field.key, [
                            ...links,
                            {
                              label: "New Link",
                              url: "https://",
                              sub: "",
                              badge: "",
                              icon: "✦",
                            },
                          ]);
                        }}
                        className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-950/60 border border-indigo-800/40 px-2 py-0.5 rounded-lg flex items-center gap-1"
                      >
                        <Plus size={12} /> Add Link
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {links.map((link, idx) => (
                        <div
                          key={idx}
                          data-field-path={`content.data.${field.key}.${idx}`}
                          className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-indigo-300">
                              Link #{idx + 1}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => {
                                  const next = [...links];
                                  const temp = next[idx];
                                  next[idx] = next[idx - 1];
                                  next[idx - 1] = temp;
                                  updateDataField(field.key, next);
                                }}
                                className="p-0.5 text-slate-400 hover:text-white disabled:opacity-20"
                              >
                                <ChevronUp size={12} />
                              </button>
                              <button
                                type="button"
                                disabled={idx === links.length - 1}
                                onClick={() => {
                                  const next = [...links];
                                  const temp = next[idx];
                                  next[idx] = next[idx + 1];
                                  next[idx + 1] = temp;
                                  updateDataField(field.key, next);
                                }}
                                className="p-0.5 text-slate-400 hover:text-white disabled:opacity-20"
                              >
                                <ChevronDown size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const next = links.filter((_, i) => i !== idx);
                                  updateDataField(field.key, next);
                                }}
                                className="p-0.5 text-slate-400 hover:text-rose-400"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          </div>

                          <input
                            type="text"
                            value={link.label || ""}
                            onChange={(e) => {
                              const next = [...links];
                              next[idx] = { ...next[idx], label: e.target.value };
                              updateDataField(field.key, next);
                            }}
                            placeholder="Link Title / Label"
                            className={inputClass}
                          />

                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={link.url || ""}
                              onChange={(e) => {
                                const next = [...links];
                                next[idx] = { ...next[idx], url: e.target.value };
                                updateDataField(field.key, next);
                              }}
                              placeholder="https://... or wa.me/..."
                              className={inputClass}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setLinkModalState({
                                  isOpen: true,
                                  currentUrl: link.url || "",
                                  fieldPath: `${field.key}.${idx}.url`,
                                })
                              }
                              className="px-2.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/60 rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0"
                              title="Configure WhatsApp or URL"
                            >
                              <MessageCircle size={12} /> WhatsApp
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={link.sub || ""}
                              onChange={(e) => {
                                const next = [...links];
                                next[idx] = { ...next[idx], sub: e.target.value };
                                updateDataField(field.key, next);
                              }}
                              placeholder="Subtitle / Note"
                              className={inputClass}
                            />
                            <input
                              type="text"
                              value={link.badge || ""}
                              onChange={(e) => {
                                const next = [...links];
                                next[idx] = { ...next[idx], badge: e.target.value };
                                updateDataField(field.key, next);
                              }}
                              placeholder="Badge (e.g. NEW)"
                              className={inputClass}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              // 6. GALLERY ARRAY
              if (field.type === "gallery-array") {
                const photos: any[] = Array.isArray(val) ? val : [];
                return (
                  <div key={field.key} className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className={labelClass}>{field.label} ({photos.length})</label>
                      <button
                        type="button"
                        onClick={() => {
                          updateDataField(field.key, [
                            ...photos,
                            {
                              url: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=400&q=80",
                              alt: "New Photo",
                            },
                          ]);
                        }}
                        className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-950/60 border border-indigo-800/40 px-2 py-0.5 rounded-lg flex items-center gap-1"
                      >
                        <Plus size={12} /> Add Photo
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {photos.map((item, idx) => (
                        <div
                          key={idx}
                          data-field-path={`content.data.${field.key}.${idx}`}
                          className="p-2 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 relative group"
                        >
                          <div className="w-full aspect-square rounded-lg overflow-hidden bg-slate-900 border border-slate-800 relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.url || ""}
                              alt={item.alt || ""}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const next = photos.filter((_, i) => i !== idx);
                                updateDataField(field.key, next);
                              }}
                              className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-rose-950/80 text-white rounded-md transition-colors"
                              title="Delete Photo"
                            >
                              <X size={12} />
                            </button>
                          </div>

                          {onOpenImagePicker && (
                            <button
                              type="button"
                              onClick={() =>
                                onOpenImagePicker(item.url || "", (newUrl) => {
                                  const next = [...photos];
                                  next[idx] = { ...next[idx], url: newUrl };
                                  updateDataField(field.key, next);
                                })
                              }
                              className="w-full py-1 text-[10px] font-bold text-indigo-300 hover:text-white bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-800/40 rounded flex items-center justify-center gap-1"
                            >
                              <ImageIcon size={10} /> Replace
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              // 7. SOCIALS OBJECT
              if (field.type === "socials-object") {
                const socials: Record<string, string> =
                  typeof val === "object" && val !== null ? val : {};
                const channels = ["instagram", "twitter", "youtube", "linkedin", "email"];

                return (
                  <div key={field.key} className="space-y-2">
                    <label className={labelClass}>{field.label}</label>
                    <div className="space-y-2">
                      {channels.map((chan) => (
                        <div
                          key={chan}
                          data-field-path={`content.data.${field.key}.${chan}`}
                          className="flex items-center gap-2"
                        >
                          <span className="w-20 text-[10px] text-slate-400 capitalize font-medium">
                            {chan}
                          </span>
                          <input
                            type="text"
                            value={socials[chan] || ""}
                            onChange={(e) => {
                              updateDataField(`${field.key}.${chan}`, e.target.value);
                            }}
                            placeholder={
                              chan === "email" ? "mailto:you@example.com" : `https://${chan}.com/...`
                            }
                            className={inputClass}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>
      ))}

      {/* Link and WhatsApp modal reuse */}
      <LinkBuilderModal
        isOpen={linkModalState.isOpen}
        currentUrl={linkModalState.currentUrl}
        onClose={() =>
          setLinkModalState({ isOpen: false, currentUrl: "", fieldPath: "" })
        }
        onSave={handleSaveLink}
      />
    </div>
  );
}
