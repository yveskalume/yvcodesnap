import React from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { FONT_FAMILIES } from '../../types';
import SelectField from '../ui/SelectField';

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
    <div className="space-y-6">
      {/* Background type */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">Type</label>
        <div className="flex gap-2 p-1 bg-white/5 rounded-lg border border-white/5">
          <button
            onClick={() => setBackground({ type: 'solid' })}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
              background.type === 'solid'
                ? 'bg-neutral-700 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Solid
          </button>
          <button
            onClick={() => setBackground({ type: 'gradient' })}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
              background.type === 'gradient'
                ? 'bg-neutral-700 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Gradient
          </button>
        </div>
      </div>

      {background.type === 'solid' ? (
        <div>
          <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Color</label>
          <div className="flex gap-2 items-center p-2 bg-white/5 rounded-lg border border-white/5">
             <div className="w-8 h-8 rounded overflow-hidden relative border border-white/10 shrink-0">
               <input
                type="color"
                value={background.solid.color}
                onChange={(e) => setBackground({ solid: { color: e.target.value } })}
                className="absolute inset-[-4px] w-[200%] h-[200%] cursor-pointer p-0 m-0 border-none"
              />
            </div>
            <input
              type="text"
              value={background.solid.color}
              onChange={(e) => setBackground({ solid: { color: e.target.value } })}
              className="flex-1 bg-transparent text-white text-sm focus:outline-none font-mono"
            />
          </div>
        </div>
      ) : (
        <>
          <div>
            <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">Presets</label>
            <div className="grid grid-cols-5 gap-2">
              {GRADIENT_PRESETS.map((preset, i) => (
                <button
                  key={i}
                  onClick={() => setBackground({
                    gradient: { ...background.gradient, from: preset.from, to: preset.to }
                  })}
                  className="w-full aspect-square rounded-lg border border-white/10 hover:border-white/40 transition-all hover:scale-105 shadow-sm"
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
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">From</label>
              <div className="flex gap-2 items-center p-2 bg-white/5 rounded-lg border border-white/5">
                 <div className="w-6 h-6 rounded overflow-hidden relative border border-white/10 shrink-0">
                    <input
                      type="color"
                      value={background.gradient.from}
                      onChange={(e) => setBackground({
                        gradient: { ...background.gradient, from: e.target.value }
                      })}
                      className="absolute inset-[-4px] w-[200%] h-[200%] cursor-pointer"
                    />
                 </div>
                 <input
                    type="text"
                    value={background.gradient.from}
                    onChange={(e) => setBackground({
                      gradient: { ...background.gradient, from: e.target.value }
                    })}
                     className="w-full bg-transparent text-white text-xs focus:outline-none font-mono"
                  />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">To</label>
               <div className="flex gap-2 items-center p-2 bg-white/5 rounded-lg border border-white/5">
                 <div className="w-6 h-6 rounded overflow-hidden relative border border-white/10 shrink-0">
                    <input
                      type="color"
                      value={background.gradient.to}
                      onChange={(e) => setBackground({
                        gradient: { ...background.gradient, from: e.target.value }
                      })}
                      className="absolute inset-[-4px] w-[200%] h-[200%] cursor-pointer"
                    />
                 </div>
                 <input
                    type="text"
                    value={background.gradient.to}
                    onChange={(e) => setBackground({
                      gradient: { ...background.gradient, from: e.target.value }
                    })}
                     className="w-full bg-transparent text-white text-xs focus:outline-none font-mono"
                  />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Angle: {background.gradient.angle}°</label>
            <input
              type="range"
              min="0"
              max="360"
              value={background.gradient.angle}
              onChange={(e) => setBackground({
                gradient: { ...background.gradient, angle: parseInt(e.target.value) }
              })}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </>
      )}

      {/* Brand Strip Section */}
      <div className="pt-4 border-t border-white/5">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider">Brand Strip</label>
          <button
            onClick={() => setBackground({
              brandStrip: { ...background.brandStrip, enabled: !background.brandStrip?.enabled }
            })}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              background.brandStrip?.enabled ? 'bg-blue-600' : 'bg-white/10'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                background.brandStrip?.enabled ? 'translate-x-4' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {background.brandStrip?.enabled && (
          <div className="space-y-4">
            {/* Position */}
            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Position</label>
              <div className="flex gap-2 p-1 bg-white/5 rounded-lg border border-white/5">
                <button
                  onClick={() => setBackground({
                    brandStrip: { ...background.brandStrip, position: 'top' }
                  })}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                    background.brandStrip.position === 'top'
                      ? 'bg-neutral-700 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Top
                </button>
                <button
                  onClick={() => setBackground({
                    brandStrip: { ...background.brandStrip, position: 'bottom' }
                  })}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                    background.brandStrip.position === 'bottom'
                      ? 'bg-neutral-700 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Bottom
                </button>
              </div>
            </div>

            {/* Height */}
            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
                Height: {background.brandStrip.height || 60}px
              </label>
              <input
                type="range"
                min="30"
                max="120"
                value={background.brandStrip.height || 60}
                onChange={(e) => setBackground({
                  brandStrip: { ...background.brandStrip, height: parseInt(e.target.value) }
                })}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Strip Color */}
            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Strip Color</label>
              <div className="flex gap-2 items-center p-2 bg-white/5 rounded-lg border border-white/5">
                <div className="w-6 h-6 rounded overflow-hidden relative border border-white/10 shrink-0">
                  <input
                    type="color"
                    value={background.brandStrip.color || '#000000'}
                    onChange={(e) => setBackground({
                      brandStrip: { ...background.brandStrip, color: e.target.value }
                    })}
                    className="absolute inset-[-4px] w-[200%] h-[200%] cursor-pointer"
                  />
                </div>
                <input
                  type="text"
                  value={background.brandStrip.color || '#000000'}
                  onChange={(e) => setBackground({
                    brandStrip: { ...background.brandStrip, color: e.target.value }
                  })}
                  className="w-full bg-transparent text-white text-xs focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Brand Text */}
            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Text</label>
              <input
                type="text"
                value={background.brandStrip.text || ''}
                onChange={(e) => setBackground({
                  brandStrip: { ...background.brandStrip, text: e.target.value }
                })}
                placeholder="@yourhandle"
                className="w-full bg-white/5 text-white px-3 py-2 rounded-lg text-sm border border-white/5 focus:border-blue-500/50 focus:outline-none"
              />
            </div>

            {/* Text Color */}
            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Text Color</label>
              <div className="flex gap-2 items-center p-2 bg-white/5 rounded-lg border border-white/5">
                <div className="w-6 h-6 rounded overflow-hidden relative border border-white/10 shrink-0">
                  <input
                    type="color"
                    value={background.brandStrip.textColor || '#ffffff'}
                    onChange={(e) => setBackground({
                      brandStrip: { ...background.brandStrip, textColor: e.target.value }
                    })}
                    className="absolute inset-[-4px] w-[200%] h-[200%] cursor-pointer"
                  />
                </div>
                <input
                  type="text"
                  value={background.brandStrip.textColor || '#ffffff'}
                  onChange={(e) => setBackground({
                    brandStrip: { ...background.brandStrip, textColor: e.target.value }
                  })}
                  className="w-full bg-transparent text-white text-xs focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Font Family */}
            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Font</label>
              <SelectField
                value={background.brandStrip.fontFamily || 'Inter'}
                onValueChange={(v) => setBackground({
                  brandStrip: { ...background.brandStrip, fontFamily: v }
                })}
                options={FONT_FAMILIES.brand.map((font) => ({
                  value: font,
                  label: <span style={{ fontFamily: font }}>{font}</span>,
                }))}
              />
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
                Font Size: {background.brandStrip.fontSize || 16}px
              </label>
              <input
                type="range"
                min="12"
                max="32"
                value={background.brandStrip.fontSize || 16}
                onChange={(e) => setBackground({
                  brandStrip: { ...background.brandStrip, fontSize: parseInt(e.target.value) }
                })}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackgroundPanel;
