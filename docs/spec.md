# Spec: Lightweight Code Canvas for Social Media Images

## 1. Vision & Scope
- Purpose: A simple, fast web canvas to compose export-ready images featuring code blocks, text, and arrows with customizable backgrounds.
- Success Criteria: Create and export high-quality visuals in under 2 minutes, without complex design steps.
- Out of Scope (initial): Slides, animations/video, multi-user collaboration, online sharing/embedding, AI features.

## 2. Target Users & Jobs
- Developer/content creator: Creates quick, branded code images for X/LinkedIn/Instagram.
- Educator: Highlights parts of code with arrows and captions.
- OSS maintainer: Shares release notes with styled code examples.

## 3. Core User Flows
1) Start a new canvas → pick aspect ratio → set background → add code block → add text → add arrows → export PNG/JPEG.
2) Highlight lines in code to focus attention.

## 4. Functional Requirements

### 4.1 Canvas & Layout
- Create canvas with selectable aspect ratios: 1080x1080 (Square), 1920x1080 (16:9), 1600x900 (16:9), 1200x627 (LinkedIn), 1080x1350 (Portrait), 1080x1920 (Story), custom.
- Safe area guides & snapping lines for alignment.
- Grid overlay toggle and configurable spacing.
- Zoom in/out (25%–400%) and pan.

### 4.2 Backgrounds
- Solid color (picker + hex), gradient presets, custom gradient.
- Optional brand strip (top/bottom) with color.

### 4.3 Elements
- Element types: Code Block, Text, Arrow.
- Common element actions: add, select, move, resize, rotate, duplicate, delete, bring to front/back, lock, hide.
- Layers panel: reorder, lock, visibility toggles.

#### 4.3.1 Code Block
- Paste/edit code inline.
- Syntax highlighting with selectable themes (e.g., light/dark). Supported languages: Kotlin, Java, extensible.
- Font family selection (e.g., Fira Code, JetBrains Mono), size, line height.
- Optional line numbers.
- Highlight line ranges and single lines; mark as “added” or “removed” styling.
- Indentation width and tab/space display.
- Padding, corner radius, drop shadow.

#### 4.3.2 Text
- Rich text minimal: bold/italic/underline, color, size, line spacing, alignment.
- Font family selection (brand fonts if available).
- Background fill, padding, corner radius, drop shadow.

#### 4.3.3 Arrow
- Styles: straight, curved.
- Properties: color, thickness, arrowhead style (filled/outline), start/end caps.
- Waypoints for curved arrows (2–3 control points).
- Optional text label attached to arrow.

### 4.4 Selection & Snapping
- Smart guides for center/edge alignment and spacing.
- Magnetic snapping to guides and grid.
- Nudge via arrow keys; modifiers for 1px/10px increments.

### 4.5 Export
- Formats: PNG and JPEG.
- Resolution: scale factor 1x/2x/3x; max 4096px on longest edge.
- Export metadata: remember last export settings.

### 4.6 Persistence
- Local storage autosave per snap.
- Import/export snap as JSON file.
- Open recent snaps list.

### 4.7 Shortcuts
- New snap: Cmd+N; Duplicate: Cmd+D; Delete: Backspace.
- Undo/Redo: Cmd+Z / Shift+Cmd+Z.
- Copy/Paste: Cmd+C / Cmd+V.
- Group/Ungroup: Cmd+G / Shift+Cmd+G.
- Toggle grid: Cmd+; Zoom: Cmd+Plus / Cmd+Minus.

### 4.8 Settings
- Global defaults: theme, default fonts, line numbers on/off, grid spacing.
- Language detection (best-effort) for code block from pasted content.


