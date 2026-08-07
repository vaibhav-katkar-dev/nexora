# Element-Level Click-to-Inspect in Visual Editor

## Goal
When clicking any element (image, text, block/card) inside a section on the visual canvas, auto-open the Inspector, highlight the exact clicked element, and focus/scroll to its matching inspector field — safely, with no data/API/feature changes.

## Steps
- [x] 1. globals.css — Add element highlight/pulse/flash CSS classes
- [x] 2. lib/elementKeys.ts — Add `humanizeElementKey()` helper
- [x] 3. SiteRenderer.tsx — Add element-key tagging + element click props
- [x] 4. CanvasPreview.tsx — Element highlight effect + prop wiring
- [x] 5. SectionInspectorPanel.tsx — Field path tagging, auto-scroll/flash, editing banner
- [x] 6. editor/[id]/page.tsx — selectedElementKey state + prop wiring
- [ ] 7. Build & verify (web typecheck)
- [ ] 8. Commit & push

