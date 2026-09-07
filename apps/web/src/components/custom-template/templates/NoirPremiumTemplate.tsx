"use client";

import React, { useState } from "react";
import type { Section, SiteTheme } from "@ai-platform/shared";
import { NoirPremiumData, defaultNoirPremiumData } from "../schemas/noirPremiumSchema";
import { Camera, ExternalLink, ArrowRight, CheckCircle2 } from "lucide-react";

interface NoirPremiumTemplateProps {
  section: Section;
  theme: SiteTheme;
  data?: NoirPremiumData;
  selectedElementKey?: string | null;
  interactive?: boolean;
  onSelectElement?: (elementKey: string, sectionId: string) => void;
  onRequestImageEdit?: (sectionId: string, elementKey: string) => void;
}

export function NoirPremiumTemplate({
  section,
  theme,
  data: incomingData,
  selectedElementKey,
  interactive,
  onSelectElement,
  onRequestImageEdit,
}: NoirPremiumTemplateProps) {
  // Graceful fallback to default data or section.content.data
  const data: NoirPremiumData = {
    ...defaultNoirPremiumData,
    ...(incomingData || section.content?.data || section.content || {}),
    profile: {
      ...defaultNoirPremiumData.profile,
      ...((incomingData || section.content?.data || section.content || {}).profile || {}),
    },
    socials: {
      ...defaultNoirPremiumData.socials,
      ...((incomingData || section.content?.data || section.content || {}).socials || {}),
    },
  };

  const [clickedIdx, setClickedIdx] = useState<number | null>(null);

  const sel = (key: string, baseClass: string = "") => {
    if (!interactive) return baseClass ? { className: baseClass } : {};
    const fullKey = `content.data.${key}`;
    const isSelected =
      selectedElementKey === fullKey ||
      selectedElementKey === key ||
      (selectedElementKey &&
        selectedElementKey.replace(/^content\./, "") === fullKey.replace(/^content\./, ""));
    const ringClass = isSelected
      ? "ring-2 ring-indigo-500 rounded-lg outline-none shadow-lg shadow-indigo-500/25"
      : "hover:outline hover:outline-1 hover:outline-indigo-400/50 cursor-pointer";
    return {
      "data-element-key": fullKey,
      "data-element-id": `${section.id}__${fullKey}`,
      "data-section-id": section.id,
      "data-selectable": "true",
      "data-selected": isSelected ? "true" : "false",
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelectElement?.(fullKey, section.id);
      },
      className: `${baseClass} ${ringClass}`.trim(),
    };
  };

  const handleLinkClick = (i: number, url: string, e: React.MouseEvent) => {
    if (interactive) {
      e.preventDefault();
      onSelectElement?.(`content.data.links.${i}`, section.id);
      return;
    }
    setClickedIdx(i);
    setTimeout(() => setClickedIdx(null), 1500);
  };

  const stats = Array.isArray(data.stats) ? data.stats : defaultNoirPremiumData.stats;
  const links = Array.isArray(data.links) ? data.links : defaultNoirPremiumData.links;
  const gallery = Array.isArray(data.gallery) ? data.gallery : defaultNoirPremiumData.gallery;
  const socials = data.socials || defaultNoirPremiumData.socials;

  return (
    <div className="tpl-noir-bio-premium" id={section.id} data-section-id={section.id}>
      {/* Dynamic Scoped CSS for Noir Premium animations and responsive styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .tpl-noir-bio-premium {
            --gold: #E8C77E;
            --violet: #9B8CFB;
            --rose: #F6A8C7;
            --panel: rgba(255,255,255,0.045);
            --border: rgba(255,255,255,0.10);
            position: relative;
            width: 100%;
            min-height: 100vh;
            overflow: hidden;
            padding: clamp(2.5rem, 6vw, 5rem) 1.25rem 4rem;
            background: radial-gradient(circle at 15% 0%, #1B1530 0%, #0A0A12 50%, #050507 100%);
            color: #F5F3FF;
            font-family: 'Inter', system-ui, sans-serif;
            display: flex;
            justify-content: center;
            box-sizing: border-box;
          }
          .tpl-noir-bio-premium * { box-sizing: border-box; }
          .tpl-noir-bio-premium__bg {
            position: absolute;
            inset: -10%;
            z-index: 0;
            pointer-events: none;
          }
          .tpl-nb-orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(70px);
            opacity: 0.32;
            will-change: transform;
          }
          .tpl-nb-orb--1 { width: 380px; height: 380px; top: 2%; left: 6%; background: var(--violet); animation: tplNbFloat1 16s ease-in-out infinite; }
          .tpl-nb-orb--2 { width: 320px; height: 320px; top: 40%; right: 4%; background: var(--gold); opacity: 0.22; animation: tplNbFloat2 20s ease-in-out infinite; }
          .tpl-nb-orb--3 { width: 300px; height: 300px; bottom: 4%; left: 30%; background: var(--rose); opacity: 0.2; animation: tplNbFloat3 24s ease-in-out infinite; }
          .tpl-nb-grain {
            position: absolute;
            inset: 0;
            background-image: radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px);
            background-size: 3px 3px;
            opacity: 0.5;
          }
          @keyframes tplNbFloat1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,50px) scale(1.12); } }
          @keyframes tplNbFloat2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-45px,-25px) scale(0.94); } }
          @keyframes tplNbFloat3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,-35px) scale(1.08); } }

          .tpl-nb-shell {
            position: relative;
            z-index: 1;
            width: 100%;
            max-width: 480px;
            display: flex;
            flex-direction: column;
            gap: 2.2rem;
          }
          .tpl-nb-hero { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.65rem; }
          .tpl-nb-badge {
            font-size: 0.75rem; letter-spacing: 0.04em; padding: 0.4rem 0.85rem;
            border-radius: 999px; background: rgba(232,199,126,0.12);
            border: 1px solid rgba(232,199,126,0.35); color: var(--gold); margin-bottom: 0.4rem;
            display: inline-block;
          }
          .tpl-nb-avatar-frame { position: relative; width: 116px; height: 116px; margin-bottom: 0.4rem; }
          .tpl-nb-avatar-ring {
            position: absolute; inset: -6px; border-radius: 50%;
            background: conic-gradient(from 0deg, var(--violet), var(--gold), var(--rose), var(--violet));
            animation: tplNbSpin 7s linear infinite;
          }
          @keyframes tplNbSpin { to { transform: rotate(360deg); } }
          .tpl-nb-avatar {
            position: relative; z-index: 1; width: 100%; height: 100%; border-radius: 50%;
            object-fit: cover; display: block; border: 3px solid #0A0A12;
          }
          .tpl-nb-name {
            font-family: 'Outfit', 'Inter', sans-serif; font-size: 1.95rem; font-weight: 700; margin: 0.1rem 0 0;
            background: linear-gradient(135deg, #fff, #D8CFFB);
            -webkit-background-clip: text; background-clip: text; color: transparent;
          }
          .tpl-nb-role { color: var(--violet); font-weight: 500; margin: 0; font-size: 0.95rem; }
          .tpl-nb-bio { color: rgba(245,243,255,0.68); line-height: 1.6; font-size: 0.9rem; max-width: 36ch; margin: 0.2rem 0 0; }

          .tpl-nb-stats { display: flex; gap: 1.6rem; margin-top: 0.8rem; padding-top: 1.1rem; border-top: 1px solid var(--border); width: 100%; justify-content: center; }
          .tpl-nb-stat { display: flex; flex-direction: column; align-items: center; }
          .tpl-nb-stat strong { font-size: 1.15rem; color: #fff; }
          .tpl-nb-stat span { font-size: 0.68rem; color: rgba(245,243,255,0.5); text-transform: uppercase; letter-spacing: 0.05em; }

          .tpl-nb-links { display: flex; flex-direction: column; gap: 0.75rem; }
          .tpl-nb-link {
            position: relative; display: flex; align-items: center; gap: 0.85rem;
            padding: 0.9rem 1.1rem; border-radius: 16px;
            background: var(--panel); border: 1px solid var(--border);
            backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
            color: #F5F3FF; text-decoration: none; overflow: hidden;
            transition: transform 0.22s ease, border-color 0.22s ease, background 0.22s ease;
          }
          .tpl-nb-link:hover { transform: translateY(-2px); border-color: rgba(255,255,255,0.25); background: rgba(255,255,255,0.07); }
          .tpl-nb-link-icon {
            width: 34px; height: 34px; flex-shrink: 0; border-radius: 10px;
            display: flex; align-items: center; justify-content: center;
            background: rgba(255,255,255,0.07); font-size: 0.95rem;
          }
          .tpl-nb-link-text { flex: 1; display: flex; flex-direction: column; min-width: 0; text-align: left; }
          .tpl-nb-link-label { font-size: 0.92rem; font-weight: 600; color: #fff; }
          .tpl-nb-link-sub { font-size: 0.72rem; color: rgba(245,243,255,0.5); margin-top: 2px; }
          .tpl-nb-link--featured {
            background: linear-gradient(135deg, rgba(155,140,251,0.18), rgba(232,199,126,0.14));
            border-color: rgba(232,199,126,0.4);
          }
          .tpl-nb-link-badge {
            font-size: 0.62rem; letter-spacing: 0.05em; font-weight: 700;
            padding: 0.25rem 0.55rem; border-radius: 999px;
            background: var(--gold); color: #191207;
          }

          .tpl-nb-section-title {
            font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em;
            color: rgba(245,243,255,0.45); margin: 0 0 0.75rem;
          }
          .tpl-nb-gallery-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
          .tpl-nb-gallery-item {
            position: relative; width: 100%; aspect-ratio: 1 / 1; border-radius: 14px;
            overflow: hidden; border: 1px solid var(--border); transition: transform 0.3s ease;
          }
          .tpl-nb-gallery-item:hover { transform: scale(1.02); }
          .tpl-nb-gallery-item img { width: 100%; height: 100%; object-fit: cover; }

          .tpl-nb-socials { display: flex; justify-content: center; gap: 0.9rem; }
          .tpl-nb-socials a {
            width: 42px; height: 42px; border-radius: 50%; display: flex;
            align-items: center; justify-content: center; text-decoration: none;
            color: #F5F3FF; background: var(--panel); border: 1px solid var(--border);
            font-size: 0.85rem; font-weight: 600; transition: transform 0.2s ease, border-color 0.2s ease;
          }
          .tpl-nb-socials a:hover { transform: translateY(-2px); border-color: var(--gold); color: var(--gold); }
          .tpl-nb-footer { text-align: center; color: rgba(245,243,255,0.4); font-size: 0.78rem; }
        `,
      }} />

      {/* Ambient background particles */}
      <div className="tpl-noir-bio-premium__bg" aria-hidden="true">
        <span className="tpl-nb-orb tpl-nb-orb--1" />
        <span className="tpl-nb-orb tpl-nb-orb--2" />
        <span className="tpl-nb-orb tpl-nb-orb--3" />
        <span className="tpl-nb-grain" />
      </div>

      <div className="tpl-nb-shell">
        {/* HERO SECTION */}
        <header className="tpl-nb-hero">
          {data.badge && (
            <span {...sel("badge", "tpl-nb-badge")}>
              {data.badge}
            </span>
          )}

          <div className="tpl-nb-avatar-frame">
            <span className="tpl-nb-avatar-ring" aria-hidden="true" />
            {data.profile?.avatar ? (
              <img
                {...sel("profile.avatar", "tpl-nb-avatar cursor-pointer")}
                src={data.profile.avatar}
                alt={data.profile.name || "Avatar"}
                onClick={(e) => {
                  if (interactive) {
                    e.stopPropagation();
                    onSelectElement?.("content.data.profile.avatar", section.id);
                    onRequestImageEdit?.(section.id, "content.data.profile.avatar");
                  }
                }}
              />
            ) : (
              <div
                {...sel("profile.avatar", "tpl-nb-avatar bg-slate-900 flex items-center justify-center cursor-pointer")}
                onClick={(e) => {
                  if (interactive) {
                    e.stopPropagation();
                    onSelectElement?.("content.data.profile.avatar", section.id);
                    onRequestImageEdit?.(section.id, "content.data.profile.avatar");
                  }
                }}
              >
                <Camera size={24} className="text-indigo-400 opacity-80" />
              </div>
            )}
          </div>

          <h1 {...sel("profile.name", "tpl-nb-name")}>
            {data.profile?.name}
          </h1>

          {data.profile?.role && (
            <p {...sel("profile.role", "tpl-nb-role")}>
              {data.profile.role}
            </p>
          )}

          {data.profile?.bio && (
            <p {...sel("profile.bio", "tpl-nb-bio")}>
              {data.profile.bio}
            </p>
          )}

          {stats.length > 0 && (
            <div className="tpl-nb-stats">
              {stats.map((stat, idx) => (
                <div key={idx} {...sel(`stats.${idx}`, "tpl-nb-stat")}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          )}
        </header>

        {/* CURATED LINKS */}
        {links.length > 0 && (
          <div className="tpl-nb-links">
            {links.map((link, idx) => {
              const isClicked = clickedIdx === idx;
              return (
                <a
                  key={idx}
                  {...sel(`links.${idx}`, `tpl-nb-link ${link.featured ? "tpl-nb-link--featured" : ""}`)}
                  href={interactive ? "#" : link.url || "#"}
                  onClick={(e) => handleLinkClick(idx, link.url, e)}
                  target={interactive ? undefined : "_blank"}
                  rel="noopener noreferrer"
                >
                  <span className="tpl-nb-link-icon">
                    {link.icon || "✦"}
                  </span>
                  <span className="tpl-nb-link-text">
                    <span className="tpl-nb-link-label">{link.label}</span>
                    {link.sub && <span className="tpl-nb-link-sub">{link.sub}</span>}
                  </span>
                  {link.badge && (
                    <span className="tpl-nb-link-badge">{link.badge}</span>
                  )}
                  {isClicked ? (
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  ) : (
                    <span className="text-xs opacity-50">→</span>
                  )}
                </a>
              );
            })}
          </div>
        )}

        {/* MINI GALLERY */}
        {gallery.length > 0 && (
          <div className="tpl-nb-gallery">
            <p className="tpl-nb-section-title">Latest Frames</p>
            <div className="tpl-nb-gallery-grid">
              {gallery.map((item, idx) => (
                <div
                  key={idx}
                  {...sel(`gallery.${idx}`, "tpl-nb-gallery-item group cursor-pointer")}
                  onClick={(e) => {
                    if (interactive) {
                      e.stopPropagation();
                      onSelectElement?.(`content.data.gallery.${idx}.url`, section.id);
                      onRequestImageEdit?.(section.id, `content.data.gallery.${idx}.url`);
                    }
                  }}
                >
                  {item.url ? (
                    <img src={item.url} alt={item.alt || `Photo ${idx + 1}`} loading="lazy" />
                  ) : (
                    <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                      <Camera size={20} className="text-slate-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SOCIAL LINKS */}
        <div className="tpl-nb-socials">
          {socials.instagram && (
            <a
              {...sel("socials.instagram")}
              href={interactive ? "#" : socials.instagram}
              target={interactive ? undefined : "_blank"}
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              ◎
            </a>
          )}
          {socials.twitter && (
            <a
              {...sel("socials.twitter")}
              href={interactive ? "#" : socials.twitter}
              target={interactive ? undefined : "_blank"}
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              ✕
            </a>
          )}
          {socials.youtube && (
            <a
              {...sel("socials.youtube")}
              href={interactive ? "#" : socials.youtube}
              target={interactive ? undefined : "_blank"}
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              ▶
            </a>
          )}
          {socials.linkedin && (
            <a
              {...sel("socials.linkedin")}
              href={interactive ? "#" : socials.linkedin}
              target={interactive ? undefined : "_blank"}
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              in
            </a>
          )}
        </div>

        {/* FOOTER */}
        {data.footerText && (
          <footer {...sel("footerText", "tpl-nb-footer")}>
            <p>{data.footerText}</p>
          </footer>
        )}
      </div>
    </div>
  );
}
