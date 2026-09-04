"use client";

import React from "react";
import type { Section, SiteTheme } from "@ai-platform/shared";
import { getCustomTemplate } from "./customTemplateRegistry";
// Ensure templates are registered
import "./index";

interface CustomTemplateRendererProps {
  section: Section;
  theme: SiteTheme;
  selectedElementKey?: string | null;
  interactive?: boolean;
  onSelectElement?: (elementKey: string, sectionId: string) => void;
  onRequestImageEdit?: (sectionId: string, elementKey: string) => void;
}

export function CustomTemplateRenderer({
  section,
  theme,
  selectedElementKey,
  interactive,
  onSelectElement,
  onRequestImageEdit,
}: CustomTemplateRendererProps) {
  const templateId =
    section.content?.templateId ||
    (section as any).templateId ||
    section.variant ||
    "noir-premium";

  const templateDef = getCustomTemplate(templateId) || getCustomTemplate("noir-premium");

  if (!templateDef) {
    return (
      <div className="p-8 text-center text-slate-400 border border-dashed border-slate-700 rounded-xl my-4">
        <p className="font-bold text-sm">Custom Template: {templateId}</p>
        <p className="text-xs text-slate-500 mt-1">No renderer registered for this template ID.</p>
      </div>
    );
  }

  const RendererComponent = templateDef.renderer;
  const templateData = section.content?.data || section.content || templateDef.defaultData;

  return (
    <RendererComponent
      section={section}
      theme={theme}
      data={templateData}
      selectedElementKey={selectedElementKey}
      interactive={interactive}
      onSelectElement={onSelectElement}
      onRequestImageEdit={onRequestImageEdit}
    />
  );
}
