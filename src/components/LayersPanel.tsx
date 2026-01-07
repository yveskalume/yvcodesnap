import React from 'react';
import { useCanvasStore } from '../store/canvasStore';
import type { CanvasElement } from '../types';

const LayersPanel: React.FC = () => {
  const {
    snap,
    selectedElementId,
    selectElement,
    updateElement,
    moveElementUp,
    moveElementDown,
    deleteElement,
  } = useCanvasStore();

  const elements = [...snap.elements].reverse(); // Show top layers first

  const getElementIcon = (type: CanvasElement['type']) => {
    switch (type) {
      case 'code':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        );
      case 'text':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
          </svg>
        );
      case 'arrow':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        );
    }
  };

  const getElementLabel = (element: CanvasElement) => {
    switch (element.type) {
      case 'code':
        return `Code Block`;
      case 'text':
        return element.props.text.slice(0, 20) + (element.props.text.length > 20 ? '...' : '');
      case 'arrow':
        return `Arrow`;
    }
  };

  return (
    <div className="w-56 bg-[#09090b] border-r border-white/5 flex flex-col h-full">
      <div className="p-4 border-b border-white/5">
        <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Layers</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {elements.length === 0 ? (
          <div className="text-neutral-500 text-xs text-center py-8">
            No elements yet.
            <br />
            Click on the canvas to add elements.
          </div>
        ) : (
          <div className="space-y-1">
            {elements.map((element) => (
              <div
                key={element.id}
                onClick={() => selectElement(element.id)}
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                  selectedElementId === element.id
                    ? 'bg-blue-600/20 border border-blue-500/50'
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                {/* Element type icon */}
                <div className={`shrink-0 ${selectedElementId === element.id ? 'text-blue-400' : 'text-neutral-400'}`}>
                  {getElementIcon(element.type)}
                </div>

                {/* Element name */}
                <span className={`flex-1 text-sm truncate ${
                  selectedElementId === element.id ? 'text-white' : 'text-neutral-300'
                } ${!element.visible ? 'opacity-50' : ''}`}>
                  {getElementLabel(element)}
                </span>

                {/* Action buttons */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Lock toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateElement(element.id, { locked: !element.locked });
                    }}
                    className={`p-1 rounded hover:bg-white/10 transition-colors ${
                      element.locked ? 'text-yellow-400' : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                    title={element.locked ? 'Unlock' : 'Lock'}
                  >
                    {element.locked ? (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>

                  {/* Visibility toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateElement(element.id, { visible: !element.visible });
                    }}
                    className={`p-1 rounded hover:bg-white/10 transition-colors ${
                      element.visible ? 'text-neutral-500 hover:text-neutral-300' : 'text-red-400'
                    }`}
                    title={element.visible ? 'Hide' : 'Show'}
                  >
                    {element.visible ? (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Layer actions footer */}
      {selectedElementId && (
        <div className="p-3 border-t border-white/5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-1">
              <button
                onClick={() => moveElementDown(selectedElementId)}
                className="p-1.5 rounded-md hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                title="Move Down (Back)"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
              <button
                onClick={() => moveElementUp(selectedElementId)}
                className="p-1.5 rounded-md hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                title="Move Up (Front)"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
            </div>
            <button
              onClick={() => deleteElement(selectedElementId)}
              className="p-1.5 rounded-md hover:bg-red-500/10 text-neutral-400 hover:text-red-400 transition-colors"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LayersPanel;
