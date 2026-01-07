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
} from '../types';

interface HistoryState {
  past: Snap[];
  future: Snap[];
}

interface CanvasState {
  snap: Snap;
  selectedElementId: string | null;
  zoom: number;
  showGrid: boolean;
  tool: 'select' | 'code' | 'text' | 'arrow';
  history: HistoryState;
  
  // Actions
  setSnap: (snap: Snap) => void;
  updateMeta: (meta: Partial<CanvasMeta>) => void;
  setBackground: (background: Partial<Background>) => void;
  
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  
  selectElement: (id: string | null) => void;
  setZoom: (zoom: number) => void;
  setShowGrid: (show: boolean) => void;
  setTool: (tool: 'select' | 'code' | 'text' | 'arrow') => void;
  
  moveElementUp: (id: string) => void;
  moveElementDown: (id: string) => void;
  
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
  
  newSnap: (meta: CanvasMeta) => void;
  exportSnap: () => string;
  importSnap: (json: string) => void;
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
      selectedElementId: null,
      zoom: 0.5,
      showGrid: false,
      tool: 'select',
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
        state.selectedElementId = element.id;
        state.tool = 'select';
      }),
      
      updateElement: (id, updates) => set((state) => {
        const index = state.snap.elements.findIndex((el) => el.id === id);
        if (index !== -1) {
          state.snap.elements[index] = { ...state.snap.elements[index], ...updates } as CanvasElement;
        }
      }),
      
      deleteElement: (id) => set((state) => {
        get().saveToHistory();
        state.snap.elements = state.snap.elements.filter((el) => el.id !== id);
        if (state.selectedElementId === id) {
          state.selectedElementId = null;
        }
      }),
      
      duplicateElement: (id) => set((state) => {
        const element = state.snap.elements.find((el) => el.id === id);
        if (element) {
          get().saveToHistory();
          const newElement = {
            ...JSON.parse(JSON.stringify(element)),
            id: uuidv4(),
            x: element.x + 20,
            y: element.y + 20,
          };
          state.snap.elements.push(newElement);
          state.selectedElementId = newElement.id;
        }
      }),
      
      selectElement: (id) => set((state) => {
        state.selectedElementId = id;
      }),
      
      setZoom: (zoom) => set((state) => {
        state.zoom = Math.max(0.25, Math.min(4, zoom));
      }),
      
      setShowGrid: (show) => set((state) => {
        state.showGrid = show;
      }),
      
      setTool: (tool) => set((state) => {
        state.tool = tool;
        if (tool !== 'select') {
          state.selectedElementId = null;
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
          state.selectedElementId = null;
        }
      }),
      
      redo: () => set((state) => {
        if (state.history.future.length > 0) {
          const next = state.history.future.pop()!;
          state.history.past.push(JSON.parse(JSON.stringify(state.snap)));
          state.snap = next;
          state.selectedElementId = null;
        }
      }),
      
      newSnap: (meta) => set((state) => {
        state.snap = {
          ...defaultSnap,
          meta: { ...defaultSnap.meta, ...meta },
        };
        state.selectedElementId = null;
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
            state.selectedElementId = null;
            state.history = { past: [], future: [] };
          });
        } catch (e) {
          console.error('Failed to import snap:', e);
        }
      },
    })),
    {
      name: 'code-canvas-storage',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
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
