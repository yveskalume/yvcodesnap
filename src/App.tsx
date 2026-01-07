import { useRef, useEffect } from 'react';
import type Konva from 'konva';
import Canvas from './components/Canvas';
import TopBar from './components/TopBar';
import Toolbar from './components/Toolbar';
import Inspector from './components/Inspector';
import { useCanvasStore } from './store/canvasStore';

function App() {
  const stageRef = useRef<Konva.Stage>(null);
  const { 
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
  } = useCanvasStore();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;
      
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
  }, [selectedElementId, deleteElement, duplicateElement, undo, redo, zoom, setZoom, showGrid, setShowGrid, setTool, selectElement]);

  return (
    <div className="h-screen flex flex-col bg-neutral-900 text-white">
      <TopBar stageRef={stageRef} />
      <div className="flex-1 flex overflow-hidden">
        <Toolbar />
        <Canvas stageRef={stageRef} />
        <Inspector />
      </div>
    </div>
  );
}

export default App;
