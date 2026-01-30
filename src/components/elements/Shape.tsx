import React from 'react';
import { Group, Rect, Ellipse, Line, RegularPolygon, Star } from 'react-konva';
import type Konva from 'konva';
import type { ShapeElement } from '../../types';

interface ShapeProps {
  element: ShapeElement;
  isSelected: boolean;
  onSelect: (e?: any) => void;
  onChange: (updates: Partial<ShapeElement>) => void;
}

const Shape: React.FC<ShapeProps> = ({ element, isSelected, onSelect, onChange }) => {
  const { props, width, height } = element;
  const strokeWidth = props.strokeWidth ?? 2;
  const outlineColor = '#3b82f6';

  const selectedOutlineForPolyLike = (node: React.ReactNode) =>
    isSelected ? node : null;

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (element.locked) return;
    if (e.target !== e.currentTarget) return;

    const node = e.target;
    const dx = node.x();
    const dy = node.y();

    if (props.kind === 'line' && element.points) {
      const newPoints = element.points.map((p) => ({ x: p.x + dx, y: p.y + dy }));
      onChange({ points: newPoints });
    } else {
      onChange({
        x: element.x + dx,
        y: element.y + dy,
      });
    }

    // Reset group position
    node.x(0);
    node.y(0);
  };

  const common = {
    listening: true,
    onClick: onSelect,
    onTap: onSelect,
    onContextMenu: (e: any) => {
      e.evt?.preventDefault?.();
      e.cancelBubble = true;
      onSelect();
    },
    draggable: !element.locked,
    onDragEnd: handleDragEnd,
    onDragMoveCapture: () => {
      const stage = (window as any)?.stageRef?.current?.getStage?.();
      const container = stage?.container?.();
      if (container) container.style.cursor = element.locked ? 'default' : 'move';
    },
  };

  if (props.kind === 'line' && element.points && element.points.length >= 2) {
    const pts = element.points.flatMap((p) => [p.x, p.y]);
    return (
      <Group {...common}>
        {isSelected && (
          <Line
            points={pts}
            stroke={outlineColor}
            strokeWidth={strokeWidth + 6}
            lineCap="round"
            lineJoin="round"
            opacity={0.35}
            listening={false}
          />
        )}
        <Line
          points={pts}
          lineCap="round"
          lineJoin="round"
          stroke={props.stroke}
          strokeWidth={strokeWidth}
          listening={true}
        />
      </Group>
    );
  }

  if (props.kind === 'rectangle') {
    const cx = element.x + width / 2;
    const cy = element.y + height / 2;
    return (
      <Group {...common}>
        {isSelected && (
          <Rect
            x={cx}
            y={cy}
            offsetX={(width + 8) / 2}
            offsetY={(height + 8) / 2}
            width={width + 8}
            height={height + 8}
            cornerRadius={8}
            stroke={outlineColor}
            strokeWidth={1.5}
            dash={[6, 4]}
            rotation={element.rotation}
            listening={false}
          />
        )}
        <Rect
          x={cx}
          y={cy}
          offsetX={width / 2}
          offsetY={height / 2}
          width={width}
          height={height}
          fill={props.fill || 'transparent'}
          stroke={props.stroke}
          strokeWidth={strokeWidth}
          cornerRadius={6}
          rotation={element.rotation}
          listening={true}
        />
      </Group>
    );
  }

  if (props.kind === 'ellipse') {
    const cx = element.x + width / 2;
    const cy = element.y + height / 2;
    return (
      <Group {...common}>
        {isSelected && (
          <Ellipse
            x={cx}
            y={cy}
            radiusX={Math.abs(width) / 2 + 4}
            radiusY={Math.abs(height) / 2 + 4}
            stroke={outlineColor}
            strokeWidth={1.5}
            dash={[6, 4]}
            listening={false}
          />
        )}
        <Ellipse
          x={cx}
          y={cy}
          radiusX={Math.abs(width) / 2}
          radiusY={Math.abs(height) / 2}
          fill={props.fill || 'transparent'}
          stroke={props.stroke}
          strokeWidth={strokeWidth}
          rotation={element.rotation}
          listening={true}
        />
      </Group>
    );
  }

  if (props.kind === 'polygon') {
    const sides = props.sides || 5;
    const radius = Math.min(Math.abs(width), Math.abs(height)) / 2;
    const cx = element.x + width / 2;
    const cy = element.y + height / 2;
    return (
      <Group {...common}>
        {selectedOutlineForPolyLike(
          <RegularPolygon
            x={cx}
            y={cy}
            sides={sides}
            radius={radius + 4}
            stroke={outlineColor}
            strokeWidth={1.5}
            dash={[6, 4]}
            listening={false}
          />
        )}
        <RegularPolygon
          x={cx}
          y={cy}
          sides={sides}
          radius={radius}
          fill={props.fill || 'transparent'}
          stroke={props.stroke}
          strokeWidth={strokeWidth}
          rotation={element.rotation}
          listening={true}
        />
      </Group>
    );
  }

  if (props.kind === 'star') {
    const points = props.sides || 5;
    const outerRadius = Math.min(Math.abs(width), Math.abs(height)) / 2;
    const cx = element.x + width / 2;
    const cy = element.y + height / 2;
    return (
      <Group {...common}>
        {selectedOutlineForPolyLike(
          <Star
            x={cx}
            y={cy}
            numPoints={points}
            innerRadius={(outerRadius + 4) / 2.2}
            outerRadius={outerRadius + 4}
            stroke={outlineColor}
            strokeWidth={1.5}
            dash={[6, 4]}
            listening={false}
          />
        )}
        <Star
          x={cx}
          y={cy}
          numPoints={points}
          innerRadius={outerRadius / 2.2}
          outerRadius={outerRadius}
          fill={props.fill || 'transparent'}
          stroke={props.stroke}
          strokeWidth={strokeWidth}
          rotation={element.rotation}
          listening={true}
        />
      </Group>
    );
  }

  return null;
};

export default Shape;
