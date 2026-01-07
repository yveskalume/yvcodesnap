import React from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { FONT_FAMILIES } from '../../types';

const POSITION_OPTIONS = [
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-right', label: 'Bottom Right' },
] as const;

const SOCIAL_PLATFORMS = [
  { key: 'twitter', label: 'X (Twitter)', placeholder: '@username' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: '/in/username' },
  { key: 'instagram', label: 'Instagram', placeholder: '@username' },
  { key: 'github', label: 'GitHub', placeholder: 'username' },
  { key: 'youtube', label: 'YouTube', placeholder: '@channel' },
  { key: 'tiktok', label: 'TikTok', placeholder: '@username' },
] as const;

const BrandingPanel: React.FC = () => {
  const { snap, setBackground } = useCanvasStore();
  
  // Default branding values for backwards compatibility
  const defaultBranding = {
    enabled: false,
    position: 'bottom-right' as const,
    name: '',
    website: '',
    social: {},
    showName: true,
    showWebsite: true,
    showSocial: true,
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#ffffff',
    opacity: 0.8,
    padding: 24,
  };
  
  const branding = snap.background.branding || defaultBranding;

  const updateBranding = (updates: Partial<typeof branding>) => {
    setBackground({
      branding: { ...branding, ...updates },
    });
  };

  const updateSocial = (platform: string, value: string) => {
    setBackground({
      branding: {
        ...branding,
        social: { ...(branding.social || {}), [platform]: value },
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Enable Branding */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider">
          Branding Watermark
        </label>
        <button
          onClick={() => updateBranding({ enabled: !branding.enabled })}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            branding.enabled ? 'bg-blue-600' : 'bg-white/10'
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
              branding.enabled ? 'translate-x-4' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {branding.enabled && (
        <div className="space-y-5">
          {/* Position */}
          <div>
            <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
              Position
            </label>
            <div className="grid grid-cols-2 gap-2">
              {POSITION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateBranding({ position: opt.value })}
                  className={`py-2 px-3 rounded-lg text-xs font-medium transition-all border ${
                    branding.position === opt.value
                      ? 'bg-blue-600/20 text-blue-400 border-blue-500/50'
                      : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border-white/5'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Name
              </label>
              <button
                onClick={() => updateBranding({ showName: !branding.showName })}
                className={`text-xs px-2 py-0.5 rounded ${
                  branding.showName
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'bg-white/5 text-neutral-500'
                }`}
              >
                {branding.showName ? 'Show' : 'Hide'}
              </button>
            </div>
            <input
              type="text"
              value={branding.name}
              onChange={(e) => updateBranding({ name: e.target.value })}
              placeholder="Your Name"
              className="w-full bg-white/5 text-white px-3 py-2 rounded-lg text-sm border border-white/5 focus:border-blue-500/50 focus:outline-none"
            />
          </div>

          {/* Website */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Website
              </label>
              <button
                onClick={() => updateBranding({ showWebsite: !branding.showWebsite })}
                className={`text-xs px-2 py-0.5 rounded ${
                  branding.showWebsite
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'bg-white/5 text-neutral-500'
                }`}
              >
                {branding.showWebsite ? 'Show' : 'Hide'}
              </button>
            </div>
            <input
              type="text"
              value={branding.website}
              onChange={(e) => updateBranding({ website: e.target.value })}
              placeholder="yourwebsite.com"
              className="w-full bg-white/5 text-white px-3 py-2 rounded-lg text-sm border border-white/5 focus:border-blue-500/50 focus:outline-none"
            />
          </div>

          {/* Social Media */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Social Media
              </label>
              <button
                onClick={() => updateBranding({ showSocial: !branding.showSocial })}
                className={`text-xs px-2 py-0.5 rounded ${
                  branding.showSocial
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'bg-white/5 text-neutral-500'
                }`}
              >
                {branding.showSocial ? 'Show' : 'Hide'}
              </button>
            </div>
            <div className="space-y-2">
              {SOCIAL_PLATFORMS.map((platform) => (
                <div key={platform.key} className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500 w-20 shrink-0">
                    {platform.label}
                  </span>
                  <input
                    type="text"
                    value={branding.social[platform.key as keyof typeof branding.social] || ''}
                    onChange={(e) => updateSocial(platform.key, e.target.value)}
                    placeholder={platform.placeholder}
                    className="flex-1 bg-white/5 text-white px-2 py-1.5 rounded-md text-xs border border-white/5 focus:border-blue-500/50 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Styling */}
          <div className="pt-4 border-t border-white/5">
            <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">
              Styling
            </label>

            {/* Font Family */}
            <div className="mb-4">
              <label className="block text-xs text-neutral-500 mb-2">Font</label>
              <select
                value={branding.fontFamily}
                onChange={(e) => updateBranding({ fontFamily: e.target.value })}
                className="w-full bg-white/5 text-white px-3 py-2 rounded-lg text-sm border border-white/5 focus:border-blue-500/50 focus:outline-none"
              >
                {FONT_FAMILIES.text.map((font) => (
                  <option key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Size */}
            <div className="mb-4">
              <label className="block text-xs text-neutral-500 mb-2">
                Font Size: {branding.fontSize}px
              </label>
              <input
                type="range"
                min="10"
                max="24"
                value={branding.fontSize}
                onChange={(e) => updateBranding({ fontSize: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Color */}
            <div className="mb-4">
              <label className="block text-xs text-neutral-500 mb-2">Color</label>
              <div className="flex gap-2 items-center p-2 bg-white/5 rounded-lg border border-white/5">
                <div className="w-6 h-6 rounded overflow-hidden relative border border-white/10 shrink-0">
                  <input
                    type="color"
                    value={branding.color}
                    onChange={(e) => updateBranding({ color: e.target.value })}
                    className="absolute inset-[-4px] w-[200%] h-[200%] cursor-pointer"
                  />
                </div>
                <input
                  type="text"
                  value={branding.color}
                  onChange={(e) => updateBranding({ color: e.target.value })}
                  className="w-full bg-transparent text-white text-xs focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Opacity */}
            <div className="mb-4">
              <label className="block text-xs text-neutral-500 mb-2">
                Opacity: {Math.round(branding.opacity * 100)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={branding.opacity}
                onChange={(e) => updateBranding({ opacity: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Padding */}
            <div>
              <label className="block text-xs text-neutral-500 mb-2">
                Padding: {branding.padding}px
              </label>
              <input
                type="range"
                min="8"
                max="48"
                value={branding.padding}
                onChange={(e) => updateBranding({ padding: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandingPanel;
