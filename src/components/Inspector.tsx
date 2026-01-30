import React, { memo, useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { useCanvasStore } from '../store/canvasStore';
import type { CodeElement, TextElement, ArrowElement, ShapeElement } from '../types';
import BackgroundPanel from './inspector/BackgroundPanel';
import CanvasSizePanel from './inspector/CanvasSizePanel';
import BrandingPanel from './inspector/BrandingPanel';
import CodeInspector from './inspector/CodeInspector';
import TextInspector from './inspector/TextInspector';
import ArrowInspector from './inspector/ArrowInspector';
import ShapeInspector from './inspector/ShapeInspector';

const DEFAULT_WIDTH = 320;
const MIN_WIDTH = 260;
const MAX_WIDTH = 520;
const EXPANDED_WIDTH = 420;

const Inspector: React.FC = () => {
  const [width, setWidth] = useState<number>(DEFAULT_WIDTH);
  const { 
    snap, 
    selectedElementId, 
    deleteElement, 
    duplicateElement,
    moveElementUp,
    moveElementDown,
  } = useCanvasStore();

  const dragStateRef = useRef({
    startX: 0,
    startWidth: DEFAULT_WIDTH,
    isDragging: false,
  });

  const selectedElement = useMemo(
    () => snap.elements.find(el => el.id === selectedElementId),
    [snap.elements, selectedElementId]
  );

  const handleResizeMove = useCallback((event: MouseEvent) => {
    if (!dragStateRef.current.isDragging) return;

    const delta = dragStateRef.current.startX - event.clientX;
    const nextWidth = Math.min(
      Math.max(dragStateRef.current.startWidth + delta, MIN_WIDTH),
      MAX_WIDTH
    );

    setWidth(nextWidth);
  }, []);

  const stopDragging = useCallback(() => {
    if (!dragStateRef.current.isDragging) return;

    dragStateRef.current.isDragging = false;
    window.removeEventListener('mousemove', handleResizeMove);
    window.removeEventListener('mouseup', stopDragging);
  }, [handleResizeMove]);

  const handleResizeStart = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragStateRef.current = {
      startX: event.clientX,
      startWidth: width,
      isDragging: true,
    };

    window.addEventListener('mousemove', handleResizeMove);
    window.addEventListener('mouseup', stopDragging);
  }, [width, handleResizeMove, stopDragging]);

  const handleHandleDoubleClick = useCallback(() => {
    setWidth(prev => (prev < EXPANDED_WIDTH ? EXPANDED_WIDTH : DEFAULT_WIDTH));
  }, []);

  useEffect(() => (
    () => {
      stopDragging();
    }
  ), [stopDragging]);
  
  const handleDelete = useCallback(() => {
    if (selectedElement) {
      deleteElement(selectedElement.id);
    }
  }, [selectedElement, deleteElement]);
  
  const handleDuplicate = useCallback(() => {
    if (selectedElement) {
      duplicateElement(selectedElement.id);
    }
  }, [selectedElement, duplicateElement]);
  
  const handleMoveUp = useCallback(() => {
    if (selectedElement) {
      moveElementUp(selectedElement.id);
    }
  }, [selectedElement, moveElementUp]);
  
  const handleMoveDown = useCallback(() => {
    if (selectedElement) {
      moveElementDown(selectedElement.id);
    }
  }, [selectedElement, moveElementDown]);

  return (
    <div
      className="relative flex-shrink-0 h-full bg-[#09090b] border-l border-white/5 transition-[width] duration-150 ease-out"
      style={{ width }}
    >
      <div
        className="absolute left-0 top-0 h-full w-2 cursor-col-resize group"
        onMouseDown={handleResizeStart}
        onDoubleClick={handleHandleDoubleClick}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize inspector"
      >
        <div className="mx-auto mt-1 h-full w-0.5 rounded-full bg-white/5 transition-all group-hover:bg-white/20" />
      </div>
      <div className="p-6 overflow-y-auto h-full">
        {selectedElement ? (
          <div className="space-y-6">
            {/* Header with Title and Element Actions */}
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
                {selectedElement.type === 'shape'
                  ? (selectedElement as ShapeElement).props.kind
                  : selectedElement.type}
              </h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleDuplicate}
                  className="p-1.5 hover:bg-white/10 rounded-md text-neutral-400 hover:text-white transition-colors"
                  title="Duplicate (⌘D)"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <div className="w-px h-3 bg-white/10 mx-1" />
                <button
                  onClick={handleDelete}
                  className="p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-md text-neutral-400 transition-colors"
                  title="Delete (⌫)"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

             {/* Layer Controls */}
             <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleMoveDown}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium text-neutral-400 hover:text-white transition-colors border border-white/5"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  Send Backward
                </button>
                <button
                  onClick={handleMoveUp}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium text-neutral-400 hover:text-white transition-colors border border-white/5"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  Bring Forward
                </button>
             </div>

             <div className="h-px bg-white/5 w-full -mx-2" />

            {/* Element-specific inspector */}
            <div className="inspector-content">
              {selectedElement.type === 'code' && (
                <CodeInspector element={selectedElement as CodeElement} />
              )}
              {selectedElement.type === 'text' && (
                <TextInspector element={selectedElement as TextElement} />
              )}
              {selectedElement.type === 'arrow' && (
                <ArrowInspector element={selectedElement as ArrowElement} />
              )}
              {selectedElement.type === 'shape' && (
                <ShapeInspector element={selectedElement as ShapeElement} />
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Canvas Settings</h3>
            <CanvasSizePanel />
            
            <div className="h-px bg-white/5 w-full" />
            <BackgroundPanel />
            
            <div className="h-px bg-white/5 w-full" />
            
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Branding</h3>
            <BrandingPanel />
          </div>
        )}
      </div>
    </div>
  );
};
export default memo(Inspector);
