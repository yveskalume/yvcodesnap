import React, { useRef } from 'react';
import { Group, Arrow as KonvaArrow, Circle } from 'react-konva';
import type Konva from 'konva';
import type { ArrowElement } from '../../types';

interface ArrowProps {
  element: ArrowElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<ArrowElement>) => void;
}

const Arrow: React.FC<ArrowProps> = ({ element, isSelected, onSelect, onChange }) => {
  const arrowRef = useRef<Konva.Arrow>(null);
  const { points, props } = element;

  // Flatten points for Konva
  const flatPoints = points.flatMap(p => [p.x, p.y]);

  const handlePointDrag = (index: number, e: Konva.KonvaEventObject<DragEvent>) => {
    const newPoints = [...points];
    newPoints[index] = {
      x: e.target.x(),
      y: e.target.y(),
    };
    onChange({ points: newPoints });
  };

  // Arrow head pointer
  const pointerLength = props.head === 'none' ? 0 : props.thickness * 4;
  const pointerWidth = props.head === 'none' ? 0 : props.thickness * 3;

  return (
    <Group>
      <KonvaArrow
        ref={arrowRef}
        points={flatPoints}
        stroke={props.color}
        strokeWidth={props.thickness}
        fill={props.head === 'filled' ? props.color : 'transparent'}
        pointerLength={pointerLength}
        pointerWidth={pointerWidth}
        tension={props.style === 'curved' ? 0.5 : 0}
        lineCap="round"
        lineJoin="round"
        onClick={onSelect}
        onTap={onSelect}
        hitStrokeWidth={20}
      />
      
      {/* Control points when selected */}
      {isSelected && points.map((point, index) => (
        <Circle
          key={index}
          x={point.x}
          y={point.y}
          radius={8}
          fill="#3b82f6"
          stroke="#ffffff"
          strokeWidth={2}
          draggable={!element.locked}
          onDragMove={(e) => handlePointDrag(index, e)}
          onDragEnd={(e) => handlePointDrag(index, e)}
        />
      ))}
    </Group>
  );
};

export default Arrow;
