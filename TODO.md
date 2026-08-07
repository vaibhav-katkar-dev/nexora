# TODO — Live Template Previews in Gallery

## Steps
- [x] 1. Wire `TemplateThumbnail` into public gallery (`apps/web/src/app/templates/page.tsx`) — replaced fake "Visual Skeleton Sketch" with live preview + premium marketplace card redesign.
- [x] 2. Wire `TemplateThumbnail` into admin manager (`apps/web/src/app/admin/templates/page.tsx`) — live preview from `defaultConfig`, graceful fallback to `thumbnailUrl`/icon, premium redesign.
- [x] 3. Rewrote `TemplateThumbnail` for premium framing (fills container height, hero visible, GPU-safe transforms, inner depth, no hard crops).
- [x] 4. Type-check completed cleanly; both galleries render live previews.
- [x] 5. Refined public gallery cards to be compact, premium, minimal (Carrd/Framer/Vercel style): 240px preview, glass overlay, removed ratings/tags, side-by-side gradient Use + outlined Preview buttons, 18px radius, soft shadows, gentle hover lift/zoom.
- [x] 6. Public gallery now fetches templates from the backend DB (`templatesApi.list()`) as single source of truth, falling back to bundled presets only when the DB is empty or the API is unreachable. Added loading state.
- [x] 7. Backend `listTemplates` now returns `defaultConfig` (via `ADMIN_LIST_PROJECTION`) so DB templates render live previews in the gallery. Verified admin CRUD (create/update/import/seed/publish) persists to DB via `Template.create()`/`findByIdAndUpdate`.
- [x] 8. Fixed preview scaling: `TemplateThumbnail` now renders the FULL page at a tall poster (560×1200) and uniformly scales it to FIT within both card width AND height (aspect-ratio preserved, no stretch/crop), CENTERED inside the card — miniature live-website look instead of a zoomed/cropped top-anchored view.
- [x] 9. Fixed centering offset bug: corrected `offsetX/offsetY` to `(container - scaled element)/2` (was wrongly dividing by scale, pushing the preview off-screen). Preview now shows correctly centered inside each card.
- [x] 10. Preview now shows FULL WIDTH: scale driven by card width (`scale = cardWidth / RENDER_WIDTH`), top-anchored so navbar + hero are always visible. Aspect ratio preserved; fills the full card width accurately.
- [x] 11. Premium marketplace redesign (Framer/Carrd/Webflow style):
  - Understated header (removed heavy gradient banner) so templates are the focus.
  - Larger 300px preview (≈72% of card), full-width top-anchored, no floating badges, no gradients/glows over preview.
  - Category moved below preview as a subtle uppercase label with icon.
  - Show only: category, name, 2-line description. Buttons reduced to 42px — "Use Template" (solid dark) + "Preview" (outlined).
  - 18px card radius, 1px neutral border, soft shadow only, hover: translateY(-6px) + larger shadow + subtle 1.02 preview scale.
  - Generous spacing (gap-8).
</content>
