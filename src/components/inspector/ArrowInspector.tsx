import React from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import type { ArrowElement } from '../../types';

interface ArrowInspectorProps {
  element: ArrowElement;
}

const ArrowInspector: React.FC<ArrowInspectorProps> = ({ element }) => {
  const { updateElement } = useCanvasStore();

  const update = (updates: Partial<ArrowElement>) => {
    updateElement(element.id, updates);
  };

  const updateProps = (props: Partial<ArrowElement['props']>) => {
    update({ props: { ...element.props, ...props } });
  };

  return (
    <div className="space-y-4">
      {/* Style */}
      <div>
        <label className="block text-sm text-neutral-400 mb-2">Style</label>
        <div className="flex gap-2">
          <button
            onClick={() => updateProps({ style: 'straight' })}
            className={`flex-1 py-2 rounded text-sm ${
              element.props.style === 'straight'
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-700 text-neutral-300'
            }`}
          >
            Straight
          </button>
          <button
            onClick={() => updateProps({ style: 'curved' })}
            className={`flex-1 py-2 rounded text-sm ${
              element.props.style === 'curved'
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-700 text-neutral-300'
            }`}
          >
            Curved
          </button>
        </div>
      </div>

      {/* Color */}
      <div>
        <label className="block text-sm text-neutral-400 mb-2">Color</label>
        <div className="flex gap-2 items-center">
          <input
            type="color"
            value={element.props.color}
            onChange={(e) => updateProps({ color: e.target.value })}
            className="w-10 h-10 rounded cursor-pointer bg-transparent"
          />
          <input
            type="text"
            value={element.props.color}
            onChange={(e) => updateProps({ color: e.target.value })}
            className="flex-1 bg-neutral-700 text-white px-3 py-2 rounded text-sm"
          />
        </div>
      </div>

      {/* Thickness */}
      <div>
        <label className="block text-sm text-neutral-400 mb-2">
          Thickness: {element.props.thickness}px
        </label>
        <input
          type="range"
          value={element.props.thickness}
          onChange={(e) => updateProps({ thickness: parseInt(e.target.value) })}
          className="w-full"
          min={1}
          max={12}
        />
      </div>

      {/* Arrow head */}
      <div>
        <label className="block text-sm text-neutral-400 mb-2">Arrow Head</label>
        <div className="flex gap-2">
          <button
            onClick={() => updateProps({ head: 'filled' })}
            className={`flex-1 py-2 rounded text-sm ${
              element.props.head === 'filled'
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-700 text-neutral-300'
            }`}
          >
            Filled
          </button>
          <button
            onClick={() => updateProps({ head: 'outline' })}
            className={`flex-1 py-2 rounded text-sm ${
              element.props.head === 'outline'
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-700 text-neutral-300'
            }`}
          >
            Outline
          </button>
          <button
            onClick={() => updateProps({ head: 'none' })}
            className={`flex-1 py-2 rounded text-sm ${
              element.props.head === 'none'
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-700 text-neutral-300'
            }`}
          >
            None
          </button>
        </div>
      </div>

      {/* Points info */}
      <div>
        <label className="block text-sm text-neutral-400 mb-2">Points</label>
        <p className="text-xs text-neutral-500">
          Drag the blue handles on the canvas to adjust arrow points.
        </p>
      </div>
    </div>
  );
};

export default ArrowInspector;
