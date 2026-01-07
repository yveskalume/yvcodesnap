import React from 'react';
import { useCanvasStore } from '../store/canvasStore';
import type { CodeElement, TextElement, ArrowElement } from '../types';
import BackgroundPanel from './inspector/BackgroundPanel';
import CodeInspector from './inspector/CodeInspector';
import TextInspector from './inspector/TextInspector';
import ArrowInspector from './inspector/ArrowInspector';

const Inspector: React.FC = () => {
  const { 
    snap, 
    selectedElementId, 
    deleteElement, 
    duplicateElement,
    moveElementUp,
    moveElementDown,
  } = useCanvasStore();

  const selectedElement = snap.elements.find(el => el.id === selectedElementId);

  return (
    <div className="w-80 bg-[#09090b] border-l border-white/5 overflow-y-auto h-full">
      <div className="p-6">
        {selectedElement ? (
          <div className="space-y-6">
            {/* Header with Title and Element Actions */}
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
                {selectedElement.type}
              </h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => duplicateElement(selectedElement.id)}
                  className="p-1.5 hover:bg-white/10 rounded-md text-neutral-400 hover:text-white transition-colors"
                  title="Duplicate (⌘D)"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <div className="w-px h-3 bg-white/10 mx-1" />
                <button
                  onClick={() => deleteElement(selectedElement.id)}
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
                  onClick={() => moveElementDown(selectedElement.id)}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium text-neutral-400 hover:text-white transition-colors border border-white/5"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  Send Backward
                </button>
                <button
                  onClick={() => moveElementUp(selectedElement.id)}
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
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Canvas Settings</h3>
            <BackgroundPanel />
          </div>
        )}
      </div>
    </div>
  );
};
export default Inspector;
