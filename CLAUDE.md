# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**YvCode** is a lightweight canvas editor for creating export-ready code images for social media. It allows users to compose code blocks, text, arrows, backgrounds, and branding on a customizable canvas, then export as high-quality PNG/JPEG.

**Tech Stack:**
- React 19.2.0 + TypeScript
- Vite (rolldown-vite 7.2.5) as build tool
- Konva 10.0.12 + react-konva 19.2.1 for canvas rendering
- Zustand 5.0.9 for state management with localStorage persistence
- Tailwind CSS v4.1.18 for styling
- Framer Motion 10+ for animations on the landing page
- Radix UI primitives for accessible components

## Common Development Commands

```bash
npm run dev      # Start dev server (http://127.0.0.1:5173)
npm run build    # Type-check with tsc, then build for production
npm run preview  # Preview production build locally (http://127.0.0.1:4173)
npm run lint     # Run ESLint
```

**Development workflow:**
- Changes hot-reload in dev mode automatically
- Build output goes to `dist/` directory
- Type checking happens before build (not in dev mode)

## Architecture & Code Organization

### Core Application Structure

**Entry Point:** `src/App.tsx` wraps the entire app with providers and router.

**Key Layers:**

1. **`src/app/`** - Application-level setup
   - `providers/AppProviders.tsx` - Wraps app with Router, Toaster, FontLoader
   - `router/AppRouter.tsx` - React Router configuration with two main routes:
     - `/` - Landing page (with LandingLayout)
     - `/editor` - Main editor page
   - `styles/` - Global CSS/theme configuration

2. **`src/store/`** - Global state management (Zustand + Immer)
   - `canvasStore.ts` - Central state for canvas operations (snap data, selection, history, clipboard, context menu, zoom, grid)
   - `themeStore.ts` - Theme switching (light/dark/system with localStorage persistence)
   - `recentSnapsStore.ts` - Recent projects tracking

3. **`src/features/`** - Feature modules (mostly scaffolding, not fully implemented)
   - Each feature folder has an `index.ts` exporting feature logic
   - Examples: `create-snap/`, `edit-code-element/`, `export-snap/`, `keyboard-shortcuts/`, `manage-layers/`
   - TODO: These are planned to be refactored to contain actual business logic

4. **`src/components/`** - Reusable UI components
   - `ui/` - Basic form controls and overlays (NumberField, SelectField, SliderField, ContextMenu, ToggleSwitch)
   - `Toolbar.tsx` - Main editing toolbar (tool selection)
   - `Inspector.tsx` - Properties panel for selected element
   - `LayersPanel.tsx` - Layer management with reorder/lock/visibility controls
   - `CommandMenu.tsx` - Command palette (Cmd+K)
   - `FontLoader.tsx` - Dynamically loads fonts (Google Fonts, etc.)
   - Canvas elements: `TextBlock.tsx`, `CodeBlock.tsx`, `ArrowLine.tsx`

5. **`src/utils/`** - Utility functions
   - `highlighter.ts` - Syntax highlighting integration (Shiki)
   - `fontLoader.ts` - Font loading and caching
   - `animationVariants.ts` - Framer Motion animation presets (for landing page)

6. **`src/shared/`** - Shared constants, types, UI components
   - `constants/` - Language themes, color presets, export settings
   - `types/` - Shared type definitions (not main types)
   - `ui/` - Shared UI exports
   - `lib/` - Utility exports

7. **`src/types/index.ts`** - Core data types
   - `Snap` - Canvas project (meta + elements + background)
   - `CanvasElement` - Union of all element types (CodeElement, TextElement, ArrowElement, ImageElement, etc.)
   - `Background` - Background configuration (color, gradient, brand strip)
   - `CanvasMeta` - Canvas metadata (title, aspect ratio, dimensions)

8. **`src/pages/`** - Route pages
   - `LandingPage.tsx` - Landing/marketing page with Framer Motion animations
   - `Editor.tsx` - Main editor interface

9. **`src/layouts/`** - Layout wrappers
   - `LandingLayout.tsx` - Header + footer + dark mode toggle for landing page

### State Management Pattern (Zustand)

The `canvasStore` follows this pattern:
- **State:** Snap data (elements, background, meta), UI state (selection, zoom, tool, context menu)
- **Actions:** Methods to mutate state (addElement, updateElement, selectElement, undo/redo, export/import)
- **History:** Manual undo/redo stack (separate from state)
- **Persistence:** Canvas projects auto-save to localStorage via Zustand persist middleware

**Key stores:**
- `canvasStore` - 90% of app state
- `themeStore` - Color scheme preference
- `recentSnapsStore` - Recent projects list

### Canvas Rendering (Konva + React Konva)

**How it works:**
- Konva Stage wraps a canvas element
- Elements (Code, Text, Arrow) are rendered as Konva shapes with React components
- Selection is handled via `selectedElementIds` state and visual feedback (border, resize handles)
- Transforms (move, resize, rotate) are applied to Konva Node properties
- Export uses Konva's `toImage()` method with specified scale factor

**Important files:**
- `src/pages/Editor.tsx` - Main canvas component structure
- Individual element components handle their Konva rendering

### Landing Page & Animations

