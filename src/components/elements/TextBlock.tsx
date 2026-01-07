import React, { useRef, useEffect, useState } from 'react';
import { Group, Rect, Text, Transformer } from 'react-konva';
import type Konva from 'konva';
import type { TextElement } from '../../types';

interface TextBlockProps {
  element: TextElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<TextElement>) => void;
}

const TextBlock: React.FC<TextBlockProps> = ({ element, isSelected, onSelect, onChange }) => {
  const groupRef = useRef<Konva.Group>(null);
  const textRef = useRef<Konva.Text>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const [textDimensions, setTextDimensions] = useState({ width: 200, height: 30 });
  const { x, y, rotation, props } = element;

  useEffect(() => {
    if (isSelected && trRef.current && groupRef.current) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  useEffect(() => {
    if (textRef.current) {
      setTextDimensions({
        width: textRef.current.width(),
        height: textRef.current.height(),
      });
    }
  }, [props.text, props.fontSize, props.fontFamily, props.bold, props.italic]);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onChange({
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const handleTransformEnd = () => {
    const node = groupRef.current;
    if (!node) return;
    
    node.scaleX(1);
    node.scaleY(1);
    
    onChange({
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
    });
  };

  const totalWidth = textDimensions.width + props.padding * 2;
  const totalHeight = textDimensions.height + props.padding * 2;

  const fontStyle = [
    props.bold ? 'bold' : '',
    props.italic ? 'italic' : '',
  ].filter(Boolean).join(' ') || 'normal';

  return (
    <>
      <Group
        ref={groupRef}
        x={x}
        y={y}
        rotation={rotation}
        draggable={!element.locked}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        {/* Background */}
        {props.background && (
          <Rect
            x={-props.padding}
            y={-props.padding}
            width={totalWidth}
            height={totalHeight}
            fill={props.background.color}
            cornerRadius={props.cornerRadius}
          />
        )}
        
        {/* Text */}
        <Text
          ref={textRef}
          text={props.text}
          fontSize={props.fontSize}
          fontFamily={props.fontFamily}
          fontStyle={fontStyle}
          fill={props.color}
          align={props.align}
          textDecoration={props.underline ? 'underline' : ''}
        />
      </Group>
      
      {isSelected && (
        <Transformer
          ref={trRef}
          flipEnabled={false}
          enabledAnchors={['middle-left', 'middle-right']}
          boundBoxFunc={(oldBox, newBox) => {
            if (Math.abs(newBox.width) < 50) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

export default TextBlock;
