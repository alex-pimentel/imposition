# Data Model

## Image item

- `id`: unique identifier
- `name`: file name
- `src`: file path or base64 URL
- `naturalWidth` / `naturalHeight`: actual image dimensions
- `widthMm` / `heightMm`: size used in the layout
- `copies`: number of copies
- `x` / `y`: position in the layout in pixels or millimeters
- `rotation`: applied rotation

## Page

- `pageSize`: defaults to A4
- `pageMarginMm`: page-level margin applied during auto placement
- `layoutMode`: manual or automatic
