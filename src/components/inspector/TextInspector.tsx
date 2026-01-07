import React from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import type { TextElement } from '../../types';
import { FONT_FAMILIES } from '../../types';

interface TextInspectorProps {
  element: TextElement;
}

const TextInspector: React.FC<TextInspectorProps> = ({ element }) => {
  const { updateElement, saveToHistory } = useCanvasStore();

  const update = (updates: Partial<TextElement>) => {
    updateElement(element.id, updates);
  };

  const updateProps = (props: Partial<TextElement['props']>) => {
    update({ props: { ...element.props, ...props } });
  };

  return (
    <div className="space-y-4">
      {/* Text */}
      <div>
        <label className="block text-sm text-neutral-400 mb-2">Text</label>
        <textarea
          value={element.props.text}
          onChange={(e) => updateProps({ text: e.target.value })}
          onBlur={saveToHistory}
          className="w-full h-24 bg-neutral-900 text-white text-sm p-3 rounded resize-y"
        />
      </div>

      {/* Font */}
      <div>
        <label className="block text-sm text-neutral-400 mb-2">Font</label>
        <select
          value={element.props.fontFamily}
          onChange={(e) => updateProps({ fontFamily: e.target.value })}
          className="w-full bg-neutral-700 text-white px-3 py-2 rounded text-sm"
        >
          {FONT_FAMILIES.text.map((font) => (
            <option key={font} value={font}>
              {font}
            </option>
          ))}
        </select>
      </div>

      {/* Font size */}
      <div>
        <label className="block text-sm text-neutral-400 mb-2">Size: {element.props.fontSize}</label>
        <input
          type="range"
          value={element.props.fontSize}
          onChange={(e) => updateProps({ fontSize: parseInt(e.target.value) })}
          className="w-full"
          min={12}
          max={96}
        />
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

      {/* Style buttons */}
      <div>
        <label className="block text-sm text-neutral-400 mb-2">Style</label>
        <div className="flex gap-2">
          <button
            onClick={() => updateProps({ bold: !element.props.bold })}
            className={`flex-1 py-2 rounded text-sm font-bold ${
              element.props.bold
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-700 text-neutral-300'
            }`}
          >
            B
          </button>
          <button
            onClick={() => updateProps({ italic: !element.props.italic })}
            className={`flex-1 py-2 rounded text-sm italic ${
              element.props.italic
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-700 text-neutral-300'
            }`}
          >
            I
          </button>
          <button
            onClick={() => updateProps({ underline: !element.props.underline })}
            className={`flex-1 py-2 rounded text-sm underline ${
              element.props.underline
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-700 text-neutral-300'
            }`}
          >
            U
          </button>
        </div>
      </div>

      {/* Alignment */}
      <div>
        <label className="block text-sm text-neutral-400 mb-2">Alignment</label>
        <div className="flex gap-2">
          <button
            onClick={() => updateProps({ align: 'left' })}
            className={`flex-1 py-2 rounded text-sm ${
              element.props.align === 'left'
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-700 text-neutral-300'
            }`}
          >
            Left
          </button>
          <button
            onClick={() => updateProps({ align: 'center' })}
            className={`flex-1 py-2 rounded text-sm ${
              element.props.align === 'center'
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-700 text-neutral-300'
            }`}
          >
            Center
          </button>
          <button
            onClick={() => updateProps({ align: 'right' })}
            className={`flex-1 py-2 rounded text-sm ${
              element.props.align === 'right'
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-700 text-neutral-300'
            }`}
          >
            Right
          </button>
        </div>
      </div>

      {/* Background */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-neutral-400">Background</label>
          <button
            onClick={() => updateProps({ 
              background: element.props.background 
                ? null 
                : { color: 'rgba(0,0,0,0.5)' }
            })}
            className={`w-12 h-6 rounded-full transition-colors ${
              element.props.background ? 'bg-blue-600' : 'bg-neutral-600'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transition-transform ${
                element.props.background ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
        {element.props.background && (
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={element.props.background.color.substring(0, 7)}
              onChange={(e) => updateProps({ background: { color: e.target.value } })}
              className="w-10 h-10 rounded cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={element.props.background.color}
              onChange={(e) => updateProps({ background: { color: e.target.value } })}
              className="flex-1 bg-neutral-700 text-white px-3 py-2 rounded text-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TextInspector;
