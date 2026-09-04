import { registerCustomTemplate } from "./customTemplateRegistry";
import { noirPremiumSchema, defaultNoirPremiumData } from "./schemas/noirPremiumSchema";
import { NoirPremiumTemplate } from "./templates/NoirPremiumTemplate";

// Auto-register Noir Premium template into customTemplateRegistry
registerCustomTemplate({
  id: "noir-premium",
  name: "Noir Bio — Premium Link in Bio",
  description: "A single-page, single-section premium link-in-bio with glowing avatar, stats, curated links, mini gallery and socials.",
  schema: noirPremiumSchema,
  defaultData: defaultNoirPremiumData,
  renderer: NoirPremiumTemplate,
});

export * from "./customTemplateRegistry";
export * from "./schemas/noirPremiumSchema";
export * from "./templates/NoirPremiumTemplate";
