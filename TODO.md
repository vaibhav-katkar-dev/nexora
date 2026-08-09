# TODO: Accurate Device Viewport Frames in Visual Editor

## Goal
Make the visual editor's PC / tablet / mobile viewport modes accurately mimic real devices — internal screen scrolling (not full-page scroll) and an authentic Android phone frame for mobile.

## Steps
- [x] 1. Analyze editor rendering (CanvasPreview, SiteRenderer, store, header, globals)
- [x] 2. Create plan and get approval
- [x] 3. Create `DeviceFrame.tsx` device-shell renderer (desktop browser / tablet / Android phone frames with internal scrolling)
- [x] 4. Edit `CanvasPreview.tsx` to use `<DeviceFrame>` and internal screen scrolling
- [x] 5. Edit `SiteRenderer.tsx` to use `minHeight: 100%` in editor/interactive mode (keep `100vh` for published site)
- [x] 5b. Add editor-only vh-layout reset so sections resolve against the device screen (fixes Android misalignment & oversized vh sections)
- [x] 6. Type-check / build the web app and verify visually