The landing page (`src/pages/LandingPage.tsx`) features Framer Motion animations:
- **Scroll-triggered animations** via `whileInView` with `viewport={{ once: true, margin: "-100px" }}`
- **Stagger animations** for lists using `variants` with `staggerChildren`
- **Interactive hover/tap effects** for buttons and cards using `whileHover` and `whileTap`
- **Reusable animation variants** defined in `src/utils/animationVariants.ts`
- **Count-up animations** for statistics via custom `CountUp` component
- Uses `AnimatePresence` for FAQ accordion smooth transitions

**When adding animations:**
- Import variants from `animationVariants.ts`
- Use `motion.` prefix for animated components
- Always include accessibility: test with `prefers-reduced-motion` disabled
- Keep durations under 500ms for snappy feel
- Use GPU-accelerated properties: `transform` and `opacity` only

## Key Concepts & Patterns

### Element Types & Union Types

All canvas elements follow a base structure extended by specific types:
```typescript
type CanvasElement = CodeElement | TextElement | ArrowElement | ImageElement | GroupElement | ShapeElement;
```

When working with elements:
- Check `element.kind` to determine type
- Use type guards: `element.kind === 'code'` to narrow types
- Each element has common properties (id, x, y, width, height, rotation, locked, hidden)

### Keyboard Shortcuts

Implemented in a custom hook pattern (see keyboard-shortcuts feature TODO). Common shortcuts:
- `Cmd+N` - New canvas
- `Cmd+C/V` - Copy/paste elements
- `Cmd+Z/Shift+Cmd+Z` - Undo/redo
- `Cmd+D` - Duplicate selected
- `Cmd+;` - Toggle grid
- Tool selection: `V`, `C`, `T`, `A` - Select, Code, Text, Arrow
- `Esc` - Deselect all

### Export System

Canvas-to-image export:
1. User clicks export button
2. Konva stage captures as image with scale factor (1x, 2x, 3x)
3. Image is downloaded or copied to clipboard
4. Supports PNG and JPEG formats
5. Max output: 4096px on longest edge

### Theme System

Dark/light mode with system preference detection:
- Toggle in header via theme button
- Theme state persists in localStorage
- All components respect CSS class `.dark` on `document.documentElement`
- Colors use Tailwind dark: prefix for dual-mode support

## Landing Page Recent Changes

**Recently added (Framer Motion optimization):**
- All sections now have scroll-triggered animations
- Micro-interactions on buttons, cards, and icons
- Smooth FAQ accordion with AnimatePresence
- Social proof animations (avatar stagger, count-up)
- Pricing card badge pulse animation
- Background blob animations on final CTA
- All animations respect `prefers-reduced-motion` via Framer Motion's built-in support

## Common Tasks & Patterns

### Adding a New Canvas Element Type

1. Define type in `src/types/index.ts` extending base properties
2. Add to `CanvasElement` union type
3. Create rendering component (e.g., `CodeBlock.tsx`)
4. Add creation logic to `canvasStore` (addElement action)
5. Add to inspector panel for property editing
6. Update export logic if needed

### Working with Canvas Store

```typescript
// Get store
const { snap, selectedElementIds, zoom, selectElement, updateElement } = useCanvasStore();

// Update element
updateElement(elementId, { x: 100, y: 200 });

// Select element
selectElement(elementId, false); // false = replace selection, true = add to selection

// Undo/Redo
useCanvasStore.setState(state => {
  state.saveToHistory(); // Save current state before mutation
  // ... mutations here (with immer)
  state.undo(); // Go back
});
```

### Syntax Highlighting

- Uses Shiki for code highlighting
- Languages loaded dynamically via WASM
- Caching in utils/highlighter.ts
- Theme selection in CodeBlock inspector

### Font Management

- Google Fonts loaded dynamically via FontLoader component
- Fonts cached in localStorage
- Custom fallback fonts defined in constants

## Type Safety

- Full TypeScript support with no `any` types allowed
- Configuration in `tsconfig.app.json` uses strict mode
- Types imported with `type` keyword when appropriate
- Use type guards (`kind === 'code'`) instead of unsafe casting

## Performance Considerations

- Canvas rendering uses Konva's batching
- Element selection is O(1) lookup via `selectedElementIds` array
- History stack has reasonable limits (undo/redo)
- Font loading is async and cached
- Code highlighting is memoized per element
- Framer Motion animations use GPU acceleration (transform + opacity)

## Debugging Tips

**Chrome DevTools:**
- React Dev Tools - inspect Zustand store state
- Konva Dev Tools - inspect stage/layer structure
- Network tab - check font and WASM loading

**Common issues:**
- Elements not rendering: Check element kind and Konva node type
- State not updating: Ensure mutations happen inside Zustand actions (Immer wraps them)
- Canvas invisible: Check zoom level, canvas dimensions, or locked/hidden state
- Fonts not loading: Check FontLoader in AppProviders and localStorage

## File Naming Conventions

- Components: PascalCase (e.g., `CodeBlock.tsx`)
- Utilities: camelCase (e.g., `highlighter.ts`)
- Stores: camelCase with Store suffix (e.g., `canvasStore.ts`)
- Features: kebab-case folders (e.g., `edit-code-element/`)
- Types: defined in `types/index.ts` or `types.ts` files, PascalCase

## Build & Deployment

- `npm run build` runs TypeScript check first, then Vite build
- Output in `dist/` - ready to deploy statically
- No server-side code needed
- All state stored in browser localStorage

## Documentation

- Product specification: `docs/spec.md`
- UI design notes: `docs/design.md`
- README.md has keyboard shortcuts and getting started guide
