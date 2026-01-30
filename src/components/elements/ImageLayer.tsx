import React, { useRef, useEffect, useState } from 'react';
import { Image as KonvaImage, Transformer } from 'react-konva';
import type Konva from 'konva';
import type { ImageElement } from '../../types';

interface ImageLayerProps {
    element: ImageElement;
    isSelected: boolean;
    onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
    onChange: (updates: Partial<ImageElement>) => void;
}

const ImageLayer: React.FC<ImageLayerProps> = ({ element, isSelected, onSelect, onChange }) => {
    const shapeRef = useRef<Konva.Image>(null);
    const trRef = useRef<Konva.Transformer>(null);
    const [image, setImage] = useState<HTMLImageElement | null>(null);

    useEffect(() => {
        if (isSelected && trRef.current && shapeRef.current) {
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getLayer()?.batchDraw();
        }
    }, [isSelected]);

    // Load image
    useEffect(() => {
        const img = new window.Image();
        img.crossOrigin = 'Anonymous';
        img.src = element.props.src;
        img.onload = () => {
            setImage(img);
        };
    }, [element.props.src]);

    const handleTransformEnd = () => {
        if (shapeRef.current) {
            const node = shapeRef.current;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();

            // Reset scale and update dimensions
            node.scaleX(1);
            node.scaleY(1);

            onChange({
                x: node.x(),
                y: node.y(),
                rotation: node.rotation(),
                width: Math.max(5, node.width() * scaleX),
                height: Math.max(5, node.height() * scaleY),
            });
        }
    };

    const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
        onChange({
            x: e.target.x(),
            y: e.target.y(),
        });
    };

    if (!image) return null;

    return (
        <>
            <KonvaImage
                ref={shapeRef}
                image={image}
                x={element.x}
                y={element.y}
                width={element.width}
                height={element.height}
                rotation={element.rotation}
                opacity={element.props.opacity}
                draggable={!element.locked}
                onClick={onSelect}
                onTap={onSelect}
                onDragEnd={handleDragEnd}
                onTransformEnd={handleTransformEnd}
                strokeEnabled={false}
                shadowColor={element.props.shadow.color}
                shadowBlur={element.props.shadow.blur}
                shadowOpacity={1}
                shadowEnabled={!!element.props.shadow.blur}
                cursor={element.locked ? 'default' : 'move'}
                perfectDrawEnabled={false}
                // Corner radius logic using clipFunc if needed, or Konva might support cornerRadius for Image in newer versions?
                // Konva Image supports cornerRadius since v8.
                cornerRadius={element.props.cornerRadius}
            />
            {isSelected && !element.locked && (
                <Transformer
                    ref={trRef}
                    boundBoxFunc={(oldBox, newBox) => {
                        // limit resize
                        if (newBox.width < 5 || newBox.height < 5) {
                            return oldBox;
                        }
                        return newBox;
                    }}
                    anchorSize={8}
                    anchorCornerRadius={4}
                    borderStroke="#3b82f6"
                    anchorStroke="#3b82f6"
                    anchorFill="#ffffff"
                />
            )}
        </>
    );
};

export default ImageLayer;
