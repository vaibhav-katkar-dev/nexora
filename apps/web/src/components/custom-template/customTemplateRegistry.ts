import React from "react";
import type { Section, SiteTheme } from "@ai-platform/shared";

/**
 * Field definition types for custom templates
 */
export type CustomTemplateFieldType =
  | "text"
  | "textarea"
  | "image"
  | "url"
  | "stats-array"
  | "links-array"
  | "gallery-array"
  | "socials-object";

export interface CustomTemplateFieldDef {
  key: string;
  label: string;
  type: CustomTemplateFieldType;
  placeholder?: string;
  description?: string;
  default?: any;
}

export interface CustomTemplateSchemaGroup {
  groupName: string;
  description?: string;
  fields: CustomTemplateFieldDef[];
}

export interface CustomTemplateDefinition<T = any> {
  id: string;
  name: string;
  description: string;
  schema: CustomTemplateSchemaGroup[];
  defaultData: T;
  renderer: React.ComponentType<{
    section: Section;
    theme: SiteTheme;
    data: T;
    selectedElementKey?: string | null;
    interactive?: boolean;
    onSelectElement?: (elementKey: string, sectionId: string) => void;
    onRequestImageEdit?: (sectionId: string, elementKey: string) => void;
  }>;
}

/**
 * Registry storing all custom templates.
 * Add-only: New custom templates register here without altering existing native sections.
 */
export const customTemplateRegistry: Record<string, CustomTemplateDefinition<any>> = {};

export function registerCustomTemplate<T>(template: CustomTemplateDefinition<T>) {
  customTemplateRegistry[template.id] = template;
}

export function getCustomTemplate(templateId: string): CustomTemplateDefinition<any> | undefined {
  return customTemplateRegistry[templateId];
}
