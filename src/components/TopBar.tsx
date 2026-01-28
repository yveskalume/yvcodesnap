import React, { useState, useRef, useCallback, useMemo, memo } from 'react';
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
  const [showExportMenu, setShowExportMenu] = useState(false);
  const recentButtonRef = useRef<HTMLButtonElement>(null);
  const exportButtonRef = useRef<HTMLButtonElement>(null);
  
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

  const aspectOptions = useMemo(() => {
    const names = ASPECT_RATIOS.map((r) => r.name);
    if (!names.includes(snap.meta.aspect)) {
      return [...ASPECT_RATIOS, { name: snap.meta.aspect, width: snap.meta.width, height: snap.meta.height }];
    }
    return ASPECT_RATIOS;
  }, [snap.meta.aspect, snap.meta.width, snap.meta.height]);

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
    const value = e.target.value;
    const ratio = aspectOptions.find(r => r.name === value);
    if (ratio) {
      updateMeta({
        aspect: ratio.name,
        width: ratio.width,
        height: ratio.height,
      });
    }
  }, [updateMeta, aspectOptions]);

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
    setShowExportMenu(false);
    addRecentSnap(snap);
  }, [stageRef, snap, addRecentSnap]);

  const handleExportJSON = useCallback(() => {
    const json = exportSnap();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${snap.meta.title || 'canvas'}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    
    setShowExportMenu(false);
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
    <>
      {/* Overlay for closing export menu */}
      {showExportMenu && (
        <div 
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setShowExportMenu(false)}
        />
      )}

      <div className="h-14 bg-[#09090b] border-b border-white/[0.08] flex items-center justify-between px-5 z-40 relative select-none">
        {/* Left section: Logo & Actions */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3 pr-5 border-r border-white/[0.08]">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-base tracking-tight text-white">
              YvCode
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleNewSnap}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-all"
              title="New (⌘N)"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={handleImportJSON}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-all"
              title="Open File (⌘O)"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
              </svg>
            </button>
            
            <div className="relative">
              <button
                ref={recentButtonRef}
                onClick={toggleRecentSnaps}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
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
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-4">
          <input
            type="text"
            value={snap.meta.title}
            onChange={(e) => updateMeta({ title: e.target.value })}
            className="bg-transparent text-sm font-medium text-center text-neutral-200 focus:text-white px-3 py-1.5 outline-none rounded-md hover:bg-white/5 focus:bg-white/10 transition-colors placeholder-neutral-600 w-48 border border-transparent focus:border-white/10"
            placeholder="Untitled Project"
          />
          <div className="h-4 w-px bg-white/10" />
           <div className="relative group/aspect">
             <select
                value={snap.meta.aspect}
                onChange={handleAspectChange}
                className="bg-transparent text-xs font-medium text-neutral-400 hover:text-white px-2 py-1 outline-none cursor-pointer appearance-none text-center transition-colors"
              >
                {aspectOptions.map((ratio) => (
                  <option key={ratio.name} value={ratio.name}>
                    {ratio.name}
                  </option>
                ))}
              </select>
          </div>
        </div>

        {/* Right section: History & Export */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <button
              onClick={undo}
              disabled={history.past.length === 0}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:hover:bg-transparent active:scale-95"
              title="Undo (⌘Z)"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>
            <button
              onClick={redo}
              disabled={history.future.length === 0}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:hover:bg-transparent active:scale-95"
              title="Redo (⇧⌘Z)"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
              </svg>
            </button>
          </div>
          
          <div className="h-6 w-px bg-white/10" />

          <div className="relative z-50">
            <button
              ref={exportButtonRef}
              onClick={() => setShowExportMenu(!showExportMenu)}
              className={`flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 border group ${
                showExportMenu
                  ? 'bg-blue-600/10 text-blue-400 border-blue-500/50 shadow-[0_0_20px_rgba(37,99,235,0.3)]'
                  : 'bg-white/5 text-neutral-300 hover:text-white hover:bg-white/10 border-white/5 hover:border-white/10'
              }`}
            >
              <span>Export</span>
              <div className={`p-0.5 rounded-md transition-all duration-200 ${showExportMenu ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-neutral-400 group-hover:text-white'}`}>
                <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${showExportMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-3 w-72 bg-[#09090b]/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl shadow-black/50 p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150 origin-top-right ring-1 ring-white/5 z-50">
                <div className="px-3 py-2">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Download Image</span>
                </div>
                
                <div className="grid grid-cols-1 gap-1.5 px-1">
                  <button
                    onClick={() => handleExportImage('png', 2)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.02] hover:border-white/10 transition-all group active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <span className="font-bold text-[10px]">PNG</span>
                      </div>
                      <div className="flex flex-col items-start gap-0.5">
                        <span className="text-sm font-medium text-neutral-200 group-hover:text-white transition-colors">PNG Image</span>
                        <span className="text-[10px] text-neutral-500">High quality (2x)</span>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleExportImage('jpeg', 2)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.02] hover:border-white/10 transition-all group active:scale-[0.98]"
                  >
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <span className="font-bold text-[10px]">JPG</span>
                      </div>
                      <div className="flex flex-col items-start gap-0.5">
                        <span className="text-sm font-medium text-neutral-200 group-hover:text-white transition-colors">JPEG Image</span>
                        <span className="text-[10px] text-neutral-500">Standard quality</span>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-2" />

                <div className="px-3 py-1.5">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Project File</span>
                </div>

                <div className="px-1 pb-1">
                  <button
                    onClick={handleExportJSON}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.02] hover:border-white/10 transition-all group active:scale-[0.98]"
                  >
                     <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 text-yellow-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </div>
                      <div className="flex flex-col items-start gap-0.5">
                        <span className="text-sm font-medium text-neutral-200 group-hover:text-white transition-colors">Save Project</span>
                        <span className="text-[10px] text-neutral-500">Edit later (.json)</span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default memo(TopBar);
