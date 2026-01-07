import React, { useRef, useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Stage, Layer, Rect, Line, Text } from 'react-konva';
import type Konva from 'konva';
import { useCanvasStore, createCodeElement, createTextElement, createArrowElement } from '../store/canvasStore';
import CodeBlock from './elements/CodeBlock';
import TextBlock from './elements/TextBlock';
import Arrow from './elements/Arrow';
import type { CodeElement, TextElement, ArrowElement } from '../types';

interface CanvasProps {
  stageRef: React.RefObject<Konva.Stage | null>;
}

const Canvas: React.FC<CanvasProps> = ({ stageRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight - 120 });
  const { 
    snap, 
    zoom, 
    showGrid, 
    tool, 
    selectedElementId,
    selectElement, 
    addElement,
    updateElement,
  } = useCanvasStore();

  const { width, height } = snap.meta;
  const { background } = snap;

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Calculate stage position to center the canvas
  const getStagePosition = useCallback(() => {
    const scaledWidth = width * zoom;
    const scaledHeight = height * zoom;
    return {
      x: Math.max(20, (dimensions.width - scaledWidth) / 2),
      y: Math.max(20, (dimensions.height - scaledHeight) / 2),
    };
  }, [width, height, zoom, dimensions]);

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.name() === 'background';
    
    if (clickedOnEmpty) {
      const stage = e.target.getStage();
      if (!stage) return;
      
      const pos = stage.getPointerPosition();
      if (!pos) return;
      
      // Convert screen position to canvas position
      const stagePos = getStagePosition();
      const canvasX = (pos.x - stagePos.x) / zoom;
      const canvasY = (pos.y - stagePos.y) / zoom;
      
      if (tool === 'code') {
        addElement(createCodeElement(canvasX - 300, canvasY - 150));
      } else if (tool === 'text') {
        addElement(createTextElement(canvasX, canvasY));
      } else if (tool === 'arrow') {
        addElement(createArrowElement(canvasX, canvasY));
      } else {
        selectElement(null);
      }
    }
  };

  // Background gradient
  const renderBackground = () => {
    if (background.type === 'gradient') {
      return (
        <Rect
          name="background"
          x={0}
          y={0}
          width={width}
          height={height}
          fillLinearGradientStartPoint={{ x: 0, y: 0 }}
          fillLinearGradientEndPoint={{ 
            x: width * Math.cos((background.gradient.angle * Math.PI) / 180),
            y: height * Math.sin((background.gradient.angle * Math.PI) / 180)
          }}
          fillLinearGradientColorStops={[0, background.gradient.from, 1, background.gradient.to]}
        />
      );
    }
    return (
      <Rect
        name="background"
        x={0}
        y={0}
        width={width}
        height={height}
        fill={background.solid.color}
      />
    );
  };

  // Grid overlay - memoized for performance
  const gridLines = useMemo(() => {
    if (!showGrid) return null;
    const gridSize = 50;
    const lines = [];
    
    // Vertical lines
    for (let i = 0; i <= width; i += gridSize) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i, 0, i, height]}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={1}
        />
      );
    }
    
    // Horizontal lines
    for (let i = 0; i <= height; i += gridSize) {
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, i, width, i]}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={1}
        />
      );
    }
    
    return <>{lines}</>;
  }, [showGrid, width, height]);

  // Brand strip - memoized
  const brandStripElement = useMemo(() => {
    const brandStrip = background.brandStrip;
    if (!brandStrip?.enabled) return null;

    const stripHeight = brandStrip.height || 60;
    const stripY = brandStrip.position === 'top' ? 0 : height - stripHeight;

    return (
      <>
        <Rect
          x={0}
          y={stripY}
          width={width}
          height={stripHeight}
          fill={brandStrip.color || '#000000'}
        />
        {brandStrip.text && (
          <Text
            x={0}
            y={stripY}
            width={width}
            height={stripHeight}
            text={brandStrip.text}
            fontSize={brandStrip.fontSize || 16}
            fontFamily={brandStrip.fontFamily || 'Inter'}
            fill={brandStrip.textColor || '#ffffff'}
            align="center"
            verticalAlign="middle"
          />
        )}
      </>
    );
  }, [background.brandStrip, width, height]);

  // Branding watermark - memoized
  const brandingElement = useMemo(() => {
    const branding = background.branding;
    if (!branding?.enabled) return null;

    const padding = branding.padding || 24;
    const fontSize = branding.fontSize || 14;
    const lineHeight = fontSize * 1.5;

    // Build branding text lines
    const lines: string[] = [];
    if (branding.showName && branding.name) {
      lines.push(branding.name);
    }
    if (branding.showWebsite && branding.website) {
      lines.push(branding.website);
    }
    if (branding.showSocial && branding.social) {
      const socialParts: string[] = [];
      if (branding.social.twitter) socialParts.push(branding.social.twitter);
      if (branding.social.linkedin) socialParts.push(branding.social.linkedin);
      if (branding.social.instagram) socialParts.push(branding.social.instagram);
      if (branding.social.github) socialParts.push(branding.social.github);
      if (branding.social.youtube) socialParts.push(branding.social.youtube);
      if (branding.social.tiktok) socialParts.push(branding.social.tiktok);
      if (socialParts.length > 0) {
        lines.push(socialParts.join(' • '));
      }
    }

    if (lines.length === 0) return null;

    const text = lines.join('\n');
    const textHeight = lines.length * lineHeight;

    // Calculate position based on setting
    let x = padding;
    let y = padding;
    let align: 'left' | 'right' = 'left';

    switch (branding.position) {
      case 'top-left':
        x = padding;
        y = padding;
        align = 'left';
        break;
      case 'top-right':
        x = width - padding;
        y = padding;
        align = 'right';
        break;
      case 'bottom-left':
        x = padding;
        y = height - padding - textHeight;
        align = 'left';
        break;
      case 'bottom-right':
        x = width - padding;
        y = height - padding - textHeight;
        align = 'right';
        break;
    }

    return (
      <Text
        x={align === 'right' ? 0 : x}
        y={y}
        width={align === 'right' ? x : width - padding}
        text={text}
        fontSize={fontSize}
        fontFamily={branding.fontFamily || 'Inter'}
        fill={branding.color || '#ffffff'}
        opacity={branding.opacity || 0.8}
        align={align}
        lineHeight={1.5}
      />
    );
  }, [background.branding, width, height]);

  const stagePosition = useMemo(() => getStagePosition(), [getStagePosition]);

  return (
    <div 
      ref={containerRef}
      className="flex-1 bg-neutral-900 overflow-hidden relative"
      style={{ cursor: tool !== 'select' ? 'crosshair' : 'default' }}
    >
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        onClick={handleStageClick}
        x={stagePosition.x}
        y={stagePosition.y}
        scaleX={zoom}
        scaleY={zoom}
      >
        <Layer>
          {renderBackground()}
          {brandStripElement}
          {brandingElement}
          {gridLines}
          
          {snap.elements.map((element) => {
            if (!element.visible) return null;
            
            switch (element.type) {
              case 'code':
                return (
                  <CodeBlock
                    key={element.id}
                    element={element as CodeElement}
                    isSelected={selectedElementId === element.id}
                    onSelect={() => selectElement(element.id)}
                    onChange={(updates: Partial<CodeElement>) => updateElement(element.id, updates)}
                  />
                );
              case 'text':
                return (
                  <TextBlock
                    key={element.id}
                    element={element as TextElement}
                    isSelected={selectedElementId === element.id}
                    onSelect={() => selectElement(element.id)}
                    onChange={(updates: Partial<TextElement>) => updateElement(element.id, updates)}
                  />
                );
              case 'arrow':
                return (
                  <Arrow
                    key={element.id}
                    element={element as ArrowElement}
                    isSelected={selectedElementId === element.id}
                    onSelect={() => selectElement(element.id)}
                    onChange={(updates: Partial<ArrowElement>) => updateElement(element.id, updates)}
                  />
                );
              default:
                return null;
            }
          })}
        </Layer>
      </Stage>
    </div>
  );
};

export default memo(Canvas);
