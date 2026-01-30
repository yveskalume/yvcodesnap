import React from 'react';
import { Group } from 'react-konva';
import type { GroupElement, CodeElement, TextElement, ArrowElement, ShapeElement, ImageElement } from '../../types';
import CodeBlock from './CodeBlock';
import TextBlock from './TextBlock';
import Arrow from './Arrow';
import Shape from './Shape';
import ImageLayer from './ImageLayer';

import type Konva from 'konva';

interface GroupLayerProps {
    element: GroupElement;
    onSelect: (e: any) => void;
    onChange: (updates: Partial<GroupElement>) => void;
}

const GroupLayer: React.FC<GroupLayerProps> = ({ element, onSelect, onChange }) => {
    const groupRef = React.useRef<Konva.Group>(null);

    const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
        if (e.target === groupRef.current) {
            onChange({
                x: e.target.x(),
                y: e.target.y(),
            });
        }
    };

    const handleTransformEnd = () => {
        const node = groupRef.current;
        if (!node) return;

        // reset scale
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);

        onChange({
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
            rotation: node.rotation(),
        });
    };

    return (
        <Group
            ref={groupRef}
            id={element.id}
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            rotation={element.rotation}
            draggable={!element.locked}
            onClick={onSelect}
            onTap={onSelect}
            onDragEnd={handleDragEnd}
            onTransformEnd={handleTransformEnd}
        >
            {element.elements.map((el) => {
                const childProps = {
                    key: el.id,
                    isSelected: false,
                    draggable: false,
                    onSelect: () => {
                        // Forward selection to group handler without requiring Event object
                        onSelect({} as any);
                    },
                    onChange: (updates: any) => {
                        // When a child changes, update the group's elements array
                        const newElements = element.elements.map(child =>
                            child.id === el.id ? { ...child, ...updates } : child
                        );
                        onChange({ elements: newElements });
                    },
                };

                switch (el.type) {
                    case 'code':
                        return <CodeBlock {...childProps} element={el as CodeElement} />;
                    case 'text':
                        return <TextBlock {...childProps} element={el as TextElement} />;
                    case 'arrow':
                        return <Arrow {...childProps} element={el as ArrowElement} />;
                    case 'shape':
                        return <Shape {...childProps} element={el as ShapeElement} />;
                    case 'image':
                        return <ImageLayer {...childProps} element={el as ImageElement} onSelect={childProps.onSelect} onChange={childProps.onChange} />;
                    case 'group':
                        return <GroupLayer {...childProps} element={el as GroupElement} onSelect={childProps.onSelect} onChange={childProps.onChange} />;
                    default:
                        return null;
                }
            })}
        </Group>
    );
};

export default GroupLayer;