## 6. Data Model (JSON Schema – indicative)
```json
{
  "version": "1.0.0",
  "meta": {"title": "My Snap", "aspect": "16:9", "width": 1920, "height": 1080},
  "background": {
    "type": "solid|gradient|image",
    "solid": {"color": "#101022"},
    "gradient": {"from": "#101022", "to": "#1f1f3a", "angle": 45},
    "image": {"src": "data:url|path", "scale": 1, "x": 0, "y": 0, "blur": 0, "opacity": 1}
  },
  "elements": [
    {
      "id": "el_1",
      "type": "code",
      "x": 200, "y": 180, "width": 800, "height": 420, "rotation": 0,
      "props": {
        "code": "console.log('Hello');",
        "language": "javascript",
        "theme": "dark",
        "fontFamily": "JetBrains Mono",
        "fontSize": 16,
        "lineHeight": 1.4,
        "lineNumbers": true,
        "highlights": [{"from": 2, "to": 3, "style": "focus"}],
        "padding": 24,
        "cornerRadius": 12,
        "shadow": {"blur": 24, "spread": 0, "color": "#00000066"}
      }
    },
    {
      "id": "el_2",
      "type": "text",
      "x": 1040, "y": 180, "rotation": 0,
      "props": {
        "text": "How it works",
        "fontFamily": "Inter",
        "fontSize": 24,
        "color": "#ffffff",
        "bold": true,
        "align": "left",
        "background": {"color": "#00000033"},
        "padding": 8,
        "cornerRadius": 8
      }
    },
    {
      "id": "el_3",
      "type": "arrow",
      "points": [{"x": 980, "y": 220}, {"x": 880, "y": 260}],
      "props": {
        "style": "straight",
        "color": "#60a5fa",
        "thickness": 3,
        "head": "filled"
      }
    }
  ]
}
```

## 7. UI Layout
- Top Bar: New/Open, aspect ratio, background settings, export button.
- Left Toolbar: element add (Code/Text/Arrow), move/rotate tools, grid toggle.
- Right Inspector: context panel showing properties for selected element; canvas settings when none selected.
- Bottom Bar: zoom, canvas size, snap guides toggle.
- Canvas: center stage with safe area and grid.

## 8. Tech Stack Assumptions (modifiable)
- Frontend: React + TypeScript, Vite.
- Canvas: React Konva (Konva.js) for performant transforms and export to image.
- Syntax highlighting: Shiki (serverless, on-the-fly) or Prism.js; pre-bundled themes.
- State: Zustand (simple, fast) + Immer.
- Persistence: LocalStorage for autosave; file import/export for JSON.
- Export: Konva stage to `toDataURL()`; optional `html-to-image` for mixed DOM.
- Styling: Tailwind CSS or minimal CSS modules.

## 9. Milestones
- M1 (MVP, 1–2 weeks): Canvas, add/move/resize elements; backgrounds; basic code highlighting; text; arrows; PNG/JPEG export; local autosave.
- M2: Grid/safe guides, snapping, line numbers & highlights; themes; shortcuts.
- M3: Layers panel, curved arrows, brand strip, custom fonts.
- M4: Import/export JSON; recent snaps; performance polish.

## 10. Acceptance Criteria (samples)
- Export: Given a 1920x1080 canvas with 3 elements, exporting PNG at 2x produces a 3840x2160 image in < 1s with correct positioning and anti-aliased edges.
- Code Block: Pasting TypeScript auto-detects TS and renders highlighting; toggling line numbers updates instantly; highlighting lines 3–5 changes their background.
- Arrow: Changing thickness updates rendering at 60fps while dragging; arrowhead style persists to export.
- Persistence: Closing and reopening restores last snap state within 1s.

## 11. Accessibility & Internationalization
- Keyboard operations for select/move/resize; screen-reader labels on buttons.
- Localizable UI strings; default English.

## 12. Risks & Open Questions
- Font licensing for bundled fonts (JetBrains Mono, Inter).
- Shiki bundle size vs Prism performance and theme parity.
- Very large exports (>4096px) may be slow; consider worker-based rasterization.
- How many languages/themes to ship in MVP?

## 13. Future Enhancements (post-MVP)
- Templates, brand profiles, watermark/avatars.
- Line diff (add/remove styles), blur/opacity regions.
- Drag-to-connect anchors for arrows.
- SVG export, batch export.
- VS Code extension to send selection → canvas.

---
Owner assumptions are placeholders. Please mark any sections to adjust (features, stack, constraints), and we’ll refine before implementation.