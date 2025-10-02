import React, { useMemo } from 'react';
import {
  Group,
  Rect,
  Image as SkiaImage,
  useImage,
  Circle,
  Path,
  Skia,
  Paragraph,
} from '@shopify/react-native-skia';
import type {
  Layer,
  ImageLayerData,
  StickerLayerData,
  TextLayerData,
  DrawingLayerData,
} from '../../types/editor.types';
import { StickerService } from '../../services/StickerService';
import { COLORS } from '../../utils/constants';
import { useEditorStore } from '../../stores/editorStore';
import { FilterService } from '../../services/FilterService';

interface LayerRendererProps {
  layer: Layer;
  isActive?: boolean;
  onLayerPress?: (layerId: string) => void;
}

export default function LayerRenderer({
  layer,
  isActive = false,
  onLayerPress,
}: LayerRendererProps) {
  const { transform, opacity, visible } = layer;

  if (!visible) return null;

  const renderLayerContent = () => {
    switch (layer.type) {
      case 'image':
        return <ImageLayerRenderer layer={layer} />;
      case 'sticker':
        return <StickerLayerRenderer layer={layer} />;
      case 'text':
        return <TextLayerRenderer layer={layer} />;
      case 'drawing':
        return <DrawingLayerRenderer layer={layer} />;
      default:
        return null;
    }
  };

  return (
    <Group
      transform={[
        { translateX: transform.x },
        { translateY: transform.y },
        { scale: transform.scale },
        { rotate: transform.rotation },
      ]}
      opacity={opacity}
    >
      {renderLayerContent()}
      {isActive && <SelectionHandles layer={layer} />}
    </Group>
  );
}

function ImageLayerRenderer({ layer }: { layer: Layer }) {
  const data = layer.data as ImageLayerData;
  const image = useImage(data.path);
  const filters = useEditorStore(state => state.filters);

  const filteredImage = useMemo(() => {
    if (!image) return null;
    if (!filters.length) return image;

    let currentImage = image;

    filters.forEach(filter => {
      if (!filter || filter.intensity <= 0) {
        return;
      }

      const result = FilterService.applyFilter(
        currentImage,
        filter.name,
        Math.max(0, Math.min(1, filter.intensity ?? 1)),
      );

      if (result) {
        currentImage = result;
      }
    });

    return currentImage;
  }, [filters, image]);

  const imageToRender = filteredImage ?? image;

  if (!imageToRender) {
    // Show placeholder while loading
    return (
      <Rect
        x={0}
        y={0}
        width={data.width}
        height={data.height}
        color={COLORS.darkGray}
      />
    );
  }

  return (
    <SkiaImage
      image={imageToRender}
      x={0}
      y={0}
      width={data.width}
      height={data.height}
      fit="cover"
    />
  );
}

function StickerLayerRenderer({ layer }: { layer: Layer }) {
  const data = layer.data as StickerLayerData;
  const stickerAsset = StickerService.getStickerById(data.assetId);
  const emoji = data.emoji ?? stickerAsset?.emoji;

  console.log('StickerLayerRenderer:', {
    layerId: layer.id,
    emoji,
    width: data.width,
    height: data.height,
    assetId: data.assetId,
  });

  const paragraph = useMemo(() => {
    if (!emoji) {
      console.log('No emoji for sticker:', layer.id);
      return null;
    }
    const para = StickerService.createEmojiParagraph(emoji, data.width, data.height);
    console.log('Created paragraph:', para ? 'success' : 'failed');
    return para;
  }, [emoji, data.height, data.width, layer.id]);

  if (!paragraph) {
    console.log('Rendering fallback rect for:', layer.id);
    return (
      <Rect
        x={0}
        y={0}
        width={data.width}
        height={data.height}
        color={COLORS.accent}
        rx={8}
      />
    );
  }

  const paragraphHeight = paragraph.getHeight();
  const yOffset = (data.height - paragraphHeight) / 2;

  console.log('Rendering paragraph - height:', paragraphHeight, 'yOffset:', yOffset);

  return (
    <Paragraph
      paragraph={paragraph}
      x={0}
      y={yOffset}
      width={data.width}
    />
  );
}

