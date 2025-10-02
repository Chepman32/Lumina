import React, { useEffect, useState } from 'react';
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
  } = useEditorStore();

  const [canvasReady, setCanvasReady] = useState(false);

  // Canvas transform values
  const scale = useSharedValue(zoom);
  const translateX = useSharedValue(pan.x);
  const translateY = useSharedValue(pan.y);

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
    .onUpdate(event => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd(() => {
      runOnJS(setPan)(translateX.value, translateY.value);
    });

  // Pinch gesture for zoom
  const pinchGesture = Gesture.Pinch()
    .onUpdate(event => {
      scale.value = Math.max(0.5, Math.min(5, event.scale));
    })
    .onEnd(() => {
      runOnJS(setZoom)(scale.value);
    });

  // Combine gestures
  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  if (!canvasReady) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <GestureDetector gesture={composedGesture}>
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
                .filter(layer => layer.visible)
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
