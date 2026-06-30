# UI Renovation — ShadcnUI + Tailwind v4

## Summary

This branch (`feat/ui-renovation`) applies a visual redesign to the A4 imposition application, adopting the ShadcnUI dark theme with `slate` base color and Tailwind CSS v4.

## Main changes

### Foundation

- **Tailwind CSS v4** configured in `packages/ui` with CSS-based theme (`@import "tailwindcss"`, `@theme`).
- **ShadcnUI dark slate theme** in `packages/ui/src/styles/globals.css`.
- Shadcn base components created in `packages/ui/src/components/ui/`:
  - `button`, `input`, `label`, `slider`, `switch`, `tooltip`, `context-menu`, `separator`.
- `cn()` utility created in `packages/ui/src/lib/utils.ts`.
- Bundler configuration:
  - **Web (Vite):** `@tailwindcss/vite` plugin.
  - **Electron (webpack):** `postcss-loader` + `@tailwindcss/postcss`.

### Store and model

- Removed `visibleInSheet` field — visibility is now controlled by `copies === 0`.
- New `removeFromList(id)` action — permanently removes item.
- `sendToBack(id)` / `bringToFront(id)` actions — reorder layers.
- `alignCenter(id, axis)` — centers horizontally/vertically on the page.
- `setInteractiveGrid(enabled)` — toggles visual grid and snapping.
- `setCanvasZoom(zoom)` / `setCanvasPan(pan)` / `resetCanvasView()` — zoom/pan.
- `pageMarginMm` — global page margin applied to new items and auto-place.

### Sidebar and listing

- Drag-and-drop upload with styled area (no "+ Add New Image" button).
- Redesigned `ItemCard` with copy controls (+/-) and trash button.
- "Page margin (mm)" field with explanatory tooltip.
- Simplified `StatsCard` (stats bar with only count and utilization).

### Toolbar

- Header with file name and "Remove" / "Reset Position" buttons.
- Editable width/height fields.
- Rotation with numeric input + synchronized slider.
- Help tooltips ("Rotation in degrees", "Minimum space around item").
- Per-item editable margin (inherits from page margin by default).

### Canvas

- Visual grid (lines every 10mm) with "Grid" toggle at the top.
- Snapping with dashed guide lines during drag.
- Context menu on items: Duplicate, Rotate 90°, Send to Back, Bring to Front, Align Center, Remove from list.
- Zoom HUD in the bottom-left corner.
- "Sheet Summary" gauge in the bottom-right corner.
- Pan with left/middle click on empty area; vertical scroll without Ctrl.
- Zoom with Ctrl + scroll.

### Makefile

- `make dev` / `make electron` / `make build-web` / `make build-electron` / `make lint`

## Bug fixes

- Image rotation in PDF: angle negated (`-rotation`) to align CSS × PDF direction.
- Vertical scroll added for navigation when zoom > 100%.
- Visual grid fixed to use pure white with gray lines.

## Validation

- `npm run build -w packages/web` ✅
- `npm run build:renderer -w packages/electron` ✅
- `npm run lint` ✅

## Possible next steps

- Add keyboard shortcuts for frequent actions.
- Migrate remaining icons from `react-icons` to `lucide-react`.