function TextLayerRenderer({ layer }: { layer: Layer }) {
  const data = layer.data as TextLayerData;

  // For now, render a placeholder
  return (
    <Rect
      x={0}
      y={0}
      width={data.textWidth || 120}
      height={data.textHeight || 40}
      color={COLORS.info}
      rx={4}
    />
  );
}

function DrawingLayerRenderer({ layer }: { layer: Layer }) {
  const data = layer.data as DrawingLayerData;

  if (!data.strokes || data.strokes.length === 0) {
    return null;
  }

  return (
    <Group>
      {data.strokes.map(stroke => {
        if (stroke.points.length < 2) return null;

        // Create path from points
        const path = Skia.Path.Make();
        const firstPoint = stroke.points[0];
        path.moveTo(firstPoint.x, firstPoint.y);

        for (let i = 1; i < stroke.points.length; i++) {
          const point = stroke.points[i];
          path.lineTo(point.x, point.y);
        }

        return (
          <Path
            key={stroke.id}
            path={path}
            color={stroke.color}
            style="stroke"
            strokeWidth={stroke.size}
            strokeCap="round"
            strokeJoin="round"
            opacity={stroke.opacity / 100}
          />
        );
      })}
    </Group>
  );
}

function SelectionHandles({ layer }: { layer: Layer }) {
  // Don't show selection handles for stickers
  if (layer.type === 'sticker') {
    return null;
  }

  const getLayerBounds = () => {
    switch (layer.type) {
      case 'image':
        const imageData = layer.data as ImageLayerData;
        return { width: imageData.width, height: imageData.height };
      case 'text':
        const textData = layer.data as TextLayerData;
        return {
          width: textData.textWidth || 120,
          height: textData.textHeight || 40,
        };
      default:
        return { width: 100, height: 100 };
    }
  };

  const { width, height } = getLayerBounds();
  const handleSize = 12;
  const handleOffset = handleSize / 2;

  return (
    <Group>
      {/* Selection border */}
      <Rect
        x={-2}
        y={-2}
        width={width + 4}
        height={height + 4}
        style="stroke"
        strokeWidth={2}
        color={COLORS.primary}
        strokeDashArray={[5, 5]}
      />

      {/* Corner handles */}
      {/* Top-left */}
      <Circle
        cx={-handleOffset}
        cy={-handleOffset}
        r={handleOffset}
        color={COLORS.white}
        style="fill"
      />
      <Circle
        cx={-handleOffset}
        cy={-handleOffset}
        r={handleOffset}
        color={COLORS.primary}
        style="stroke"
        strokeWidth={2}
      />

      {/* Top-right */}
      <Circle
        cx={width + handleOffset}
        cy={-handleOffset}
        r={handleOffset}
        color={COLORS.white}
        style="fill"
      />
      <Circle
        cx={width + handleOffset}
        cy={-handleOffset}
        r={handleOffset}
        color={COLORS.primary}
        style="stroke"
        strokeWidth={2}
      />

      {/* Bottom-left */}
      <Circle
        cx={-handleOffset}
        cy={height + handleOffset}
        r={handleOffset}
        color={COLORS.white}
        style="fill"
      />
      <Circle
        cx={-handleOffset}
        cy={height + handleOffset}
        r={handleOffset}
        color={COLORS.primary}
        style="stroke"
        strokeWidth={2}
      />

      {/* Bottom-right */}
      <Circle
        cx={width + handleOffset}
        cy={height + handleOffset}
        r={handleOffset}
        color={COLORS.white}
        style="fill"
      />
      <Circle
        cx={width + handleOffset}
        cy={height + handleOffset}
        r={handleOffset}
        color={COLORS.primary}
        style="stroke"
        strokeWidth={2}
      />

      {/* Rotation handle */}
      <Circle
        cx={width / 2}
        cy={-30}
        r={8}
        color={COLORS.accent}
        style="fill"
      />
      <Path
        path="M -3 -1 L 0 -4 L 3 -1 Z"
        color={COLORS.white}
        transform={[{ translateX: width / 2 }, { translateY: -30 }]}
      />
    </Group>
  );
}
