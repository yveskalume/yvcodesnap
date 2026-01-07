import React, { useState } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import type { CodeElement, LineHighlight } from '../../types';
import { LANGUAGES, FONT_FAMILIES, CODE_THEMES } from '../../types';
import { detectLanguage } from '../../utils/highlighter';
import { loadFont } from '../../utils/fontLoader';

interface CodeInspectorProps {
  element: CodeElement;
}

const CodeInspector: React.FC<CodeInspectorProps> = ({ element }) => {
  const { updateElement, saveToHistory } = useCanvasStore();
  const [highlightFrom, setHighlightFrom] = useState('');
  const [highlightTo, setHighlightTo] = useState('');
  const [highlightStyle, setHighlightStyle] = useState<'focus' | 'added' | 'removed'>('focus');

  const update = (updates: Partial<CodeElement>) => {
    updateElement(element.id, updates);
  };

  const updateProps = (props: Partial<CodeElement['props']>) => {
    update({ props: { ...element.props, ...props } });
  };

  const handleCodeChange = (code: string) => {
    updateProps({ code });
  };

  const handleAutoDetect = () => {
    const detected = detectLanguage(element.props.code);
    updateProps({ language: detected });
  };

  const addHighlight = () => {
    const from = parseInt(highlightFrom);
    const to = parseInt(highlightTo) || from;
    if (isNaN(from) || from < 1) return;
    
    const newHighlight: LineHighlight = { from, to: Math.max(from, to), style: highlightStyle };
    const highlights = [...element.props.highlights, newHighlight];
    updateProps({ highlights });
    saveToHistory();
    setHighlightFrom('');
    setHighlightTo('');
  };

  const removeHighlight = (index: number) => {
    const highlights = element.props.highlights.filter((_, i) => i !== index);
    updateProps({ highlights });
    saveToHistory();
  };

  const totalLines = element.props.code.split('\n').length;

  return (
    <div className="space-y-4">
      {/* Code editor */}
      <div>
        <label className="block text-sm text-neutral-400 mb-2">Code</label>
        <textarea
          value={element.props.code}
          onChange={(e) => handleCodeChange(e.target.value)}
          onBlur={saveToHistory}
          className="w-full h-32 bg-neutral-900 text-white text-sm font-mono p-3 rounded resize-y"
          spellCheck={false}
        />
      </div>

      {/* Language */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-neutral-400">Language</label>
          <button
            onClick={handleAutoDetect}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            Auto-detect
          </button>
        </div>
        <select
          value={element.props.language}
          onChange={(e) => updateProps({ language: e.target.value })}
          className="w-full bg-neutral-700 text-white px-3 py-2 rounded text-sm"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      {/* Theme */}
      <div>
        <label className="block text-sm text-neutral-400 mb-2">Theme</label>
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
          {CODE_THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => updateProps({ theme: theme.id })}
              className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs text-left transition-all ${
                element.props.theme === theme.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
              }`}
            >
              <div 
                className="w-4 h-4 rounded border border-white/20 shrink-0" 
                style={{ backgroundColor: theme.bg }}
              />
              <span className="truncate">{theme.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Font */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Font Family</label>
        <div className="space-y-1 max-h-36 overflow-y-auto p-1 bg-white/5 rounded-lg border border-white/5">
          {FONT_FAMILIES.code.map((font) => (
            <button
              key={font}
              onClick={() => {
                loadFont(font);
                updateProps({ fontFamily: font });
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm text-left transition-all ${
                element.props.fontFamily === font
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-neutral-300 hover:bg-white/5 border border-transparent'
              }`}
            >
              <span style={{ fontFamily: font }}>{font}</span>
              {element.props.fontFamily === font && (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Font size & Line height */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-neutral-400 mb-2">Size</label>
          <input
            type="number"
            value={element.props.fontSize}
            onChange={(e) => updateProps({ fontSize: parseInt(e.target.value) || 14 })}
            className="w-full bg-neutral-700 text-white px-3 py-2 rounded text-sm"
            min={10}
            max={32}
          />
        </div>
        <div>
          <label className="block text-sm text-neutral-400 mb-2">Line Height</label>
          <input
            type="number"
            value={element.props.lineHeight}
            onChange={(e) => updateProps({ lineHeight: parseFloat(e.target.value) || 1.5 })}
            className="w-full bg-neutral-700 text-white px-3 py-2 rounded text-sm"
            min={1}
            max={3}
            step={0.1}
          />
        </div>
      </div>

      {/* Line numbers */}
      <div className="flex items-center justify-between">
        <label className="text-sm text-neutral-400">Line Numbers</label>
        <button
          onClick={() => updateProps({ lineNumbers: !element.props.lineNumbers })}
          className={`w-12 h-6 rounded-full transition-colors ${
            element.props.lineNumbers ? 'bg-blue-600' : 'bg-neutral-600'
          }`}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full transition-transform ${
              element.props.lineNumbers ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Padding & Corner radius */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-neutral-400 mb-2">Padding</label>
          <input
            type="number"
            value={element.props.padding}
            onChange={(e) => updateProps({ padding: parseInt(e.target.value) || 0 })}
            className="w-full bg-neutral-700 text-white px-3 py-2 rounded text-sm"
            min={0}
            max={64}
          />
        </div>
        <div>
          <label className="block text-sm text-neutral-400 mb-2">Radius</label>
          <input
            type="number"
            value={element.props.cornerRadius}
            onChange={(e) => updateProps({ cornerRadius: parseInt(e.target.value) || 0 })}
            className="w-full bg-neutral-700 text-white px-3 py-2 rounded text-sm"
            min={0}
            max={32}
          />
        </div>
      </div>

      {/* Shadow */}
      <div>
        <label className="block text-sm text-neutral-400 mb-2">
          Shadow Blur: {element.props.shadow.blur}
        </label>
        <input
          type="range"
          value={element.props.shadow.blur}
          onChange={(e) => updateProps({
            shadow: { ...element.props.shadow, blur: parseInt(e.target.value) }
          })}
          className="w-full"
          min={0}
          max={64}
        />
      </div>

      {/* Line Highlights */}
      <div>
        <label className="block text-sm text-neutral-400 mb-2">
          Line Highlights <span className="text-neutral-500">({totalLines} lines)</span>
        </label>
        
        {/* Existing highlights */}
        {element.props.highlights.length > 0 && (
          <div className="space-y-1 mb-3">
            {element.props.highlights.map((h, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between bg-neutral-700 px-2 py-1.5 rounded text-sm"
              >
                <div className="flex items-center gap-2">
                  <span 
                    className={`w-2 h-2 rounded-full ${
                      h.style === 'focus' ? 'bg-yellow-400' : 
                      h.style === 'added' ? 'bg-green-400' : 'bg-red-400'
                    }`} 
                  />
                  <span className="text-white">
                    {h.from === h.to ? `Line ${h.from}` : `Lines ${h.from}-${h.to}`}
                  </span>
                  <span className="text-neutral-400 text-xs">({h.style})</span>
                </div>
                <button
                  onClick={() => removeHighlight(i)}
                  className="text-neutral-400 hover:text-red-400 text-lg leading-none"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Add new highlight */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="From"
              value={highlightFrom}
              onChange={(e) => setHighlightFrom(e.target.value)}
              className="w-20 bg-neutral-700 text-white px-2 py-1.5 rounded text-sm"
              min={1}
              max={totalLines}
            />
            <input
              type="number"
              placeholder="To"
              value={highlightTo}
              onChange={(e) => setHighlightTo(e.target.value)}
              className="w-20 bg-neutral-700 text-white px-2 py-1.5 rounded text-sm"
              min={1}
              max={totalLines}
            />
            <select
              value={highlightStyle}
              onChange={(e) => setHighlightStyle(e.target.value as 'focus' | 'added' | 'removed')}
              className="flex-1 bg-neutral-700 text-white px-2 py-1.5 rounded text-sm"
            >
              <option value="focus">Focus</option>
              <option value="added">Added</option>
              <option value="removed">Removed</option>
            </select>
          </div>
          <button
            onClick={addHighlight}
            disabled={!highlightFrom}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-600 disabled:opacity-50 text-white py-1.5 rounded text-sm transition-colors"
          >
            Add Highlight
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeInspector;
