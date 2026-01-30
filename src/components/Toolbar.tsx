import React, { useMemo, useRef, useState, useEffect } from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { useCanvasStore } from '../store/canvasStore';

type ToolId = 'select' | 'code' | 'text' | 'arrow' | 'rectangle' | 'ellipse' | 'line' | 'polygon' | 'star';

interface ToolConfig {
  id: ToolId;
  label: string;
  shortcut?: string;
  icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
}

const Toolbar: React.FC = () => {
  const { tool, setTool, showGrid, setShowGrid, zoom, setZoom } = useCanvasStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const tools: ToolConfig[] = [
    { 
      id: 'select', 
      label: 'Select',
      shortcut: 'V',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
      ) as React.ReactElement<React.SVGProps<SVGSVGElement>>
    },
    { 
      id: 'code', 
      label: 'Code Block',
      shortcut: 'C',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ) as React.ReactElement<React.SVGProps<SVGSVGElement>>
    },
    { 
      id: 'text', 
      label: 'Text',
      shortcut: 'T',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      ) as React.ReactElement<React.SVGProps<SVGSVGElement>>
    },
  ];

  const shapeTools: ToolConfig[] = [
    {
      id: 'rectangle',
      label: 'Rectangle',
      shortcut: 'R',
      icon: (
        <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="5" y="5" width="14" height="14" rx="2" />
        </svg>
      ) as React.ReactElement<React.SVGProps<SVGSVGElement>>
    },
    {
      id: 'line',
      label: 'Line',
      shortcut: 'L',
      icon: (
        <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 19 19 5" strokeLinecap="round" />
        </svg>
      ) as React.ReactElement<React.SVGProps<SVGSVGElement>>
    },
    {
      id: 'arrow',
      label: 'Arrow',
      shortcut: 'Shift+L',
      icon: (
        <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 19 19 5m0 0h-6m6 0v6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) as React.ReactElement<React.SVGProps<SVGSVGElement>>
    },
    {
      id: 'ellipse',
      label: 'Ellipse',
      shortcut: 'O',
      icon: (
        <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <ellipse cx="12" cy="12" rx="7" ry="9" />
        </svg>
      ) as React.ReactElement<React.SVGProps<SVGSVGElement>>
    },
    {
      id: 'polygon',
      label: 'Polygon',
      shortcut: 'Shift+O',
      icon: (
        <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3 20 8v8l-8 5-8-5V8z" />
        </svg>
      ) as React.ReactElement<React.SVGProps<SVGSVGElement>>
    },
    {
      id: 'star',
      label: 'Star',
      shortcut: '',
      icon: (
        <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m12 3 2.6 5.9 6.4.6-4.8 4.2 1.4 6.3L12 17.5 6.4 20l1.4-6.3L3 9.5l6.4-.6Z" />
        </svg>
      ) as React.ReactElement<React.SVGProps<SVGSVGElement>>
    },
  ];

  const activeDrawingTool = useMemo(() => {
    const found = shapeTools.find((t) => t.id === tool);
    return found || shapeTools[0];
  }, [tool]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!menuOpen) return;
      if (
        menuRef.current &&
        triggerRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

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
                  {React.cloneElement<React.SVGProps<SVGSVGElement>>(icon, { className: 'w-4.5 h-4.5' })}
                </button>
              </TooltipPrimitive.Trigger>
              {renderTooltip(label, shortcut)}
            </TooltipPrimitive.Root>
          ))}

          {/* Shape/Arrow picker */}
          <div className="relative">
            <button
              ref={triggerRef}
              onClick={() => setMenuOpen((o) => !o)}
              className={`group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 border ${
                menuOpen || shapeTools.some((t) => t.id === tool)
                  ? 'bg-[#2d7df4] text-white border-transparent shadow-[0_8px_20px_rgba(45,125,244,0.32)]'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100 border-transparent active:scale-95'
              }`}
              aria-label="Shapes"
            >
              {React.cloneElement<React.SVGProps<SVGSVGElement>>(activeDrawingTool.icon, { className: 'w-4.5 h-4.5' })}
              <svg className="absolute right-1.5 bottom-1.5 w-2.5 h-2.5 text-current opacity-80" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {menuOpen && (
              <div
                ref={menuRef}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 min-w-[200px] rounded-2xl border border-white/10 bg-[#0f1117] text-white shadow-[0_16px_40px_rgba(0,0,0,0.45)] py-1.5 px-1 z-50"
              >
                {shapeTools.map(({ id, icon, label, shortcut }) => {
                  const isActive = tool === id;
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        setTool(id);
                        setMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
                        isActive ? 'bg-white/10 text-white' : 'text-neutral-200 hover:bg-white/6'
                      }`}
                    >
                      <span className="w-4 h-4 flex items-center justify-center text-blue-400">
                        {isActive && (
                          <svg className="w-3 h-3" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 10.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      {React.cloneElement<React.SVGProps<SVGSVGElement>>(icon, { className: 'w-4.5 h-4.5' })}
                      <span className="flex-1 text-left">{label}</span>
                      {shortcut && <span className="text-[11px] text-neutral-400">{shortcut}</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
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
