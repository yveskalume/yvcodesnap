import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type {
  Snap,
  CanvasElement,
  CodeElement,
  TextElement,
  ArrowElement,
  Background,
  CanvasMeta,
  ShapeElement,
  ShapeKind,
  ImageElement,
  GroupElement,
} from '../types';

interface HistoryState {
  past: Snap[];
  future: Snap[];
}

export type ToolId = 'select' | 'code' | 'text' | 'image' | 'arrow' | 'rectangle' | 'ellipse' | 'line' | 'polygon' | 'star';

interface CanvasState {
  snap: Snap;
  selectedElementIds: string[];
  zoom: number;
  showGrid: boolean;
  tool: ToolId;
  clipboard: CanvasElement[] | null;
  history: HistoryState;

  // Actions
  setSnap: (snap: Snap) => void;
  updateMeta: (meta: Partial<CanvasMeta>) => void;
  setBackground: (background: Partial<Background>) => void;

  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  deleteElement: (id?: string) => void;
  duplicateElement: (id?: string) => void;

  selectElement: (id: string | null, multi?: boolean) => void;
  selectAll: () => void;
  setZoom: (zoom: number) => void;
  setShowGrid: (show: boolean) => void;
  setTool: (tool: ToolId) => void;

  moveElementUp: (id: string) => void;
  moveElementDown: (id: string) => void;

  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
  copyToClipboard: () => void;
  pasteFromClipboard: () => void;

  newSnap: (meta: CanvasMeta) => void;
  exportSnap: () => string;
  importSnap: (json: string) => void;
  groupSelection: () => void;
  ungroupSelection: () => void;
}

const MAX_PERSISTED_AVATAR_LENGTH = 350000;

const defaultSnap: Snap = {
  version: '1.0.0',
  meta: {
    title: 'Untitled',
    aspect: '16:9',
    width: 1920,
    height: 1080,
  },
  background: {
    type: 'gradient',
    solid: { color: '#101022' },
    gradient: { from: '#101022', to: '#1f1f3a', angle: 135 },
    brandStrip: {
      enabled: false,
      position: 'bottom',
      height: 60,
      color: '#000000',
      text: '',
      textColor: '#ffffff',
      fontSize: 16,
      fontFamily: 'Inter',
    },
    branding: {
      enabled: false,
      position: 'bottom-right',
      name: '',
      website: '',
      social: {},
      avatarUrl: '',
      showName: true,
      showWebsite: true,
      showSocial: true,
      showAvatar: false,
      fontSize: 14,
      fontFamily: 'Inter',
      color: '#ffffff',
      opacity: 0.8,
      padding: 24,
      socialIconSize: 20,
      socialLayout: 'horizontal',
      avatarSize: 56,
    },
  },
  elements: [],
};

