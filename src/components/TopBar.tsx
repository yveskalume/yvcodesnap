import React, { useState, useRef, useCallback, memo } from 'react';
import { useCanvasStore } from '../store/canvasStore';
import { useRecentSnapsStore } from '../store/recentSnapsStore';
import { ASPECT_RATIOS } from '../types';
import type Konva from 'konva';
import RecentSnapsDropdown from './RecentSnapsDropdown';

interface TopBarProps {
  stageRef: React.RefObject<Konva.Stage | null>;
}

const TopBar: React.FC<TopBarProps> = ({ stageRef }) => {
  const [showRecentSnaps, setShowRecentSnaps] = useState(false);
  const recentButtonRef = useRef<HTMLButtonElement>(null);
  
  const { 
    snap, 
    updateMeta, 
    newSnap, 
    exportSnap, 
    importSnap,
    undo,
    redo,
    history,
    saveToHistory,
  } = useCanvasStore();
  
  const { addRecentSnap } = useRecentSnapsStore();

  const handleNewSnap = useCallback(() => {
    if (confirm('Create a new canvas? Unsaved changes will be lost.')) {
      // Save current snap to recent before creating new
      if (snap.elements.length > 0) {
        addRecentSnap(snap);
      }
      newSnap({ title: 'Untitled', aspect: '16:9', width: 1920, height: 1080 });
    }
  }, [snap, addRecentSnap, newSnap]);

  const handleAspectChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const ratio = ASPECT_RATIOS.find(r => r.name === e.target.value);
    if (ratio) {
      updateMeta({
        aspect: ratio.name,
        width: ratio.width,
        height: ratio.height,
      });
    }
  }, [updateMeta]);

  const handleExportImage = useCallback(async (format: 'png' | 'jpeg', scale: number = 2) => {
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
  }, [stageRef, snap.meta]);

  const handleExportJSON = useCallback(() => {
    const json = exportSnap();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${snap.meta.title || 'canvas'}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    
    // Save to recent snaps when exporting
    addRecentSnap(snap);
  }, [exportSnap, snap, addRecentSnap]);

  const handleImportJSON = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Save current snap to recent before importing
        if (snap.elements.length > 0) {
          addRecentSnap(snap);
        }
        saveToHistory();
        const reader = new FileReader();
        reader.onload = (e) => {
          const json = e.target?.result as string;
          importSnap(json);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [snap, addRecentSnap, saveToHistory, importSnap]);

  const toggleRecentSnaps = useCallback(() => {
    setShowRecentSnaps((prev) => !prev);
  }, []);

  return (
    <div className="h-16 bg-[#09090b]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 z-40 fixed top-0 w-full">
      {/* Left section: Logo & Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 pr-4 border-r border-white/5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-900/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            YvCode
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleNewSnap}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-all active:scale-95"
            title="New (⌘N)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={handleImportJSON}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-all active:scale-95"
            title="Open File (⌘O)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
            </svg>
          </button>
          
          {/* Recent Snaps Button */}
          <div className="relative">
            <button
              ref={recentButtonRef}
              onClick={toggleRecentSnaps}
              className={`p-2 rounded-lg transition-all active:scale-95 ${
                showRecentSnaps 
                  ? 'text-white bg-white/10' 
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
              title="Recent Projects"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <RecentSnapsDropdown
              isOpen={showRecentSnaps}
              onClose={() => setShowRecentSnaps(false)}
              anchorRef={recentButtonRef as React.RefObject<HTMLElement>}
            />
          </div>
        </div>
      </div>

      {/* Center section: Title & Tools */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
        <div className="flex flex-col items-center">
          <input
            type="text"
            value={snap.meta.title}
            onChange={(e) => updateMeta({ title: e.target.value })}
            className="bg-transparent text-sm font-medium text-center text-neutral-200 focus:text-white px-2 py-1 outline-none rounded hover:bg-white/5 focus:bg-white/10 transition-colors placeholder-neutral-600 w-48"
            placeholder="Untitled Project"
          />
          <div className="flex items-center gap-2 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
             <select
              value={snap.meta.aspect}
              onChange={handleAspectChange}
              className="bg-transparent text-[10px] items-center uppercase tracking-wider font-semibold text-neutral-500 hover:text-neutral-300 outline-none cursor-pointer appearance-none text-center"
            >
              {ASPECT_RATIOS.map((ratio) => (
                <option key={ratio.name} value={ratio.name}>
                  {ratio.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Right section: History & Export */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-0.5 p-1 bg-white/5 rounded-lg border border-white/5">
          <button
            onClick={undo}
            disabled={history.past.length === 0}
            className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
            title="Undo (⌘Z)"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button
            onClick={redo}
            disabled={history.future.length === 0}
            className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
            title="Redo (⇧⌘Z)"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
            </svg>
          </button>
        </div>
        
        <div className="h-6 w-px bg-white/10" />

        <div className="relative group">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-blue-50 text-sm font-semibold rounded-lg shadow-lg shadow-white/5 transition-all active:scale-95"
          >
            <span>Export</span>
            <svg className="w-4 h-4 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <div className="absolute right-0 top-full mt-2 w-48 bg-[#09090b] border border-white/10 rounded-xl shadow-2xl p-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 transform origin-top-right">
             <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Format</div>
            <button
              onClick={() => handleExportImage('png', 2)}
              className="w-full text-left px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex justify-between group/item"
            >
              <span>PNG Image</span>
              <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] text-neutral-400 group-hover/item:text-white">2x</span>
            </button>
            <button
              onClick={() => handleExportImage('jpeg', 2)}
              className="w-full text-left px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              JPEG Image
            </button>
            <div className="h-px bg-white/5 my-1" />
            <button
              onClick={handleExportJSON}
              className="w-full text-left px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              Save Project JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(TopBar);
