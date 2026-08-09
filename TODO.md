# Velora Salon Images Fix

## Root Cause
`SiteRenderer.tsx` and `siteCompiler.ts` were missing renderers for the section types
used by the Velora template (`services`, `gallery`, `team`, `testimonials`) and the
hero `avatarUrl`, so their images never rendered.

## Steps
- [x] 1. Add `ServicesSection` renderer + `case "services"` in SiteRenderer.tsx
- [x] 2. Add `GallerySection` renderer (masonry figures + imgs) + `case "gallery"` in SiteRenderer.tsx
- [x] 3. Add `TeamSection` renderer + `case "team"` in SiteRenderer.tsx
- [x] 4. Add `TestimonialsSection` renderer + `case "testimonials"` in SiteRenderer.tsx
- [x] 5. Render hero `content.avatarUrl` in HeroSection (SiteRenderer)
- [x] 6. Add `services`/`gallery`/`team`/`testimonials` cases + hero avatar + CSS in siteCompiler.ts
- [x] 7. TypeScript checks pass (api + web)

## Result
Images now render in both the interactive preview (SiteRenderer) and the
published static site (siteCompiler).
