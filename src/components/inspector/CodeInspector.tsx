import React from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import type { CodeElement } from '../../types';
import { LANGUAGES, FONT_FAMILIES } from '../../types';
import { detectLanguage } from '../../utils/highlighter';

interface CodeInspectorProps {
  element: CodeElement;
}

const CodeInspector: React.FC<CodeInspectorProps> = ({ element }) => {
  const { updateElement, saveToHistory } = useCanvasStore();

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
        <div className="flex gap-2">
          <button
            onClick={() => updateProps({ theme: 'dark' })}
            className={`flex-1 py-2 rounded text-sm ${
              element.props.theme === 'dark'
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-700 text-neutral-300'
            }`}
          >
            Dark
          </button>
          <button
            onClick={() => updateProps({ theme: 'light' })}
            className={`flex-1 py-2 rounded text-sm ${
              element.props.theme === 'light'
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-700 text-neutral-300'
            }`}
          >
            Light
          </button>
        </div>
      </div>

      {/* Font */}
      <div>
        <label className="block text-sm text-neutral-400 mb-2">Font</label>
        <select
          value={element.props.fontFamily}
          onChange={(e) => updateProps({ fontFamily: e.target.value })}
          className="w-full bg-neutral-700 text-white px-3 py-2 rounded text-sm"
        >
          {FONT_FAMILIES.code.map((font) => (
            <option key={font} value={font}>
              {font}
            </option>
          ))}
        </select>
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
    </div>
  );
};

export default CodeInspector;
