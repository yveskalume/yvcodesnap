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
    <div className="w-72 bg-neutral-800 border-l border-neutral-700 overflow-y-auto">
      <div className="p-4">
        {selectedElement ? (
          <>
            {/* Element header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium capitalize">
                {selectedElement.type} Element
              </h3>
              <div className="flex gap-1">
                <button
                  onClick={() => moveElementDown(selectedElement.id)}
                  className="p-1.5 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white"
                  title="Move Back"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
                <button
                  onClick={() => moveElementUp(selectedElement.id)}
                  className="p-1.5 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white"
                  title="Move Front"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </button>
                <button
                  onClick={() => duplicateElement(selectedElement.id)}
                  className="p-1.5 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white"
                  title="Duplicate (⌘D)"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  onClick={() => deleteElement(selectedElement.id)}
                  className="p-1.5 hover:bg-red-600 rounded text-neutral-400 hover:text-white"
                  title="Delete (⌫)"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Element-specific inspector */}
            {selectedElement.type === 'code' && (
              <CodeInspector element={selectedElement as CodeElement} />
            )}
            {selectedElement.type === 'text' && (
              <TextInspector element={selectedElement as TextElement} />
            )}
            {selectedElement.type === 'arrow' && (
              <ArrowInspector element={selectedElement as ArrowElement} />
            )}
          </>
        ) : (
          <>
            <h3 className="text-white font-medium mb-4">Canvas Settings</h3>
            <BackgroundPanel />
          </>
        )}
      </div>
    </div>
  );
};

export default Inspector;
