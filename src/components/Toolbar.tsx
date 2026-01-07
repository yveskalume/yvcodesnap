import React from 'react';
import { useCanvasStore } from '../store/canvasStore';

const Toolbar: React.FC = () => {
  const { tool, setTool, showGrid, setShowGrid, zoom, setZoom } = useCanvasStore();

  const tools = [
    { 
      id: 'select', 
      label: 'Select (V)',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
      )
    },
    { 
      id: 'code', 
      label: 'Code Block (C)',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      )
    },
    { 
      id: 'text', 
      label: 'Text (T)',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      )
    },
    { 
      id: 'arrow', 
      label: 'Arrow (A)',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      )
    },
  ] as const;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 rounded-2xl bg-neutral-900/90 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50 z-50">
      
      {/* Tools Group */}
      <div className="flex items-center gap-1">
        {tools.map(({ id, icon, label }) => (
          <button
            key={id}
            onClick={() => setTool(id)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
              tool === id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-100 ring-1 ring-blue-500/50'
                : 'text-neutral-400 hover:text-white hover:bg-white/5 active:scale-95'
            }`}
            title={label}
          >
            {icon}
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-white/10 mx-2" />

      {/* Grid Toggle */}
      <button
        onClick={() => setShowGrid(!showGrid)}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
          showGrid
            ? 'bg-white/10 text-white ring-1 ring-white/20'
            : 'text-neutral-400 hover:text-white hover:bg-white/5 active:scale-95'
        }`}
        title="Toggle Grid (⌘;)"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM9 4v16M15 4v16M4 9h16M4 15h16" />
        </svg>
      </button>

      {/* Zoom Controls */}
      <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 ml-1">
        <button
          onClick={() => setZoom(zoom - 0.1)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Zoom Out (⌘-)"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <div className="w-12 text-xs font-medium text-neutral-300 text-center select-none tabular-nums">
          {Math.round(zoom * 100)}%
        </div>
        <button
          onClick={() => setZoom(zoom + 0.1)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Zoom In (⌘+)"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