export const useCanvasStore = create<CanvasState>()(
  persist(
    immer((set, get) => ({
      snap: defaultSnap,
      selectedElementIds: [],
      zoom: 0.5,
      showGrid: false,
      tool: 'select',
      clipboard: null,
      history: { past: [], future: [] },

      setSnap: (snap) => set((state) => {
        state.snap = snap;
      }),

      updateMeta: (meta) => set((state) => {
        state.snap.meta = { ...state.snap.meta, ...meta };
      }),

      setBackground: (background) => set((state) => {
        state.snap.background = { ...state.snap.background, ...background };
      }),

      addElement: (element) => set((state) => {
        get().saveToHistory();
        state.snap.elements.push(element);
        state.selectedElementIds = [element.id];
      }),

      updateElement: (id, updates) => set((state) => {
        const index = state.snap.elements.findIndex((el) => el.id === id);
        if (index !== -1) {
          // record history before mutating
          state.history.past.push(JSON.parse(JSON.stringify(state.snap)));
          state.history.future = [];
          if (state.history.past.length > 50) state.history.past.shift();

          state.snap.elements[index] = { ...state.snap.elements[index], ...updates } as CanvasElement;
        }
      }),

      deleteElement: (id) => set((state) => {
        get().saveToHistory();
        const idsToDelete = id ? [id] : state.selectedElementIds;
        state.snap.elements = state.snap.elements.filter((el) => !idsToDelete.includes(el.id));
        state.selectedElementIds = state.selectedElementIds.filter((selId) => !idsToDelete.includes(selId));
      }),

      duplicateElement: (id) => set((state) => {
        const idsToDuplicate = id ? [id] : state.selectedElementIds;
        if (idsToDuplicate.length === 0) return;

        get().saveToHistory();
        const newIds: string[] = [];

        idsToDuplicate.forEach((targetId) => {
          const element = state.snap.elements.find((el) => el.id === targetId);
          if (element) {
            const newElement = {
              ...JSON.parse(JSON.stringify(element)),
              id: uuidv4(),
              x: element.x + 20,
              y: element.y + 20,
            };

            // Ensure width and height are present for text elements, if they were somehow missing
            if (newElement.type === 'text') {
              newElement.width = (newElement as TextElement).width || 200; // Default width for text
              newElement.height = (newElement as TextElement).height || 40; // Default height for text
            }

            state.snap.elements.push(newElement);
            newIds.push(newElement.id);
          }
        });

        state.selectedElementIds = newIds;
      }),

      selectElement: (id, multi = false) => set((state) => {
        if (id === null) {
          if (!multi) state.selectedElementIds = [];
          return;
        }

        if (multi) {
          if (state.selectedElementIds.includes(id)) {
            state.selectedElementIds = state.selectedElementIds.filter((selId) => selId !== id);
          } else {
            state.selectedElementIds.push(id);
          }
        } else {
          state.selectedElementIds = [id];
        }
      }),

      selectAll: () => set((state) => {
        state.selectedElementIds = state.snap.elements.map((el) => el.id);
      }),

      setZoom: (zoom) => set((state) => {
        state.zoom = Math.max(0.25, Math.min(256, zoom));
      }),

      setShowGrid: (show) => set((state) => {
        state.showGrid = show;
      }),

      setTool: (tool) => set((state) => {
        state.tool = tool;
        if (tool !== 'select') {
          state.selectedElementIds = [];
        }
      }),

      moveElementUp: (id) => set((state) => {
        const index = state.snap.elements.findIndex((el) => el.id === id);
        if (index < state.snap.elements.length - 1) {
          const temp = state.snap.elements[index];
          state.snap.elements[index] = state.snap.elements[index + 1];
          state.snap.elements[index + 1] = temp;
        }
      }),

      moveElementDown: (id) => set((state) => {
        const index = state.snap.elements.findIndex((el) => el.id === id);
        if (index > 0) {
          const temp = state.snap.elements[index];
          state.snap.elements[index] = state.snap.elements[index - 1];
          state.snap.elements[index - 1] = temp;
        }
      }),

      saveToHistory: () => set((state) => {
        state.history.past.push(JSON.parse(JSON.stringify(state.snap)));
        state.history.future = [];
        if (state.history.past.length > 50) {
          state.history.past.shift();
        }
      }),

      undo: () => set((state) => {
        if (state.history.past.length > 0) {
          const previous = state.history.past.pop()!;
          state.history.future.push(JSON.parse(JSON.stringify(state.snap)));
          state.snap = previous;
          state.selectedElementIds = [];
        }
      }),

      redo: () => set((state) => {
        if (state.history.future.length > 0) {
          const next = state.history.future.pop()!;
          state.history.past.push(JSON.parse(JSON.stringify(state.snap)));
          state.snap = next;
          state.selectedElementIds = [];
        }
      }),

      copyToClipboard: () => set((state) => {
        if (state.selectedElementIds.length > 0) {
          state.clipboard = state.snap.elements.filter((el) => state.selectedElementIds.includes(el.id));
        }
      }),

      pasteFromClipboard: () => set((state) => {
        if (state.clipboard && state.clipboard.length > 0) {
          get().saveToHistory();
          const newIds: string[] = [];

          state.clipboard.forEach((clipElement) => {
            const newElement = {
              ...JSON.parse(JSON.stringify(clipElement)),
              id: uuidv4(),
              x: clipElement.x + 20,
              y: clipElement.y + 20,
            };

            // Handle shape points if necessary (e.g. arrows, lines)
            if (newElement.type === 'arrow' || (newElement.type === 'shape' && newElement.points)) {
              // For elements with relative points, we just update x/y offset
              // The points themselves are relative to (0,0) so they don't need shifting
            }

            state.snap.elements.push(newElement);
            newIds.push(newElement.id);
          });

          state.selectedElementIds = newIds;
        }
      }),

      newSnap: (meta) => set((state) => {
        state.snap = {
          ...defaultSnap,
          meta: { ...defaultSnap.meta, ...meta },
        };
        state.selectedElementIds = [];
        state.history = { past: [], future: [] };
      }),

      exportSnap: () => {
        return JSON.stringify(get().snap, null, 2);
      },

      importSnap: (json) => {
        try {
          const snap = JSON.parse(json) as Snap;
          set((state) => {
            state.snap = snap;
            state.selectedElementIds = [];
            state.history = { past: [], future: [] };
          });
        } catch (e) {
          console.error('Failed to import snap:', e);
        }
      },

      groupSelection: () => set((state) => {
        const selectedIds = state.selectedElementIds;
        if (selectedIds.length < 2) return;

        get().saveToHistory();

        // Find elements to group
        const groupElements = state.snap.elements.filter((el) => selectedIds.includes(el.id));

        // Remove from main list
        state.snap.elements = state.snap.elements.filter((el) => !selectedIds.includes(el.id));

        // Calculate bounding box of the selection
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        groupElements.forEach(el => {
          let elWidth = 0;
          let elHeight = 0;

          if (el.type === 'code' || el.type === 'image' || el.type === 'group') {
            elWidth = (el as any).width || 0;
            elHeight = (el as any).height || 0;
            minX = Math.min(minX, el.x);
            minY = Math.min(minY, el.y);
            maxX = Math.max(maxX, el.x + elWidth);
            maxY = Math.max(maxY, el.y + elHeight);
          } else if (el.type === 'text') {
            elWidth = (el as any).width || 200;
            elHeight = (el as any).height || 40;
            minX = Math.min(minX, el.x);
            minY = Math.min(minY, el.y);
            maxX = Math.max(maxX, el.x + elWidth);
            maxY = Math.max(maxY, el.y + elHeight);
          } else if (el.type === 'arrow' || (el.type === 'shape' && el.points)) {
            const points = el.points || [];
            points.forEach(p => {
              minX = Math.min(minX, p.x);
              minY = Math.min(minY, p.y);
              maxX = Math.max(maxX, p.x);
              maxY = Math.max(maxY, p.y);
            });
          } else if (el.type === 'shape') {
            elWidth = (el as any).width || 100;
            elHeight = (el as any).height || 100;
            minX = Math.min(minX, el.x);
            minY = Math.min(minY, el.y);
            maxX = Math.max(maxX, el.x + elWidth);
            maxY = Math.max(maxY, el.y + elHeight);
          }
        });

        // Handle case where no elements were found or dimensions are invalid
        if (minX === Infinity) return;

        // Make coordinates relative to the group origin (minX, minY)
        const adjustedElements = groupElements.map(el => {
          const cloned = JSON.parse(JSON.stringify(el));
          cloned.x -= minX;
          cloned.y -= minY;
          if (cloned.points) {
            cloned.points = cloned.points.map((p: any) => ({
              x: p.x - minX,
              y: p.y - minY
            }));
          }
          return cloned;
        });

        const newGroup: GroupElement = {
          id: uuidv4(),
          type: 'group',
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY,
          rotation: 0,
          locked: false,
          visible: true,
          elements: adjustedElements
        };

        state.snap.elements.push(newGroup);
        state.selectedElementIds = [newGroup.id];
      }),

      ungroupSelection: () => set((state) => {
        const selectedIds = state.selectedElementIds;
        const groupsToUngroup = state.snap.elements.filter(el =>
          el.type === 'group' && selectedIds.includes(el.id)
        ) as GroupElement[];

        if (groupsToUngroup.length === 0) return;

        get().saveToHistory();

        groupsToUngroup.forEach(group => {
          // Remove group
          state.snap.elements = state.snap.elements.filter(el => el.id !== group.id);

          // Add children back with adjusted coordinates
          group.elements.forEach(el => {
            const restored = JSON.parse(JSON.stringify(el));
            restored.x += group.x;
            restored.y += group.y;
            if (restored.points) {
              restored.points = restored.points.map((p: any) => ({
                x: p.x + group.x,
                y: p.y + group.y
              }));
            }
            state.snap.elements.push(restored);
          });
        });

        state.selectedElementIds = [];
      }),
    })),
    {
      name: 'code-canvas-storage',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => { },
            removeItem: () => { },
          };
        }

        return {
          getItem: (name: string) => window.localStorage.getItem(name),
          setItem: (name: string, value: string) => {
            try {
              window.localStorage.setItem(name, value);
            } catch (error) {
              console.warn('Failed to persist canvas state (quota exceeded).', error);
            }
          },
          removeItem: (name: string) => window.localStorage.removeItem(name),
        };
      }),
      partialize: (state) => {
        const snap = JSON.parse(JSON.stringify(state.snap)) as Snap;
        if (snap.background?.branding?.avatarUrl && snap.background.branding.avatarUrl.length > MAX_PERSISTED_AVATAR_LENGTH) {
          snap.background.branding.avatarUrl = '';
          snap.background.branding.showAvatar = false;
        }
        return { snap };
      },
    }
  )
);

