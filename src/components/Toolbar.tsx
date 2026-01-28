import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { useCanvasStore } from '../store/canvasStore';

const Toolbar: React.FC = () => {
  const { tool, setTool, showGrid, setShowGrid, zoom, setZoom } = useCanvasStore();

  const tools = [
    { 
      id: 'select', 
      label: 'Select',
      shortcut: 'V',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
      )
    },
    { 
      id: 'code', 
      label: 'Code Block',
      shortcut: 'C',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      )
    },
    { 
      id: 'text', 
      label: 'Text',
      shortcut: 'T',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      )
    },
    { 
      id: 'arrow', 
      label: 'Arrow',
      shortcut: 'A',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      )
    },
  ] as const;

  const renderTooltip = (label: string, shortcut?: string) => (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        side="top"
        align="center"
        sideOffset={10}
        className="z-50 rounded-lg bg-neutral-900 px-2.5 sm:px-3 py-1.5 text-white text-[11px] shadow-lg flex items-center gap-2 max-w-[240px]"
      >
        <span className="leading-tight break-keep">{label}</span>
        {shortcut && <span className="text-[10px] sm:text-xs font-semibold text-white/70 whitespace-nowrap">{shortcut}</span>}
        <TooltipPrimitive.Arrow className="fill-neutral-900" width={10} height={5} />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );

  return (
    <TooltipPrimitive.Provider delayDuration={150} disableHoverableContent>
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-white text-neutral-900 shadow-[0_10px_28px_rgba(0,0,0,0.22)] border border-black/5 z-50">
        {/* Tools Group */}
        <div className="flex items-center gap-1">
          {tools.map(({ id, icon, label, shortcut }) => (
            <TooltipPrimitive.Root key={id}>
              <TooltipPrimitive.Trigger asChild>
                <button
                  onClick={() => setTool(id)}
                  className={`group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 border ${
                    tool === id
                      ? 'bg-[#2d7df4] text-white border-transparent shadow-[0_8px_20px_rgba(45,125,244,0.32)] scale-100'
                      : 'bg-white text-neutral-700 hover:bg-neutral-100 border-transparent active:scale-95'
                  }`}
                  aria-label={label}
                >
                  {React.cloneElement(icon as React.ReactElement, { className: 'w-4.5 h-4.5' })}
                </button>
              </TooltipPrimitive.Trigger>
              {renderTooltip(label, shortcut)}
            </TooltipPrimitive.Root>
          ))}
        </div>

        <div className="w-px h-7 bg-neutral-200 mx-1.5" />

        {/* Grid Toggle */}
        <TooltipPrimitive.Root>
          <TooltipPrimitive.Trigger asChild>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 border ${
                showGrid
                  ? 'bg-neutral-900 text-white border-neutral-800 shadow-[0_8px_20px_rgba(0,0,0,0.2)]'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100 border-transparent active:scale-95'
              }`}
              aria-label="Toggle Grid"
            >
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM9 4v16M15 4v16M4 9h16M4 15h16" />
              </svg>
            </button>
          </TooltipPrimitive.Trigger>
          {renderTooltip('Grille', '⌘ ;')}
        </TooltipPrimitive.Root>

        {/* Zoom Controls */}
        <div className="flex items-center gap-0.5 bg-neutral-100 rounded-xl px-1 py-0.5 ml-1 border border-neutral-200">
          <TooltipPrimitive.Root>
            <TooltipPrimitive.Trigger asChild>
              <button
                onClick={() => setZoom(zoom - 0.1)}
                className="group relative w-7 h-7 rounded-lg flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:bg-white transition-colors"
                aria-label="Zoom Out"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
            </TooltipPrimitive.Trigger>
            {renderTooltip('Zoom Out', '⌘ -')}
          </TooltipPrimitive.Root>
          <div className="w-11 text-[11px] font-semibold text-neutral-800 text-center select-none tabular-nums">
            {Math.round(zoom * 100)}%
          </div>
          <TooltipPrimitive.Root>
            <TooltipPrimitive.Trigger asChild>
              <button
                onClick={() => setZoom(zoom + 0.1)}
                className="group relative w-7 h-7 rounded-lg flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:bg-white transition-colors"
                aria-label="Zoom In"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </TooltipPrimitive.Trigger>
            {renderTooltip('Zoom In', '⌘ +')}
          </TooltipPrimitive.Root>
        </div>
      </div>
    </TooltipPrimitive.Provider>
  );
};

export default Toolbar;
