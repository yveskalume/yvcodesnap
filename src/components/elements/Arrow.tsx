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

  // Modern arrow head calculations
  // Make the head slightly sleeker
  const pointerLength = props.head === 'none' ? 0 : Math.max(props.thickness * 3, 12);
  const pointerWidth = props.head === 'none' ? 0 : Math.max(props.thickness * 2.5, 12);

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
        tension={props.style === 'curved' ? 0.4 : 0}
        lineCap="round"
        lineJoin="round"
        // Add subtle glow/shadow for modern feel
        shadowColor={props.color}
        shadowBlur={8}
        shadowOpacity={0.2}
        shadowOffset={{ x: 0, y: 0 }}
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
          radius={5}
          fill="#ffffff"
          stroke="#3b82f6"
          strokeWidth={2}
          shadowColor="rgba(0,0,0,0.15)"
          shadowBlur={4}
          shadowOffset={{ x: 0, y: 1 }}
          draggable={!element.locked}
          onDragMove={(e) => handlePointDrag(index, e)}
          onDragEnd={(e) => handlePointDrag(index, e)}
          onMouseEnter={(e) => {
            const container = e.target.getStage()?.container();
            if (container) container.style.cursor = 'grab';
            e.target.scale({ x: 1.5, y: 1.5 });
          }}
          onMouseLeave={(e) => {
            const container = e.target.getStage()?.container();
            if (container) container.style.cursor = 'default';
            e.target.scale({ x: 1, y: 1 });
          }}
        />
      ))}
    </Group>
  );
};

export default Arrow;