// Helper functions to create elements
export const createCodeElement = (x: number, y: number): CodeElement => ({
  id: uuidv4(),
  type: 'code',
  x,
  y,
  width: 600,
  height: 300,
  rotation: 0,
  locked: false,
  visible: true,
  props: {
    code: `@Composable
fun Greeting(name: String) {
    Text(
        text = "Hello, $name!",
        modifier = Modifier.padding(16.dp)
    )
}`,
    language: 'kotlin',
    theme: 'dracula',
    fontFamily: 'JetBrains Mono',
    fontSize: 14,
    lineHeight: 1.5,
    lineNumbers: true,
    highlights: [],
    padding: 24,
    cornerRadius: 12,
    shadow: { blur: 24, spread: 0, color: 'rgba(0,0,0,0.4)' },
  },
});

export const createTextElement = (x: number, y: number): TextElement => ({
  id: uuidv4(),
  type: 'text',
  x,
  y,
  rotation: 0,
  width: 200,
  height: 40,
  locked: false,
  visible: true,
  props: {
    text: 'Your text here',
    fontFamily: 'Inter',
    fontSize: 24,
    color: '#ffffff',
    bold: false,
    italic: false,
    underline: false,
    align: 'left',
    background: null,
    padding: 8,
    cornerRadius: 4,
  },
});

