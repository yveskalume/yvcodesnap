import React, { useRef, useEffect } from 'react';
import { Group, Rect, Text, Transformer } from 'react-konva';
import type Konva from 'konva';
import type { CodeElement } from '../../types';

interface CodeBlockProps {
  element: CodeElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<CodeElement>) => void;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ element, isSelected, onSelect, onChange }) => {
  const groupRef = useRef<Konva.Group>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const { x, y, width, height, rotation, props } = element;

  useEffect(() => {
    if (isSelected && trRef.current && groupRef.current) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  // Simple code rendering with line numbers
  const renderCode = () => {
    const lines = props.code.split('\n');
    const lineHeight = props.fontSize * props.lineHeight;
    const startY = props.padding;
    const lineNumberWidth = props.lineNumbers ? 40 : 0;
    
    const elements: React.ReactNode[] = [];
    
    lines.forEach((line, index) => {
      const yPos = startY + index * lineHeight;
      const lineNum = index + 1;
      
      // Check if this line is highlighted
      const highlight = props.highlights.find(
        h => lineNum >= h.from && lineNum <= h.to
      );
      
      // Line highlight background
      if (highlight) {
        let bgColor = 'rgba(255, 255, 0, 0.15)'; // focus
        if (highlight.style === 'added') bgColor = 'rgba(0, 255, 0, 0.15)';
        if (highlight.style === 'removed') bgColor = 'rgba(255, 0, 0, 0.15)';
        
        elements.push(
          <Rect
            key={`highlight-${index}`}
            x={0}
            y={yPos - 2}
            width={width}
            height={lineHeight}
            fill={bgColor}
          />
        );
      }
      
      // Line number
      if (props.lineNumbers) {
        elements.push(
          <Text
            key={`linenum-${index}`}
            x={props.padding}
            y={yPos}
            text={String(lineNum)}
            fontSize={props.fontSize}
            fontFamily={props.fontFamily}
            fill={props.theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}
            width={30}
            align="right"
          />
        );
      }
      
      // Code text
      elements.push(
        <Text
          key={`code-${index}`}
          x={props.padding + lineNumberWidth + 10}
          y={yPos}
          text={line || ' '}
          fontSize={props.fontSize}
          fontFamily={props.fontFamily}
          fill={props.theme === 'dark' ? '#e5e5e5' : '#1f1f1f'}
        />
      );
    });
    
    return elements;
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onChange({
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const handleTransformEnd = () => {
    const node = groupRef.current;
    if (!node) return;
    
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    node.scaleX(1);
    node.scaleY(1);
    
    onChange({
      x: node.x(),
      y: node.y(),
      width: Math.max(200, node.width() * scaleX),
      height: Math.max(100, node.height() * scaleY),
      rotation: node.rotation(),
    });
  };

  const bgColor = props.theme === 'dark' ? '#1e1e2e' : '#f8f8f8';

  return (
    <>
      <Group
        ref={groupRef}
        x={x}
        y={y}
        width={width}
        height={height}
        rotation={rotation}
        draggable={!element.locked}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        {/* Shadow */}
        <Rect
          x={props.shadow.spread}
          y={props.shadow.spread}
          width={width}
          height={height}
          cornerRadius={props.cornerRadius}
          fill={props.shadow.color}
          shadowBlur={props.shadow.blur}
          shadowColor={props.shadow.color}
        />
        
        {/* Background */}
        <Rect
          width={width}
          height={height}
          fill={bgColor}
          cornerRadius={props.cornerRadius}
        />
        
        {/* Code content */}
        <Group clipFunc={(ctx) => {
          ctx.beginPath();
          ctx.roundRect(0, 0, width, height, props.cornerRadius);
          ctx.closePath();
        }}>
          {renderCode()}
        </Group>
      </Group>
      
      {isSelected && (
        <Transformer
          ref={trRef}
          flipEnabled={false}
          boundBoxFunc={(oldBox, newBox) => {
            if (Math.abs(newBox.width) < 200 || Math.abs(newBox.height) < 100) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

export default CodeBlock;
