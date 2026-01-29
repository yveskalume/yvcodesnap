import React, { useState, useEffect, useCallback } from 'react';
import { useCanvasStore } from '../../store/canvasStore';

const MIN_CANVAS = 320;
const MAX_CANVAS = 10000;

const CanvasSizePanel: React.FC = () => {
  const { snap, updateMeta } = useCanvasStore();
  const [draft, setDraft] = useState({ width: String(snap.meta.width), height: String(snap.meta.height) });

  useEffect(() => {
    setDraft({ width: String(snap.meta.width), height: String(snap.meta.height) });
  }, [snap.meta.width, snap.meta.height]);

  const clamp = (value: number, fallback: number) =>
    Math.min(MAX_CANVAS, Math.max(MIN_CANVAS, Math.round(value) || fallback));

  const applySize = useCallback(
    (w: number, h: number) => {
      const width = clamp(w, snap.meta.width);
      const height = clamp(h, snap.meta.height);
      updateMeta({
        width,
        height,
        aspect: `Custom ${width}x${height}`,
      });
    },
    [updateMeta, snap.meta.width, snap.meta.height]
  );

  const updateWidth = (value: string) => {
    setDraft((s) => ({ ...s, width: value }));
    const parsed = parseInt(value, 10);
    if (!Number.isNaN(parsed)) {
      applySize(parsed, parseInt(draft.height, 10));
    }
  };

  const updateHeight = (value: string) => {
    setDraft((s) => ({ ...s, height: value }));
    const parsed = parseInt(value, 10);
    if (!Number.isNaN(parsed)) {
      applySize(parseInt(draft.width, 10), parsed);
    }
  };

  const handleBlur = (field: 'width' | 'height') => {
    const parsed = parseInt(draft[field], 10);
    if (Number.isNaN(parsed)) {
      setDraft({
        width: String(snap.meta.width),
        height: String(snap.meta.height),
      });
      return;
    }
    applySize(
      field === 'width' ? parsed : parseInt(draft.width, 10),
      field === 'height' ? parsed : parseInt(draft.height, 10)
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Canvas Size</label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white/5 px-3 py-3 rounded-lg border border-white/10">
        <div className="flex items-center gap-3">
          <label className="text-[11px] uppercase tracking-wide text-neutral-500">W</label>
          <input
            type="number"
            min={MIN_CANVAS}
            max={MAX_CANVAS}
            value={draft.width}
            onChange={(e) => updateWidth(e.target.value)}
            onBlur={() => handleBlur('width')}
            className="w-full text-[11px] max-w-[140px] bg-transparent text-sm text-neutral-100 focus:outline-none"
          />
          <span className="text-neutral-500 text-xs">px</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-[11px] uppercase tracking-wide text-neutral-500">H</label>
          <input
            type="number"
            min={MIN_CANVAS}
            max={MAX_CANVAS}
            value={draft.height}
            onChange={(e) => updateHeight(e.target.value)}
            onBlur={() => handleBlur('height')}
            className="w-full text-[11px] max-w-[140px] bg-transparent text-sm text-neutral-100 focus:outline-none"
          />
          <span className="text-neutral-500 text-xs">px</span>
        </div>
      </div>
    </div>
  );
};

export default CanvasSizePanel;
