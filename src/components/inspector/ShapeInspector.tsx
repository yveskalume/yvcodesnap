import React from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import type { ShapeElement } from '../../types';
import SliderField from '../ui/SliderField';
import ToggleSwitch from '../ui/ToggleSwitch';

const ShapeInspector: React.FC<{ element: ShapeElement }> = ({ element }) => {
  const { updateElement, saveToHistory } = useCanvasStore();
  const { props, width, height } = element;

  const updateProps = (newProps: Partial<ShapeElement['props']>) => {
    updateElement(element.id, { props: { ...props, ...newProps } });
  };

  const updateSize = (updates: Partial<Pick<ShapeElement, 'width' | 'height'>>) => {
    updateElement(element.id, updates);
  };

  const canFill = props.kind === 'rectangle' || props.kind === 'ellipse' || props.kind === 'polygon' || props.kind === 'star';

  return (
    <div className="space-y-4">
      {/* Dimensions */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-neutral-400 mb-1">Width</label>
          <input
            type="number"
            value={Math.round(width)}
            onChange={(e) => updateSize({ width: Math.max(1, Number(e.target.value) || width) })}
            onBlur={saveToHistory}
            className="w-full bg-white/5 text-white px-3 py-2 rounded-lg text-sm border border-white/5 focus:border-blue-500/50 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-neutral-400 mb-1">Height</label>
          <input
            type="number"
            value={Math.round(height)}
            onChange={(e) => updateSize({ height: Math.max(1, Number(e.target.value) || height) })}
            onBlur={saveToHistory}
            className="w-full bg-white/5 text-white px-3 py-2 rounded-lg text-sm border border-white/5 focus:border-blue-500/50 focus:outline-none"
          />
        </div>
      </div>

      {/* Stroke */}
      <div>
        <label className="block text-sm text-neutral-400 mb-2">Stroke</label>
        <div className="flex gap-2 items-center p-2 bg-white/5 rounded-lg border border-white/5">
          <div className="w-7 h-7 rounded overflow-hidden relative border border-white/10 shrink-0">
            <input
              type="color"
              value={props.stroke}
              onChange={(e) => updateProps({ stroke: e.target.value })}
              className="absolute inset-[-4px] w-[200%] h-[200%] cursor-pointer p-0 m-0 border-none"
            />
          </div>
          <input
            type="text"
            value={props.stroke}
            onChange={(e) => updateProps({ stroke: e.target.value })}
            className="flex-1 bg-transparent text-white text-sm focus:outline-none font-mono"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-neutral-400 mb-2">
          Stroke Width: {props.strokeWidth}px
        </label>
        <SliderField
          min={1}
          max={24}
          step={1}
          value={props.strokeWidth}
          onValueChange={(v) => updateProps({ strokeWidth: v })}
          ariaLabel="Stroke width"
        />
      </div>

      {/* Fill */}
      {canFill && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-neutral-400">Fill</label>
            <ToggleSwitch
              checked={!!props.fill && props.fill !== 'transparent'}
              onCheckedChange={(checked) =>
                updateProps({ fill: checked ? (props.fill && props.fill !== 'transparent' ? props.fill : '#60a5fa22') : 'transparent' })
              }
              ariaLabel="Toggle fill"
            />
          </div>
          <div className="flex gap-2 items-center p-2 bg-white/5 rounded-lg border border-white/5">
            <div className="w-7 h-7 rounded overflow-hidden relative border border-white/10 shrink-0">
              <input
                type="color"
                value={props.fill && props.fill !== 'transparent' ? props.fill : '#60a5fa22'}
                onChange={(e) => updateProps({ fill: e.target.value })}
                className="absolute inset-[-4px] w-[200%] h-[200%] cursor-pointer p-0 m-0 border-none"
              />
            </div>
            <input
              type="text"
              value={props.fill && props.fill !== 'transparent' ? props.fill : 'transparent'}
              onChange={(e) => updateProps({ fill: e.target.value })}
              className="flex-1 bg-transparent text-white text-sm focus:outline-none font-mono"
            />
          </div>
        </div>
      )}

      {/* Polygon / Star sides */}
      {(props.kind === 'polygon' || props.kind === 'star') && (
        <div>
          <label className="block text-sm text-neutral-400 mb-2">
            {props.kind === 'star' ? 'Points' : 'Sides'}: {props.sides || 5}
          </label>
          <SliderField
            min={3}
            max={10}
            step={1}
            value={props.sides || 5}
            onValueChange={(v) => updateProps({ sides: v })}
            ariaLabel="Polygon sides"
          />
        </div>
      )}
    </div>
  );
};

export default ShapeInspector;
