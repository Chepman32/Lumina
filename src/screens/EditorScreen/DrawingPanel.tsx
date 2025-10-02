import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  BORDER_RADIUS,
} from '../../utils/constants';

type BrushType = 'pen' | 'marker' | 'pencil' | 'eraser';

interface DrawingPanelProps {
  brushType: BrushType;
  setBrushType: (type: BrushType) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  brushOpacity: number;
  setBrushOpacity: (opacity: number) => void;
  brushColor: string;
  setBrushColor: (color: string) => void;
}

const BRUSH_TYPES: Array<{ id: BrushType; name: string; icon: string }> = [
  { id: 'pen', name: 'Pen', icon: '🖊️' },
  { id: 'marker', name: 'Marker', icon: '🖍️' },
  { id: 'pencil', name: 'Pencil', icon: '✏️' },
  { id: 'eraser', name: 'Eraser', icon: '🧽' },
];

const BRUSH_COLORS = [
  COLORS.white,
  COLORS.black,
  COLORS.primary,
  COLORS.accent,
  COLORS.success,
  COLORS.error,
  COLORS.warning,
  COLORS.info,
];

export default function DrawingPanel({
  brushType,
  setBrushType,
  brushSize,
  setBrushSize,
  brushOpacity,
  setBrushOpacity,
  brushColor,
  setBrushColor,
}: DrawingPanelProps) {
  const handleClearAll = () => {
    // TODO: Implement clear all drawing strokes
    console.log('Clear all drawing');
  };

  return (
    <View style={styles.container}>
      {/* Brush Types */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Brush Tools</Text>
        <View style={styles.brushContainer}>
          {BRUSH_TYPES.map(brush => (
            <TouchableOpacity
              key={brush.id}
              style={[
                styles.brushButton,
                brushType === brush.id && styles.brushButtonActive,
              ]}
              onPress={() => setBrushType(brush.id)}
            >
              <Text style={styles.brushIcon}>{brush.icon}</Text>
              <Text
                style={[
                  styles.brushName,
                  brushType === brush.id && styles.brushNameActive,
                ]}
              >
                {brush.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Brush Size */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Size: {brushSize}pt</Text>
        <View style={styles.sliderContainer}>
          <View style={styles.sliderTrack}>
            <View
              style={[
                styles.sliderFill,
                { width: `${(brushSize / 50) * 100}%` },
              ]}
            />
          </View>
          <View style={styles.sliderControls}>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setBrushSize(Math.max(2, brushSize - 2))}
            >
              <Text style={styles.sliderButtonText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setBrushSize(Math.min(50, brushSize + 2))}
            >
              <Text style={styles.sliderButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Brush Opacity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Opacity: {brushOpacity}%</Text>
        <View style={styles.sliderContainer}>
          <View style={styles.sliderTrack}>
            <View style={[styles.sliderFill, { width: `${brushOpacity}%` }]} />
          </View>
          <View style={styles.sliderControls}>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setBrushOpacity(Math.max(10, brushOpacity - 10))}
            >
              <Text style={styles.sliderButtonText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setBrushOpacity(Math.min(100, brushOpacity + 10))}
            >
              <Text style={styles.sliderButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Colors */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Colors</Text>
        <View style={styles.colorContainer}>
          {BRUSH_COLORS.map(color => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorButton,
                { backgroundColor: color },
                brushColor === color && styles.colorButtonActive,
              ]}
              onPress={() => setBrushColor(color)}
            />
          ))}
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleClearAll}>
          <Text style={styles.actionButtonText}>Clear All</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.9)',
    height: 180,
    padding: SPACING.m,
  },
  section: {
    marginBottom: SPACING.m,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.bodySmall,
    fontWeight: '600',
    marginBottom: SPACING.s,
  },
  brushContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  brushButton: {
    alignItems: 'center',
    paddingVertical: SPACING.s,
    paddingHorizontal: SPACING.s,
    borderRadius: BORDER_RADIUS.small,
    minWidth: 60,
  },
  brushButtonActive: {
    backgroundColor: COLORS.primary,
  },
  brushIcon: {
    fontSize: 20,
    marginBottom: SPACING.xxs,
  },
  brushName: {
    fontSize: FONT_SIZES.caption,
    color: COLORS.lightGray,
    textAlign: 'center',
  },
  brushNameActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  sliderContainer: {
    marginBottom: SPACING.s,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: COLORS.darkGray,
    borderRadius: 2,
    marginBottom: SPACING.s,
  },
  sliderFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  sliderControls: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  sliderButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.darkGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING.s,
  },
  sliderButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: SPACING.s,
    marginBottom: SPACING.s,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorButtonActive: {
    borderColor: COLORS.white,
    borderWidth: 3,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButton: {
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.s,
    borderRadius: BORDER_RADIUS.medium,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.bodySmall,
    fontWeight: '600',
  },
});
