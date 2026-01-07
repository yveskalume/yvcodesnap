import React from 'react';
import { useCanvasStore } from '../store/canvasStore';

const Toolbar: React.FC = () => {
  const { tool, setTool, showGrid, setShowGrid, zoom, setZoom } = useCanvasStore();

  const tools = [
    { id: 'select', icon: '↖', label: 'Select (V)' },
    { id: 'code', icon: '{ }', label: 'Code Block (C)' },
    { id: 'text', icon: 'T', label: 'Text (T)' },
    { id: 'arrow', icon: '→', label: 'Arrow (A)' },
  ] as const;

  return (
    <div className="w-14 bg-neutral-800 border-r border-neutral-700 flex flex-col items-center py-4 gap-2">
      {/* Tools */}
      <div className="flex flex-col gap-1">
        {tools.map(({ id, icon, label }) => (
          <button
            key={id}
            onClick={() => setTool(id)}
            className={`w-10 h-10 rounded flex items-center justify-center text-lg transition-colors ${
              tool === id
                ? 'bg-blue-600 text-white'
                : 'text-neutral-400 hover:bg-neutral-700 hover:text-white'
            }`}
            title={label}
          >
            {icon}
          </button>
        ))}
      </div>

      <div className="h-px w-8 bg-neutral-600 my-2" />

      {/* Grid toggle */}
      <button
        onClick={() => setShowGrid(!showGrid)}
        className={`w-10 h-10 rounded flex items-center justify-center transition-colors ${
          showGrid
            ? 'bg-neutral-600 text-white'
            : 'text-neutral-400 hover:bg-neutral-700 hover:text-white'
        }`}
        title="Toggle Grid (⌘;)"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM9 4v16M15 4v16M4 9h16M4 15h16" />
        </svg>
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Zoom controls */}
      <div className="flex flex-col gap-1">
        <button
          onClick={() => setZoom(zoom + 0.1)}
          className="w-10 h-10 rounded flex items-center justify-center text-neutral-400 hover:bg-neutral-700 hover:text-white transition-colors"
          title="Zoom In (⌘+)"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
          </svg>
        </button>
        <div className="text-xs text-neutral-400 text-center py-1">
          {Math.round(zoom * 100)}%
        </div>
        <button
          onClick={() => setZoom(zoom - 0.1)}
          className="w-10 h-10 rounded flex items-center justify-center text-neutral-400 hover:bg-neutral-700 hover:text-white transition-colors"
          title="Zoom Out (⌘-)"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
