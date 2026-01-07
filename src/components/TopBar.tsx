import React from 'react';
import { useCanvasStore } from '../store/canvasStore';
import { ASPECT_RATIOS } from '../types';
import type Konva from 'konva';

interface TopBarProps {
  stageRef: React.RefObject<Konva.Stage | null>;
}

const TopBar: React.FC<TopBarProps> = ({ stageRef }) => {
  const { 
    snap, 
    updateMeta, 
    newSnap, 
    exportSnap, 
    importSnap,
    undo,
    redo,
    history,
  } = useCanvasStore();

  const handleNewSnap = () => {
    if (confirm('Create a new canvas? Unsaved changes will be lost.')) {
      newSnap({ title: 'Untitled', aspect: '16:9', width: 1920, height: 1080 });
    }
  };

  const handleAspectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const ratio = ASPECT_RATIOS.find(r => r.name === e.target.value);
    if (ratio) {
      updateMeta({
        aspect: ratio.name,
        width: ratio.width,
        height: ratio.height,
      });
    }
  };

  const handleExportImage = async (format: 'png' | 'jpeg', scale: number = 2) => {
    const stage = stageRef.current;
    if (!stage) return;

    // Temporarily set scale for export
    const oldScale = stage.scaleX();
    const oldPosition = { x: stage.x(), y: stage.y() };
    
    stage.scale({ x: scale, y: scale });
    stage.position({ x: 0, y: 0 });

    const dataUrl = stage.toDataURL({
      pixelRatio: 1,
      mimeType: format === 'png' ? 'image/png' : 'image/jpeg',
      quality: 0.95,
      width: snap.meta.width * scale,
      height: snap.meta.height * scale,
    });

    // Restore scale
    stage.scale({ x: oldScale, y: oldScale });
    stage.position(oldPosition);

    // Download
    const link = document.createElement('a');
    link.download = `${snap.meta.title || 'canvas'}.${format}`;
    link.href = dataUrl;
    link.click();
  };

  const handleExportJSON = () => {
    const json = exportSnap();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${snap.meta.title || 'canvas'}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const json = e.target?.result as string;
          importSnap(json);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="h-14 bg-neutral-800 border-b border-neutral-700 flex items-center justify-between px-4">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handleNewSnap}
            className="p-2 hover:bg-neutral-700 rounded text-neutral-300 hover:text-white transition-colors"
            title="New (⌘N)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={handleImportJSON}
            className="p-2 hover:bg-neutral-700 rounded text-neutral-300 hover:text-white transition-colors"
            title="Open"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
            </svg>
          </button>
        </div>
        
        <div className="h-6 w-px bg-neutral-600" />
        
        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            disabled={history.past.length === 0}
            className="p-2 hover:bg-neutral-700 rounded text-neutral-300 hover:text-white transition-colors disabled:opacity-30"
            title="Undo (⌘Z)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button
            onClick={redo}
            disabled={history.future.length === 0}
            className="p-2 hover:bg-neutral-700 rounded text-neutral-300 hover:text-white transition-colors disabled:opacity-30"
            title="Redo (⇧⌘Z)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Center section */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          value={snap.meta.title}
          onChange={(e) => updateMeta({ title: e.target.value })}
          className="bg-transparent text-white text-center px-2 py-1 border-b border-transparent hover:border-neutral-600 focus:border-blue-500 outline-none"
        />
        
        <select
          value={snap.meta.aspect}
          onChange={handleAspectChange}
          className="bg-neutral-700 text-white px-3 py-1.5 rounded text-sm"
        >
          {ASPECT_RATIOS.map((ratio) => (
            <option key={ratio.name} value={ratio.name}>
              {ratio.name}
            </option>
          ))}
        </select>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleExportJSON}
          className="px-3 py-1.5 text-sm bg-neutral-700 hover:bg-neutral-600 rounded text-white transition-colors"
        >
          Save JSON
        </button>
        
        <div className="relative group">
          <button
            className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 rounded text-white font-medium transition-colors"
          >
            Export
          </button>
          <div className="absolute right-0 top-full mt-1 bg-neutral-800 border border-neutral-700 rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            <button
              onClick={() => handleExportImage('png', 1)}
              className="block w-full px-4 py-2 text-sm text-left text-white hover:bg-neutral-700"
            >
              PNG (1x)
            </button>
            <button
              onClick={() => handleExportImage('png', 2)}
              className="block w-full px-4 py-2 text-sm text-left text-white hover:bg-neutral-700"
            >
              PNG (2x)
            </button>
            <button
              onClick={() => handleExportImage('png', 3)}
              className="block w-full px-4 py-2 text-sm text-left text-white hover:bg-neutral-700"
            >
              PNG (3x)
            </button>
            <div className="border-t border-neutral-700" />
            <button
              onClick={() => handleExportImage('jpeg', 2)}
              className="block w-full px-4 py-2 text-sm text-left text-white hover:bg-neutral-700"
            >
              JPEG (2x)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