export const createArrowElement = (x: number, y: number): ArrowElement => ({
  id: uuidv4(),
  type: 'arrow',
  x: 0,
  y: 0,
  rotation: 0,
  locked: false,
  visible: true,
  points: [
    { x, y },
    { x: x + 150, y: y + 80 },
  ],
  props: {
    style: 'straight',
    color: '#60a5fa',
    thickness: 3,
    head: 'filled',
  },
});

export const createShapeElement = (kind: ShapeKind, x: number, y: number): ShapeElement => ({
  id: uuidv4(),
  type: 'shape',
  x: 0,
  y: 0,
  rotation: 0,
  locked: false,
  visible: true,
  width: 0,
  height: 0,
  points: kind === 'line' ? [{ x, y }, { x, y }] : undefined,
  props: {
    kind,
    stroke: '#60a5fa',
    strokeWidth: 3,
    fill: kind === 'rectangle' || kind === 'ellipse' ? '#60a5f4' : 'transparent',
    sides: kind === 'polygon' ? 5 : kind === 'star' ? 5 : undefined,
  },
});

export const createImageElement = (x: number, y: number, src: string, width: number, height: number): ImageElement => ({
  id: uuidv4(),
  type: 'image',
  x,
  y,
  rotation: 0,
  locked: false,
  visible: true,
  width,
  height,
  props: {
    src,
    width,
    height,
    opacity: 1,
    cornerRadius: 0,
    shadow: { blur: 0, spread: 0, color: 'rgba(0,0,0,0.4)' },
    rotate: 0,
    fit: 'contain',
  },
});
