import React, { useState, useEffect, useCallback } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import NumberField from '../ui/NumberField';

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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Canvas Size</label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white/5 px-3 py-3 rounded-lg border border-white/10">
        <div className="flex items-center gap-3">
          <label className="text-[11px] uppercase tracking-wide text-neutral-500">W</label>
          <NumberField
            value={draft.width === '' ? '' : Number(draft.width)}
            onChange={(v) => updateWidth(v === '' ? '' : String(v))}
            min={MIN_CANVAS}
            max={MAX_CANVAS}
            step={10}
            className="max-w-[160px]"
          />
          <span className="text-neutral-500 text-xs">px</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-[11px] uppercase tracking-wide text-neutral-500">H</label>
          <NumberField
            value={draft.height === '' ? '' : Number(draft.height)}
            onChange={(v) => updateHeight(v === '' ? '' : String(v))}
            min={MIN_CANVAS}
            max={MAX_CANVAS}
            step={10}
            className="max-w-[160px]"
          />
          <span className="text-neutral-500 text-xs">px</span>
        </div>
      </div>
    </div>
  );
};

export default CanvasSizePanel;
