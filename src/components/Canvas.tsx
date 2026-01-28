import React, { useRef, useState, useEffect, useMemo, memo } from 'react';
import { Stage, Layer, Rect, Line, Text, Group, Path, Circle } from 'react-konva';
import type Konva from 'konva';
import { useCanvasStore, createCodeElement, createTextElement, createArrowElement } from '../store/canvasStore';
import CodeBlock from './elements/CodeBlock';
import TextBlock from './elements/TextBlock';
import Arrow from './elements/Arrow';
import { SOCIAL_ICON_PATHS, SOCIAL_PLATFORMS_CONFIG } from './elements/SocialIcons';
import type { CodeElement, TextElement, ArrowElement } from '../types';

interface CanvasProps {
  stageRef: React.RefObject<Konva.Stage | null>;
}

const Canvas: React.FC<CanvasProps> = ({ stageRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight - 120 });
  const [stagePos, setStagePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);
  const hasInteractedRef = useRef(false);
  const spacePressedRef = useRef(false);
  const cancelClickRef = useRef(false);
  const { 
    snap, 
    zoom, 
    setZoom,
    showGrid, 
    tool, 
    selectedElementId,
    selectElement, 
    addElement,
    updateElement,
  } = useCanvasStore();

  const { width, height } = snap.meta;
  const { background } = snap;
  const [brandingAvatar, setBrandingAvatar] = useState<HTMLImageElement | null>(null);

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

  // Keep stage centered initially and when viewport/layout changes (unless user already interacted)
  useEffect(() => {
    if (hasInteractedRef.current) return;
    const scaledWidth = width * zoom;
    const scaledHeight = height * zoom;
    setStagePos({
      x: Math.max(20, (dimensions.width - scaledWidth) / 2),
      y: Math.max(20, (dimensions.height - scaledHeight) / 2),
    });
  }, [dimensions, width, height, zoom]);

  // Track spacebar for panning with left click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        spacePressedRef.current = true;
        setSpaceHeld(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        spacePressedRef.current = false;
        setSpaceHeld(false);
        setIsPanning(false);
        panStartRef.current = null;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const url = background.branding?.avatarUrl || '';
    if (!url) {
      setBrandingAvatar(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setBrandingAvatar(img);
    img.onerror = () => setBrandingAvatar(null);
    img.src = url;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [background.branding?.avatarUrl]);

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isPanning || cancelClickRef.current) {
      cancelClickRef.current = false;
      return;
    }
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.name() === 'background';
    
    if (clickedOnEmpty) {
      const stage = e.target.getStage();
      if (!stage) return;
      
      const pos = stage.getPointerPosition();
      if (!pos) return;
      
      // Convert screen position to canvas position
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
    const iconSize = branding.socialIconSize || 20;
    const socialLayout = branding.socialLayout || 'horizontal';
    const iconGap = 16;
    const iconTextGap = 6; // Gap between icon and its text
    const avatarSize = branding.avatarSize || 56;
    const avatarGap = 14;
    const hasAvatar = Boolean(branding.showAvatar && branding.avatarUrl && brandingAvatar);

    // Build branding text lines
    const lines: string[] = [];
    if (branding.showName && branding.name) {
      lines.push(branding.name);
    }
    if (branding.showWebsite && branding.website) {
      lines.push(branding.website);
    }

    // Get active social platforms with their values
    const activeSocialPlatforms = branding.showSocial && branding.social
      ? SOCIAL_PLATFORMS_CONFIG.filter(p => branding.social[p.key as keyof typeof branding.social])
          .map(p => ({
            ...p,
            value: branding.social[p.key as keyof typeof branding.social] || ''
          }))
      : [];

    const hasTextContent = lines.length > 0;
    const hasSocialIcons = activeSocialPlatforms.length > 0;

    if (!hasTextContent && !hasSocialIcons && !hasAvatar) return null;

    const textHeight = lines.length * lineHeight;

    // Calculate social section dimensions (icon + text for each platform)
    const socialItemHeight = Math.max(iconSize, fontSize);
    const socialHeight = socialLayout === 'vertical'
      ? activeSocialPlatforms.length * socialItemHeight + (activeSocialPlatforms.length - 1) * (iconGap - 4)
      : socialItemHeight;

    // Calculate total content height
    const contentHeight = (hasTextContent || hasSocialIcons)
      ? textHeight + (hasTextContent && hasSocialIcons ? 16 : 0) + (hasSocialIcons ? socialHeight : 0)
      : 0;
    const blockHeight = Math.max(contentHeight, hasAvatar ? avatarSize : 0);

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
        y = height - padding - blockHeight;
        align = 'left';
        break;
      case 'bottom-right':
        x = width - padding;
        y = height - padding - blockHeight;
        align = 'right';
        break;
    }

    const totalHeight = blockHeight;
    const contentTop = contentHeight > 0 ? y + (totalHeight - contentHeight) / 2 : y;
    const avatarY = hasAvatar ? y + (totalHeight - avatarSize) / 2 : 0;
    const avatarCenterX = align === 'right' ? x - avatarSize / 2 : x + avatarSize / 2;
    const avatarCenterY = avatarY + avatarSize / 2;
    const avatarPatternScale = hasAvatar && brandingAvatar && brandingAvatar.width && brandingAvatar.height
      ? Math.max(avatarSize / brandingAvatar.width, avatarSize / brandingAvatar.height)
      : 1;

    const avatarOffset = hasAvatar ? avatarSize + avatarGap : 0;
    const textStartXBase = align === 'right' ? x - avatarOffset : x + avatarOffset;
    const textX = align === 'right' ? 0 : textStartXBase;
    const textWidth = align === 'right'
      ? Math.max(textStartXBase, 0)
      : Math.max(width - padding - textStartXBase, 0);

    // Calculate icon positions
    const iconScale = iconSize / 24; // SVG viewBox is 24x24
    const socialStartY = contentTop + textHeight + (hasTextContent ? 16 : 0);
    const anchorX = textStartXBase;

    return (
      <Group opacity={branding.opacity || 0.8}>
        {/* Avatar */}
        {hasAvatar && brandingAvatar && (
          <Circle
            x={avatarCenterX}
            y={avatarCenterY}
            radius={avatarSize / 2}
            fillPatternImage={brandingAvatar}
            fillPatternScaleX={avatarPatternScale}
            fillPatternScaleY={avatarPatternScale}
            fillPatternOffsetX={brandingAvatar.width / 2}
            fillPatternOffsetY={brandingAvatar.height / 2}
            listening={false}
          />
        )}

        {/* Text content */}
        {hasTextContent && (
          <Text
            x={textX}
            y={contentTop}
            width={textWidth}
            text={lines.join('\n')}
            fontSize={fontSize}
            fontFamily={branding.fontFamily || 'Inter'}
            fill={branding.color || '#ffffff'}
            align={align}
            lineHeight={1.5}
          />
        )}
        
        {/* Social icons with text */}
        {hasSocialIcons && activeSocialPlatforms.map((platform, index) => {
          const path = SOCIAL_ICON_PATHS[platform.key];
          if (!path) return null;
          
          // Calculate position for this social item
          let itemX: number;
          let itemY: number;
          
          if (socialLayout === 'vertical') {
            itemY = socialStartY + index * (socialItemHeight + iconGap - 4);
            itemX = anchorX;
          } else {
            itemY = socialStartY;
            // For horizontal layout, we need to calculate cumulative width
            // This is simplified - for perfect alignment we'd need to measure text
            const prevItemsWidth = activeSocialPlatforms.slice(0, index).reduce((acc, p) => {
              const textWidthEstimate = (p.value.length * fontSize * 0.5); // Approximate text width
              return acc + iconSize + iconTextGap + textWidthEstimate + iconGap;
            }, 0);
            itemX = align === 'right' ? anchorX - prevItemsWidth : anchorX + prevItemsWidth;
          }

          // Icon vertical centering within item
          const iconY = itemY + (socialItemHeight - iconSize) / 2;
          // Text vertical centering
          const textY = itemY + (socialItemHeight - fontSize) / 2;

          if (align === 'right') {
            // For right alignment: text first, then icon
            const textWidthEstimate = platform.value.length * fontSize * 0.5; // Approximate
            return (
              <Group key={platform.key}>
                <Path
                  x={itemX - iconSize}
                  y={iconY}
                  data={path}
                  fill={branding.color || '#ffffff'}
                  scaleX={iconScale}
                  scaleY={iconScale}
                />
                <Text
                  x={itemX - iconSize - iconTextGap - textWidthEstimate}
                  y={textY}
                  text={platform.value}
                  fontSize={fontSize}
                  fontFamily={branding.fontFamily || 'Inter'}
                  fill={branding.color || '#ffffff'}
                />
              </Group>
            );
          } else {
            // For left alignment: icon first, then text
            return (
              <Group key={platform.key}>
                <Path
                  x={itemX}
                  y={iconY}
                  data={path}
                  fill={branding.color || '#ffffff'}
                  scaleX={iconScale}
                  scaleY={iconScale}
                />
                <Text
                  x={itemX + iconSize + iconTextGap}
                  y={textY}
                  text={platform.value}
                  fontSize={fontSize}
                  fontFamily={branding.fontFamily || 'Inter'}
                  fill={branding.color || '#ffffff'}
                />
              </Group>
            );
          }
        })}
      </Group>
    );
  }, [background.branding, width, height, brandingAvatar]);

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const scaleBy = 1.05;
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newZoom = Math.max(0.25, Math.min(4, zoom * (direction > 0 ? scaleBy : 1 / scaleBy)));

    const mousePointTo = {
      x: (pointer.x - stagePos.x) / zoom,
      y: (pointer.y - stagePos.y) / zoom,
    };

    const newPos = {
      x: pointer.x - mousePointTo.x * newZoom,
      y: pointer.y - mousePointTo.y * newZoom,
    };

    hasInteractedRef.current = true;
    setZoom(newZoom);
    setStagePos(newPos);
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const isMiddleClick = e.evt.button === 1;
    const isSpaceDrag = e.evt.button === 0 && spacePressedRef.current;
    const isLeftClick = e.evt.button === 0;
    const isBackground = e.target === e.target.getStage() || e.target.name() === 'background';
    const isBackgroundDrag = isLeftClick && isBackground && tool === 'select' && !spacePressedRef.current;
    if (!isMiddleClick && !isSpaceDrag && !isBackgroundDrag) return;

    e.evt.preventDefault();
    hasInteractedRef.current = true;
    setIsPanning(true);
    cancelClickRef.current = false;
    panStartRef.current = { x: e.evt.clientX, y: e.evt.clientY };
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isPanning || !panStartRef.current) return;
    e.evt.preventDefault();

    const dx = e.evt.clientX - panStartRef.current.x;
    const dy = e.evt.clientY - panStartRef.current.y;

    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
      cancelClickRef.current = true;
    }

    setStagePos((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    panStartRef.current = { x: e.evt.clientX, y: e.evt.clientY };
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    panStartRef.current = null;
  };

  return (
    <div 
      ref={containerRef}
      className="flex-1 bg-neutral-900 overflow-hidden relative"
      style={{ cursor: isPanning ? 'grabbing' : tool !== 'select' ? 'crosshair' : spaceHeld ? 'grab' : 'grab' }}
    >
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        onClick={handleStageClick}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        x={stagePos.x}
        y={stagePos.y}
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
