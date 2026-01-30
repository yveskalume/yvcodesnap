import React, {useRef, useState, useEffect, useMemo, memo, useCallback} from 'react';
import { Stage, Layer, Rect, Line, Text, Group, Path, Circle } from 'react-konva';
import type Konva from 'konva';
import { useCanvasStore, createCodeElement, createTextElement, createArrowElement } from '../store/canvasStore';
import CodeBlock from './elements/CodeBlock';
import TextBlock from './elements/TextBlock';
import Arrow from './elements/Arrow';
import { SOCIAL_ICON_PATHS, SOCIAL_PLATFORMS_CONFIG } from './elements/SocialIcons';
import type { CodeElement, TextElement, ArrowElement } from '../types';

const MIN_CANVAS = 320;
const MAX_CANVAS = 10000;
type ResizeEdge = 'left' | 'right' | 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface CanvasProps {
  stageRef: React.RefObject<Konva.Stage | null>;
}

const Canvas: React.FC<CanvasProps> = ({ stageRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight - 120 });
  const [stagePos, setStagePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [showResizeHandles, setShowResizeHandles] = useState(false);
  const [drawingArrowId, setDrawingArrowId] = useState<string | null>(null);
  const arrowStartRef = useRef<{ x: number; y: number } | null>(null);
  const [resizeState, setResizeState] = useState<{
    edge: ResizeEdge;
    startMouse: { x: number; y: number };
    startSize: { w: number; h: number };
    startPos: { x: number; y: number };
    startZoom: number;
  } | null>(null);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);
  const hasInteractedRef = useRef(false);
  const spacePressedRef = useRef(false);
  const cancelClickRef = useRef(false);
  const {
    snap, 
    zoom, 
    setZoom,
    updateMeta,
    showGrid,
    tool, 
    selectedElementId,
    selectElement, 
    addElement,
    updateElement,
    deleteElement,
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

  // Hide resize handles when clicking outside the canvas container
  useEffect(() => {
    const handleDocMouseDown = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const target = e.target as Node | null;
      if (target && !containerRef.current.contains(target)) {
        setShowResizeHandles(false);
        selectElement(null);
      }
    };

    document.addEventListener('mousedown', handleDocMouseDown);
    return () => document.removeEventListener('mousedown', handleDocMouseDown);
  }, [selectElement]);

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

  // Handle canvas resize via drag handles
  useEffect(() => {
    if (!resizeState) return;

    const handleMove = (ev: MouseEvent) => {
      const { edge, startMouse, startSize, startPos, startZoom } = resizeState;
      const deltaScreenX = ev.clientX - startMouse.x;
      const deltaScreenY = ev.clientY - startMouse.y;
      const deltaCanvasX = deltaScreenX / startZoom;
      const deltaCanvasY = deltaScreenY / startZoom;

      let nextWidth = startSize.w;
      let nextHeight = startSize.h;
      let nextPosX = startPos.x;
      let nextPosY = startPos.y;

      // Horizontal resize
      if (edge.includes('right')) {
        nextWidth = Math.min(MAX_CANVAS, Math.max(MIN_CANVAS, Math.round(startSize.w + deltaCanvasX)));
      }
      if (edge.includes('left')) {
        const tentative = startSize.w - deltaCanvasX;
        nextWidth = Math.min(MAX_CANVAS, Math.max(MIN_CANVAS, Math.round(tentative)));
        const appliedDelta = startSize.w - nextWidth; // canvas space
        nextPosX = startPos.x + appliedDelta * startZoom;
      }

      // Vertical resize
      if (edge.includes('bottom')) {
        nextHeight = Math.min(MAX_CANVAS, Math.max(MIN_CANVAS, Math.round(startSize.h + deltaCanvasY)));
      }
      if (edge.includes('top')) {
        const tentative = startSize.h - deltaCanvasY;
        nextHeight = Math.min(MAX_CANVAS, Math.max(MIN_CANVAS, Math.round(tentative)));
        const appliedDelta = startSize.h - nextHeight; // canvas space
        nextPosY = startPos.y + appliedDelta * startZoom;
      }

      setStagePos({ x: nextPosX, y: nextPosY });
      updateMeta({ width: nextWidth, height: nextHeight });
    };

    const handleUp = () => {
      cancelClickRef.current = true;
      setResizeState(null);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [resizeState, updateMeta]);

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

  const resetPan = useCallback(() => {
    const scaledWidth = width * zoom;
    const scaledHeight = height * zoom;
    setStagePos({
      x: Math.max(20, (dimensions.width - scaledWidth) / 2),
      y: Math.max(20, (dimensions.height - scaledHeight) / 2),
    });
  }, [dimensions.width, dimensions.height, width, height, zoom]);

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isPanning || cancelClickRef.current || resizeState) {
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

  const handleStageWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const scaleBy = 1.05;
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newZoom = Math.max(0.25, Math.min(256, zoom * (direction > 0 ? scaleBy : 1 / scaleBy)));

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
    if (drawingArrowId && arrowStartRef.current) {
      e.evt.preventDefault();
      const stage = e.target.getStage();
      const pointer = stage?.getPointerPosition();
      if (stage && pointer) {
        const canvasX = (pointer.x - stagePos.x) / zoom;
        const canvasY = (pointer.y - stagePos.y) / zoom;
        updateElement(drawingArrowId, {
          points: [
            { x: arrowStartRef.current.x, y: arrowStartRef.current.y },
            { x: canvasX, y: canvasY },
          ],
        });
      }
      return;
    }

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
    if (drawingArrowId && arrowStartRef.current) {
      const stage = stageRef.current?.getStage();
      const pointer = stage?.getPointerPosition();
      if (stage && pointer) {
        const endX = (pointer.x - stagePos.x) / zoom;
        const endY = (pointer.y - stagePos.y) / zoom;
        const start = arrowStartRef.current;
        const length = Math.hypot(endX - start.x, endY - start.y);
        if (length < 4) {
          deleteElement(drawingArrowId);
          selectElement(null);
        } else {
          updateElement(drawingArrowId, {
            points: [
              { x: start.x, y: start.y },
              { x: endX, y: endY },
            ],
          });
          selectElement(drawingArrowId);
        }
      }
      setDrawingArrowId(null);
      arrowStartRef.current = null;
      cancelClickRef.current = true;
    }

    setIsPanning(false);
    panStartRef.current = null;
  };

  // Global listeners to keep arrow preview visible even when cursor leaves stage
  useEffect(() => {
    if (!drawingArrowId || !arrowStartRef.current) return;

    const handleMove = (ev: MouseEvent) => {
      const stage = stageRef.current;
      if (!stage) return;
      // Update internal pointer position for Konva so getPointerPosition works
      stage.setPointersPositions(ev as any);
      const pointer = stage.getPointerPosition();
      if (!pointer) return;
      const canvasX = (pointer.x - stagePos.x) / zoom;
      const canvasY = (pointer.y - stagePos.y) / zoom;
      updateElement(drawingArrowId, {
        points: [
          { x: arrowStartRef.current!.x, y: arrowStartRef.current!.y },
          { x: canvasX, y: canvasY },
        ],
      });
    };

    const handleUp = (ev: MouseEvent) => {
      const stage = stageRef.current;
      if (!stage) return;
      stage.setPointersPositions(ev as any);
      const pointer = stage.getPointerPosition();
      if (!pointer) {
        setDrawingArrowId(null);
        arrowStartRef.current = null;
        return;
      }
      const endX = (pointer.x - stagePos.x) / zoom;
      const endY = (pointer.y - stagePos.y) / zoom;
      const start = arrowStartRef.current!;
      const length = Math.hypot(endX - start.x, endY - start.y);
      if (length < 4) {
        deleteElement(drawingArrowId);
        selectElement(null);
      } else {
        updateElement(drawingArrowId, {
          points: [
            { x: start.x, y: start.y },
            { x: endX, y: endY },
          ],
        });
        selectElement(drawingArrowId);
      }
      setDrawingArrowId(null);
      arrowStartRef.current = null;
      cancelClickRef.current = true;
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [drawingArrowId, stagePos.x, stagePos.y, zoom, updateElement, deleteElement, selectElement]);

  const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (tool === 'arrow' && e.evt.button === 0 && !spacePressedRef.current) {
      const stage = e.target.getStage();
      const pointer = stage?.getPointerPosition();
      if (!stage || !pointer) return;
      const canvasX = (pointer.x - stagePos.x) / zoom;
      const canvasY = (pointer.y - stagePos.y) / zoom;
      const arrow = createArrowElement(canvasX, canvasY);
      arrow.points = [
        { x: canvasX, y: canvasY },
        { x: canvasX, y: canvasY },
      ];
      addElement(arrow);
      selectElement(arrow.id);
      setDrawingArrowId(arrow.id);
      arrowStartRef.current = { x: canvasX, y: canvasY };
      cancelClickRef.current = true;
      setShowResizeHandles(false);
      return;
    }

    setShowResizeHandles(true);
    handleMouseDown(e);
  };

  const handleResizeStart = (
    edge: ResizeEdge,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    hasInteractedRef.current = true;
    cancelClickRef.current = true;
    setIsPanning(false);
    setResizeState({
      edge,
      startMouse: { x: e.clientX, y: e.clientY },
      startSize: { w: width, h: height },
      startPos: { x: stagePos.x, y: stagePos.y },
      startZoom: zoom,
    });
  };

  const stageRect = useMemo(() => ({
    left: stagePos.x,
    top: stagePos.y,
    width: width * zoom,
    height: height * zoom,
  }), [stagePos.x, stagePos.y, width, height, zoom]);

  // Handle wheel/pinch zoom and pan on canvas
  const handleContainerWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    // Check if it's a pinch zoom gesture (ctrlKey is true for pinch-to-zoom)
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      e.stopPropagation();

      const scaleBy = 1.05;
      const minZoom = 0.1;
      const maxZoom = 3;

      // Determine zoom direction
      const direction = e.deltaY > 0 ? -1 : 1;
      const newZoom = direction > 0 ? zoom * scaleBy : zoom / scaleBy;

      // Clamp zoom between min and max
      const clampedZoom = Math.min(Math.max(newZoom, minZoom), maxZoom);
      setZoom(clampedZoom);
    } else {
      // Two-finger scroll for panning
      e.preventDefault();
      e.stopPropagation();

      setStagePos(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  }, [zoom, setZoom]);

  // Prevent default browser zoom behavior on the container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const preventDefaultZoom = (e: WheelEvent) => {
      // Prevent default for both zoom (ctrl/meta) and pan (regular scroll)
      e.preventDefault();
    };

    // Use passive: false to allow preventDefault
    container.addEventListener('wheel', preventDefaultZoom, { passive: false });

    return () => {
      container.removeEventListener('wheel', preventDefaultZoom);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="flex-1 bg-neutral-900 overflow-hidden relative"
      style={{ cursor: isPanning ? 'grabbing' : tool !== 'select' ? 'crosshair' : spaceHeld ? 'grab' : 'grab' }}
      onWheel={handleContainerWheel}
      onDoubleClick={(e) => {
        // Double-click on empty area to reset pan
        if (e.target === containerRef.current) {
          resetPan();
        }
      }}
    >
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        onClick={handleStageClick}
        onWheel={handleStageWheel}
        onMouseDown={handleStageMouseDown}
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

      {/* Resize handles overlay */}
      {showResizeHandles && (
        <div className="pointer-events-none absolute inset-0">
          {[
            { edge: 'top-left', x: stageRect.left, y: stageRect.top, cursor: 'nwse-resize' },
            { edge: 'top', x: stageRect.left + stageRect.width / 2, y: stageRect.top, cursor: 'ns-resize' },
            { edge: 'top-right', x: stageRect.left + stageRect.width, y: stageRect.top, cursor: 'nesw-resize' },
            { edge: 'right', x: stageRect.left + stageRect.width, y: stageRect.top + stageRect.height / 2, cursor: 'ew-resize' },
            { edge: 'bottom-right', x: stageRect.left + stageRect.width, y: stageRect.top + stageRect.height, cursor: 'nwse-resize' },
            { edge: 'bottom', x: stageRect.left + stageRect.width / 2, y: stageRect.top + stageRect.height, cursor: 'ns-resize' },
            { edge: 'bottom-left', x: stageRect.left, y: stageRect.top + stageRect.height, cursor: 'nesw-resize' },
            { edge: 'left', x: stageRect.left, y: stageRect.top + stageRect.height / 2, cursor: 'ew-resize' },
          ].map((h) => (
            <button
              key={h.edge}
              className="pointer-events-auto absolute w-2.5 h-2.5 -translate-x-1/2 -translate-y-1/2 bg-white text-black rounded-[2px] shadow-sm border border-blue-400 hover:shadow hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              style={{ left: h.x, top: h.y, cursor: h.cursor }}
              onMouseDown={(e) => handleResizeStart(h.edge as ResizeEdge, e)}
              aria-label={`Resize ${h.edge}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default memo(Canvas);
