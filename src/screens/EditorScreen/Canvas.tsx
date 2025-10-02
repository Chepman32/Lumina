import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import {
  Canvas as SkiaCanvas,
  Rect,
  LinearGradient,
  vec,
  Group,
  Image as SkiaImage,
  useImage,
} from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { useEditorStore } from '../../stores/editorStore';
import type {
  Layer,
  StickerLayerData,
  TextLayerData,
} from '../../types/editor.types';
import LayerRenderer from './LayerRenderer';
import { COLORS } from '../../utils/constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function Canvas() {
  const {
    layers,
    activeLayerId,
    canvasSize,
    zoom,
    pan,
    setCanvasSize,
    setZoom,
    setPan,
    setActiveLayer,
    updateLayer,
  } = useEditorStore();

  const [canvasReady, setCanvasReady] = useState(false);
  const [isLayerDragging, setIsLayerDragging] = useState(false);

  const layersRef = useRef<Layer[]>(layers);
  useEffect(() => {
    layersRef.current = layers;
  }, [layers]);

  const draggingLayerId = useRef<string | null>(null);
  const dragInitialTransform = useRef<{ x: number; y: number } | null>(null);
  const lastUpdateTime = useRef<number>(0);

  // Canvas transform values
  const scale = useSharedValue(zoom);
  const translateX = useSharedValue(pan.x);
  const translateY = useSharedValue(pan.y);

  const transformRef = useRef({ scale: zoom, translateX: pan.x, translateY: pan.y });
  useEffect(() => {
    transformRef.current = { scale: zoom, translateX: pan.x, translateY: pan.y };
  }, [zoom, pan.x, pan.y]);

  useEffect(() => {
    scale.value = zoom;
  }, [scale, zoom]);

  useEffect(() => {
    translateX.value = pan.x;
  }, [translateX, pan.x]);

  useEffect(() => {
    translateY.value = pan.y;
  }, [translateY, pan.y]);

  // Initialize canvas size
  useEffect(() => {
    const canvasWidth = SCREEN_WIDTH;
    const canvasHeight = SCREEN_HEIGHT - 200; // Account for toolbars
    setCanvasSize(canvasWidth, canvasHeight);
    setCanvasReady(true);
  }, [setCanvasSize]);

  // Pan gesture for canvas navigation
  const panGesture = Gesture.Pan()
    .minPointers(1)
    .maxPointers(1)
    .enabled(!isLayerDragging)
    .onUpdate(event => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd(() => {
      runOnJS(setPan)(translateX.value, translateY.value);
    });

  // Pinch gesture for zoom
  const pinchGesture = Gesture.Pinch()
    .enabled(!isLayerDragging)
    .onUpdate(event => {
      scale.value = Math.max(0.5, Math.min(5, event.scale));
    })
    .onEnd(() => {
      runOnJS(setZoom)(scale.value);
    });

  // Combine gestures
  const composedGesture = useMemo(
    () => Gesture.Simultaneous(panGesture, pinchGesture),
    [panGesture, pinchGesture],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const getLayerSize = useCallback((layer: Layer) => {
    switch (layer.type) {
      case 'sticker': {
        const data = layer.data as StickerLayerData;
        return {
          width: (data.width || 0) * layer.transform.scale,
          height: (data.height || 0) * layer.transform.scale,
        };
      }
      case 'text': {
        const data = layer.data as TextLayerData;
        return {
          width: (data.textWidth || 120) * layer.transform.scale,
          height: (data.textHeight || 40) * layer.transform.scale,
        };
      }
      default:
        return { width: 0, height: 0 };
    }
  }, []);

  const convertToCanvasCoords = useCallback(
    (viewX: number, viewY: number) => {
      const { scale: currentScale, translateX: currentTranslateX, translateY: currentTranslateY } =
        transformRef.current;

      const canvasX = viewX / currentScale - currentTranslateX;
      const canvasY = viewY / currentScale - currentTranslateY;

      return { x: canvasX, y: canvasY };
    },
    [],
  );

  const handleDragStart = useCallback(
    (x: number, y: number) => {
      const candidateTypes: Array<Layer['type']> = ['sticker', 'text'];
      const currentLayers = layersRef.current;

      for (let i = currentLayers.length - 1; i >= 0; i--) {
        const layer = currentLayers[i];
        if (!layer.visible || !candidateTypes.includes(layer.type)) continue;

        const { transform } = layer;
        const { width, height } = getLayerSize(layer);

        const { x: canvasX, y: canvasY } = convertToCanvasCoords(x, y);

        const localX = canvasX - transform.x;
        const localY = canvasY - transform.y;

        if (localX >= 0 && localX <= width && localY >= 0 && localY <= height) {
          draggingLayerId.current = layer.id;
          dragInitialTransform.current = {
            x: layer.transform.x,
            y: layer.transform.y,
          };
          if (activeLayerId !== layer.id) {
            setActiveLayer(layer.id);
          }
          if (!isLayerDragging) {
            setIsLayerDragging(true);
          }
          return;
        }
      }

      draggingLayerId.current = null;
      dragInitialTransform.current = null;
    },
    [activeLayerId, convertToCanvasCoords, getLayerSize, isLayerDragging, setActiveLayer],
  );

  const handleDragMove = useCallback(
    (translationX: number, translationY: number) => {
      const layerId = draggingLayerId.current;
      if (!layerId) return;

      const currentLayers = layersRef.current;
      const targetLayer = currentLayers.find(layer => layer.id === layerId);
      if (!targetLayer) return;

      const initialTransform = dragInitialTransform.current;
      if (!initialTransform) return;

      const { scale: canvasScale } = transformRef.current;
      const effectiveScale = canvasScale === 0 ? 1 : canvasScale;

      const deltaX = translationX / effectiveScale;
      const deltaY = translationY / effectiveScale;

      const newX = initialTransform.x + deltaX;
      const newY = initialTransform.y + deltaY;

      // Throttle updates to 60fps (16ms) for smoother movement
      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdateTime.current;

      if (timeSinceLastUpdate < 16) {
        return;
      }

      lastUpdateTime.current = now;

      updateLayer(layerId, {
        transform: {
          ...targetLayer.transform,
          x: newX,
          y: newY,
        },
      });
    },
    [updateLayer],
  );

  const handleDragEnd = useCallback(() => {
    if (draggingLayerId.current) {
      draggingLayerId.current = null;
    }
    dragInitialTransform.current = null;
    if (isLayerDragging) {
      setIsLayerDragging(false);
    }
  }, [isLayerDragging]);

  const layerDragGesture = useMemo(() => {
    return Gesture.Pan()
      .maxPointers(1)
      .minDistance(0)
      .manualActivation(true)
      .runOnJS(true)
      .onTouchesDown((event, stateManager) => {
        const touch = event.allTouches[0];
        if (!touch) {
          stateManager.fail();
          return;
        }

        handleDragStart(touch.x, touch.y);

        if (draggingLayerId.current) {
          stateManager.activate();
        } else {
          stateManager.fail();
        }
      })
      .onUpdate(event => {
        if (!draggingLayerId.current) {
          return;
        }
        handleDragMove(event.translationX, event.translationY);
      })
      .onEnd(() => {
        handleDragEnd();
      })
      .onTouchesCancelled(() => {
        handleDragEnd();
      })
      .onFinalize(() => {
        handleDragEnd();
      });
  }, [handleDragEnd, handleDragMove, handleDragStart]);

  const combinedGesture = useMemo(
    () => Gesture.Exclusive(layerDragGesture, composedGesture),
    [layerDragGesture, composedGesture],
  );

  if (!canvasReady) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <GestureDetector gesture={combinedGesture}>
        <View style={styles.canvasWrapper}>
          <SkiaCanvas style={[styles.canvas, animatedStyle]}>
            {/* Background */}
            <Rect
              x={0}
              y={0}
              width={canvasSize.width}
              height={canvasSize.height}
            >
              <LinearGradient
                start={vec(0, 0)}
                end={vec(canvasSize.width, canvasSize.height)}
                colors={[COLORS.darkGray, COLORS.black]}
              />
            </Rect>

            {/* Grid overlay (optional) */}
            <Group>{/* Grid lines can be added here */}</Group>

            {/* Render layers */}
            <Group>
              {layers
                .filter(layer => {
                  console.log('Layer:', layer.id, layer.type, layer.visible, layer.transform);
                  return layer.visible;
                })
                .map(layer => (
                  <LayerRenderer
                    key={layer.id}
                    layer={layer}
                    isActive={layer.id === activeLayerId}
                    onLayerPress={setActiveLayer}
                  />
                ))}
            </Group>

            {/* Selection handles for active layer */}
            {/* Will be implemented when layer selection is added */}
          </SkiaCanvas>
        </View>
      </GestureDetector>

      {/* Canvas info overlay */}
      <View style={styles.infoOverlay}>
        <View style={styles.infoItem}>
          <View style={styles.infoDot} />
          <View style={styles.infoText}>
            <View style={styles.infoLabel} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.darkGray,
  },
  canvasWrapper: {
    flex: 1,
  },
  canvas: {
    flex: 1,
  },
  infoOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    padding: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: 8,
  },
  infoText: {
    flexDirection: 'column',
  },
  infoLabel: {
    width: 60,
    height: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 2,
  },
});
