import React, { useRef, useEffect, useState } from 'react';
import { Group, Rect, Text, Transformer } from 'react-konva';
import type Konva from 'konva';
import type { CodeElement } from '../../types';
import { tokenizeCode, getThemeBackground, isLightTheme, type LineTokens } from '../../utils/highlighter';

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
  const [tokenizedLines, setTokenizedLines] = useState<LineTokens[]>([]);

  useEffect(() => {
    if (isSelected && trRef.current && groupRef.current) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  // Tokenize code for syntax highlighting
  useEffect(() => {
    tokenizeCode(props.code, props.language, props.theme)
      .then(setTokenizedLines)
      .catch(() => {
        // Fallback to plain text
        setTokenizedLines(
          props.code.split('\n').map(line => ({
            tokens: [{ content: line, color: isLightTheme(props.theme) ? '#1f1f1f' : '#e5e5e5' }],
          }))
        );
      });
  }, [props.code, props.language, props.theme]);

  useEffect(() => {
    if (isSelected && trRef.current && groupRef.current) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  // Render code with syntax highlighting using tokens
  const renderCode = () => {
    const lines = tokenizedLines.length > 0 ? tokenizedLines : 
      props.code.split('\n').map(line => ({
        tokens: [{ content: line, color: isLightTheme(props.theme) ? '#1f1f1f' : '#e5e5e5' }],
      }));
    
    const lineHeight = props.fontSize * props.lineHeight;
    const startY = props.padding;
    const lineNumberWidth = props.lineNumbers ? 50 : 0;
    const lineNumColor = isLightTheme(props.theme) ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)';
    
    const elements: React.ReactNode[] = [];
    
    lines.forEach((lineTokens, index) => {
      const yPos = startY + index * lineHeight;
      const lineNum = index + 1;
      
      // Check if this line is highlighted
      const highlight = props.highlights.find(
        h => lineNum >= h.from && lineNum <= h.to
      );
      
      // Line highlight background
      if (highlight) {
        let bgColor = 'rgba(255, 255, 0, 0.2)'; // focus - yellow
        if (highlight.style === 'added') bgColor = 'rgba(46, 160, 67, 0.25)';
        if (highlight.style === 'removed') bgColor = 'rgba(248, 81, 73, 0.25)';
        
        // Add a subtle left border indicator
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
        
        // Left border for highlight
        elements.push(
          <Rect
            key={`highlight-border-${index}`}
            x={0}
            y={yPos - 2}
            width={3}
            height={lineHeight}
            fill={
              highlight.style === 'focus' ? '#facc15' :
              highlight.style === 'added' ? '#2ea043' : '#f85149'
            }
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
            fill={lineNumColor}
            width={35}
            align="right"
          />
        );
      }
      
      // Code text with syntax highlighting
      let xOffset = props.padding + lineNumberWidth + (props.lineNumbers ? 5 : 0);
      
      lineTokens.tokens.forEach((token, tokenIndex) => {
        if (token.content) {
          elements.push(
            <Text
              key={`code-${index}-${tokenIndex}`}
              x={xOffset}
              y={yPos}
              text={token.content}
              fontSize={props.fontSize}
              fontFamily={props.fontFamily}
              fill={token.color}
            />
          );
          // Approximate character width for monospace font
          xOffset += token.content.length * (props.fontSize * 0.6);
        }
      });
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

  const bgColor = getThemeBackground(props.theme);

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
