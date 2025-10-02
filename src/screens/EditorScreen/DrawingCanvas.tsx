import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Canvas as SkiaCanvas, Path, Skia } from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSharedValue, runOnJS } from 'react-native-reanimated';
import { useEditorStore } from '../../stores/editorStore';
import type { DrawingStroke, Point } from '../../types/editor.types';

interface DrawingCanvasProps {
  brushType: 'pen' | 'marker' | 'pencil' | 'eraser';
  brushSize: number;
  brushOpacity: number;
  brushColor: string;
  isActive: boolean;
}

export default function DrawingCanvas({
  brushType,
  brushSize,
  brushOpacity,
  brushColor,
  isActive,
}: DrawingCanvasProps) {
  const { addLayer, canvasSize } = useEditorStore();
  const currentStroke = useSharedValue<Point[]>([]);
  const strokesRef = useRef<DrawingStroke[]>([]);

  const panGesture = Gesture.Pan()
    .enabled(isActive)
    .onStart(event => {
      const newPoint: Point = {
        x: event.x,
        y: event.y,
        pressure: event.pressure || 1.0,
      };
      currentStroke.value = [newPoint];
    })
    .onUpdate(event => {
      const newPoint: Point = {
        x: event.x,
        y: event.y,
        pressure: event.pressure || 1.0,
      };
      currentStroke.value = [...currentStroke.value, newPoint];
    })
    .onEnd(() => {
      if (currentStroke.value.length > 1) {
        const stroke: DrawingStroke = {
          id: `stroke_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          points: [...currentStroke.value],
          brushType,
          color: brushColor,
          size: brushSize,
          opacity: brushOpacity,
          timestamp: Date.now(),
        };

        strokesRef.current.push(stroke);
        runOnJS(addDrawingLayer)();
      }
      currentStroke.value = [];
    });

  const addDrawingLayer = () => {
    if (strokesRef.current.length === 0) return;

    addLayer({
      id: `drawing_${Date.now()}`,
      type: 'drawing',
      visible: true,
      locked: false,
      opacity: 1,
      blendMode: 'normal',
      transform: {
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
      },
      data: {
        strokes: [...strokesRef.current],
      },
    });

    // Clear strokes after adding to layer
    strokesRef.current = [];
  };

  const createPathFromPoints = React.useCallback((points: Point[]): string => {
    if (points.length < 2) return '';

    let pathData = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      pathData += ` L ${points[i].x} ${points[i].y}`;
    }

    return pathData;
  }, []);

  return (
    <View
      style={[
        styles.container,
        {
          width: canvasSize.width,
          height: canvasSize.height,
          display: isActive ? 'flex' : 'none',
        },
      ]}
    >
      <GestureDetector gesture={panGesture}>
        <SkiaCanvas style={styles.canvas}>
          {/* Render current stroke being drawn */}
          {isActive && currentStroke.value.length > 1 && (
            <Path
              path={createPathFromPoints(currentStroke.value)}
              color={brushColor}
              style="stroke"
              strokeWidth={brushSize}
              strokeCap="round"
              strokeJoin="round"
              opacity={brushOpacity / 100}
            />
          )}

          {/* Render completed strokes in current session */}
          {isActive &&
            strokesRef.current.map(stroke => (
              <Path
                key={stroke.id}
                path={createPathFromPoints(stroke.points)}
                color={stroke.color}
                style="stroke"
                strokeWidth={stroke.size}
                strokeCap="round"
                strokeJoin="round"
                opacity={stroke.opacity / 100}
              />
            ))}
        </SkiaCanvas>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
  },
  canvas: {
    flex: 1,
  },
});
