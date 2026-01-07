import React from 'react';
import { useCanvasStore } from '../../store/canvasStore';

const GRADIENT_PRESETS = [
  { from: '#101022', to: '#1f1f3a', name: 'Midnight' },
  { from: '#0f172a', to: '#1e3a5f', name: 'Ocean' },
  { from: '#1a1a2e', to: '#16213e', name: 'Deep Blue' },
  { from: '#0f0f0f', to: '#232323', name: 'Charcoal' },
  { from: '#1a1a1a', to: '#2d2d2d', name: 'Dark' },
  { from: '#2d1b4e', to: '#1a1a2e', name: 'Purple' },
  { from: '#1e3c72', to: '#2a5298', name: 'Royal' },
  { from: '#134e5e', to: '#71b280', name: 'Teal' },
  { from: '#f5f5f5', to: '#e0e0e0', name: 'Light' },
  { from: '#ffffff', to: '#f0f0f0', name: 'White' },
];

const BackgroundPanel: React.FC = () => {
  const { snap, setBackground } = useCanvasStore();
  const { background } = snap;

  return (
    <div className="space-y-4">
      {/* Background type */}
      <div>
        <label className="block text-sm text-neutral-400 mb-2">Type</label>
        <div className="flex gap-2">
          <button
            onClick={() => setBackground({ type: 'solid' })}
            className={`flex-1 py-2 rounded text-sm ${
              background.type === 'solid'
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
            }`}
          >
            Solid
          </button>
          <button
            onClick={() => setBackground({ type: 'gradient' })}
            className={`flex-1 py-2 rounded text-sm ${
              background.type === 'gradient'
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
            }`}
          >
            Gradient
          </button>
        </div>
      </div>

      {background.type === 'solid' ? (
        <div>
          <label className="block text-sm text-neutral-400 mb-2">Color</label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={background.solid.color}
              onChange={(e) => setBackground({ solid: { color: e.target.value } })}
              className="w-10 h-10 rounded cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={background.solid.color}
              onChange={(e) => setBackground({ solid: { color: e.target.value } })}
              className="flex-1 bg-neutral-700 text-white px-3 py-2 rounded text-sm"
            />
          </div>
        </div>
      ) : (
        <>
          <div>
            <label className="block text-sm text-neutral-400 mb-2">Presets</label>
            <div className="grid grid-cols-5 gap-2">
              {GRADIENT_PRESETS.map((preset, i) => (
                <button
                  key={i}
                  onClick={() => setBackground({
                    gradient: { ...background.gradient, from: preset.from, to: preset.to }
                  })}
                  className="w-10 h-10 rounded border border-neutral-600 hover:border-blue-500 transition-colors"
                  style={{
                    background: `linear-gradient(135deg, ${preset.from}, ${preset.to})`
                  }}
                  title={preset.name}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-neutral-400 mb-2">From</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={background.gradient.from}
                  onChange={(e) => setBackground({
                    gradient: { ...background.gradient, from: e.target.value }
                  })}
                  className="w-8 h-8 rounded cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={background.gradient.from}
                  onChange={(e) => setBackground({
                    gradient: { ...background.gradient, from: e.target.value }
                  })}
                  className="flex-1 bg-neutral-700 text-white px-2 py-1.5 rounded text-xs"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-2">To</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={background.gradient.to}
                  onChange={(e) => setBackground({
                    gradient: { ...background.gradient, to: e.target.value }
                  })}
                  className="w-8 h-8 rounded cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={background.gradient.to}
                  onChange={(e) => setBackground({
                    gradient: { ...background.gradient, to: e.target.value }
                  })}
                  className="flex-1 bg-neutral-700 text-white px-2 py-1.5 rounded text-xs"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-2">
              Angle: {background.gradient.angle}°
            </label>
            <input
              type="range"
              min="0"
              max="360"
              value={background.gradient.angle}
              onChange={(e) => setBackground({
                gradient: { ...background.gradient, angle: parseInt(e.target.value) }
              })}
              className="w-full"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default BackgroundPanel;
