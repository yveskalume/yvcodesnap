import React from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import type { ImageElement } from '../../types';
import NumberField from '../ui/NumberField';
import SliderField from '../ui/SliderField';
import SelectField from '../ui/SelectField';

interface ImageInspectorProps {
    element: ImageElement;
}

const ImageInspector: React.FC<ImageInspectorProps> = ({ element }) => {
    const { updateElement, saveToHistory } = useCanvasStore();

    const updateProps = (props: Partial<ImageElement['props']>) => {
        updateElement(element.id, { props: { ...element.props, ...props } });
    };

    const handleBlur = () => {
        saveToHistory();
    };

    return (
        <div className="space-y-4">
            {/* Dimensions (Read-only for now, or editable?) */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm text-neutral-400 mb-2">Width</label>
                    <div className="px-3 py-2 bg-white/5 rounded-md text-sm text-neutral-400 border border-white/5 cursor-not-allowed">
                        {Math.round(element.width)}px
                    </div>
                </div>
                <div>
                    <label className="block text-sm text-neutral-400 mb-2">Height</label>
                    <div className="px-3 py-2 bg-white/5 rounded-md text-sm text-neutral-400 border border-white/5 cursor-not-allowed">
                        {Math.round(element.height)}px
                    </div>
                </div>
            </div>

            {/* Opacity */}
            <div>
                <label className="block text-sm text-neutral-400 mb-2">
                    Opacity: {Math.round(element.props.opacity * 100)}%
                </label>
                <SliderField
                    min={0}
                    max={1}
                    step={0.05}
                    value={element.props.opacity}
                    onValueChange={(v) => updateProps({ opacity: v })}
                    ariaLabel="Opacity"
                />
            </div>

            {/* Corner Radius */}
            <div>
                <label className="block text-sm text-neutral-400 mb-2">Corner Radius</label>
                <NumberField
                    value={element.props.cornerRadius}
                    onChange={(v) => updateProps({ cornerRadius: typeof v === 'number' ? v : 0 })}
                    min={0}
                    max={100}
                    step={1}
                />
            </div>

            {/* Shadow */}
            <div>
                <label className="block text-sm text-neutral-400 mb-2">
                    Shadow Blur: {element.props.shadow.blur}
                </label>
                <SliderField
                    min={0}
                    max={64}
                    step={1}
                    value={element.props.shadow.blur}
                    onValueChange={(v) =>
                        updateProps({ shadow: { ...element.props.shadow, blur: v } })
                    }
                    ariaLabel="Shadow blur"
                />
            </div>

            {/* Fit Mode */}
            <div>
                <label className="block text-sm text-neutral-400 mb-2">Fit Mode</label>
                <SelectField
                    value={element.props.fit}
                    onValueChange={(v) => updateProps({ fit: v as 'cover' | 'contain' | 'fill' })}
                    options={[
                        { value: 'contain', label: 'Contain' },
                        { value: 'cover', label: 'Cover' },
                        { value: 'fill', label: 'Fill' },
                    ]}
                />
            </div>
        </div>
    );
};

export default ImageInspector;
