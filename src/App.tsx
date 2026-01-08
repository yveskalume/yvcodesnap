import { useRef, useEffect, useCallback, useState } from 'react';
import type Konva from 'konva';
import Canvas from './components/Canvas';
import TopBar from './components/TopBar';
import Toolbar from './components/Toolbar';
import Inspector from './components/Inspector';
import LayersPanel from './components/LayersPanel';
import FontLoader from './components/FontLoader';
import MainScreen from './components/MainScreen';
import { useCanvasStore } from './store/canvasStore';
import { useRecentSnapsStore } from './store/recentSnapsStore';

function App() {
  const [showMainScreen, setShowMainScreen] = useState(true);
  const stageRef = useRef<Konva.Stage>(null);
  const { 
    snap,
    deleteElement, 
    duplicateElement, 
    selectedElementId, 
    undo, 
    redo,
    setZoom,
    zoom,
    setShowGrid,
    showGrid,
    setTool,
    selectElement,
    newSnap,
    importSnap,
    exportSnap,
    saveToHistory,
  } = useCanvasStore();
  
  const { addRecentSnap } = useRecentSnapsStore();

  // Handle file import
  const handleImportFile = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.yvsnap';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Save current snap to recent before importing
        if (snap.elements.length > 0) {
          addRecentSnap(snap);
        }
        saveToHistory();
        const reader = new FileReader();
        reader.onload = (evt) => {
          const json = evt.target?.result as string;
          importSnap(json);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [snap, addRecentSnap, saveToHistory, importSnap]);

  // Handle file export
  const handleExportFile = useCallback(() => {
    const json = exportSnap();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${snap.meta.title || 'canvas'}.yvsnap`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    addRecentSnap(snap);
  }, [exportSnap, snap, addRecentSnap]);

  // Handle new snap
  const handleNewSnap = useCallback(() => {
    if (confirm('Create a new canvas? Unsaved changes will be lost.')) {
      if (snap.elements.length > 0) {
        addRecentSnap(snap);
      }
      newSnap({ title: 'Untitled', aspect: '16:9', width: 1920, height: 1080 });
    }
  }, [snap, addRecentSnap, newSnap]);

  // Handle going back to main screen
  const handleGoToMainScreen = useCallback(() => {
    if (snap.elements.length > 0) {
      addRecentSnap(snap);
    }
    setShowMainScreen(true);
  }, [snap, addRecentSnap]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;
      
      // New snap (⌘N)
      if (isMeta && e.key === 'n') {
        e.preventDefault();
        handleNewSnap();
      }
      
      // Open file (⌘O)
      if (isMeta && e.key === 'o') {
        e.preventDefault();
        handleImportFile();
      }
      
      // Save/Export (⌘S)
      if (isMeta && e.key === 's') {
        e.preventDefault();
        handleExportFile();
      }
      
      // Delete
      if (e.key === 'Backspace' || e.key === 'Delete') {
        if (selectedElementId && !isInputFocused()) {
          e.preventDefault();
          deleteElement(selectedElementId);
        }
      }
      
      // Duplicate
      if (isMeta && e.key === 'd') {
        if (selectedElementId) {
          e.preventDefault();
          duplicateElement(selectedElementId);
        }
      }
      
      // Undo
      if (isMeta && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      
      // Redo
      if (isMeta && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      }
      
      // Zoom in
      if (isMeta && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        setZoom(zoom + 0.1);
      }
      
      // Zoom out
      if (isMeta && e.key === '-') {
        e.preventDefault();
        setZoom(zoom - 0.1);
      }
      
      // Toggle grid
      if (isMeta && e.key === ';') {
        e.preventDefault();
        setShowGrid(!showGrid);
      }
      
      // Tool shortcuts (only when not in input)
      if (!isInputFocused()) {
        if (e.key === 'v' || e.key === 'V') {
          setTool('select');
        }
        if (e.key === 'c' && !isMeta) {
          setTool('code');
        }
        if (e.key === 't' || e.key === 'T') {
          setTool('text');
        }
        if (e.key === 'a' && !isMeta) {
          setTool('arrow');
        }
        if (e.key === 'Escape') {
          selectElement(null);
          setTool('select');
        }
      }
    };

    const isInputFocused = () => {
      const active = document.activeElement;
      return active?.tagName === 'INPUT' || active?.tagName === 'TEXTAREA' || active?.tagName === 'SELECT';
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, deleteElement, duplicateElement, undo, redo, zoom, setZoom, showGrid, setShowGrid, setTool, selectElement, handleNewSnap, handleImportFile, handleExportFile]);

  // Show main screen
  if (showMainScreen) {
    return (
      <>
        <FontLoader />
        <MainScreen onOpenEditor={() => setShowMainScreen(false)} />
      </>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#09090b] text-white">
      <FontLoader />
      <TopBar stageRef={stageRef} onGoHome={handleGoToMainScreen} />
      <div className="flex-1 flex overflow-hidden">
        <LayersPanel />
        <Toolbar />
        <Canvas stageRef={stageRef} />
        <Inspector />
      </div>
    </div>
  );
}

export default App;
