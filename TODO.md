# TODO: Per-Element Custom Color in Visual Editor

## Goal
In the visual editor, when any text/element is selected via click-to-inspect, show a "Custom Color" option. Clicking it opens a color popup (swatches + native picker + hex input + reset). The chosen color is applied to that exact element in both the editor and the published site. All existing editor functionality stays intact.

## Steps
- [x] 1. Analyze editor rendering (SiteRenderer, SectionInspectorPanel, editorStore, shared schema, globals, editor page)
- [x] 2. Create plan and get approval
- [x] 3. Add `elementColors` field to `SectionSchema` in `packages/shared/src/index.ts`
- [x] 4. Add per-element "Custom Color" popup block to `SectionInspectorPanel.tsx`
- [x] 5. Generate section-scoped element-color CSS in `SiteRenderer.tsx` (editor + published)
- [x] 6. Type-check / build the web app and verify visually
