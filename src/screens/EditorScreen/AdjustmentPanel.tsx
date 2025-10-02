import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useEditorStore } from '../../stores/editorStore';
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  BORDER_RADIUS,
} from '../../utils/constants';

interface AdjustmentControl {
  key: keyof typeof import('../../utils/constants').DEFAULT_ADJUSTMENTS;
  label: string;
  min: number;
  max: number;
  icon: string;
}

const ADJUSTMENTS: AdjustmentControl[] = [
  { key: 'brightness', label: 'Brightness', min: -100, max: 100, icon: '☀️' },
  { key: 'contrast', label: 'Contrast', min: -100, max: 100, icon: '◐' },
  { key: 'saturation', label: 'Saturation', min: -100, max: 100, icon: '🎨' },
  { key: 'temperature', label: 'Temperature', min: -100, max: 100, icon: '🌡️' },
  { key: 'tint', label: 'Tint', min: -100, max: 100, icon: '🔮' },
  { key: 'exposure', label: 'Exposure', min: -200, max: 200, icon: '📷' },
  { key: 'highlights', label: 'Highlights', min: -100, max: 100, icon: '✨' },
  { key: 'shadows', label: 'Shadows', min: -100, max: 100, icon: '🌑' },
  { key: 'sharpness', label: 'Sharpness', min: 0, max: 100, icon: '🔍' },
  { key: 'vibrance', label: 'Vibrance', min: -100, max: 100, icon: '🌈' },
];

const PRESETS = [
  { name: 'Auto', values: { brightness: 10, contrast: 15, saturation: 10 } },
  { name: 'Portrait', values: { brightness: 5, contrast: 10, sharpness: 20 } },
  { name: 'Vivid', values: { saturation: 30, vibrance: 25, contrast: 20 } },
  { name: 'Reset', values: {} }, // Empty object means reset all
];

export default function AdjustmentPanel() {
  const { adjustments, updateAdjustment, resetAdjustments } = useEditorStore();
  const [activeAdjustment, setActiveAdjustment] = useState<string | null>(null);

  const handleAdjustmentPress = (key: string) => {
    setActiveAdjustment(activeAdjustment === key ? null : key);
  };

  const handleValueChange = (key: keyof typeof adjustments, delta: number) => {
    const currentValue = adjustments[key];
    const adjustment = ADJUSTMENTS.find(adj => adj.key === key);
    if (!adjustment) return;

    const newValue = Math.max(
      adjustment.min,
      Math.min(adjustment.max, currentValue + delta),
    );
    updateAdjustment(key, newValue);
  };

  const handlePresetPress = (preset: (typeof PRESETS)[0]) => {
    if (preset.name === 'Reset') {
      resetAdjustments();
    } else {
      Object.entries(preset.values).forEach(([key, value]) => {
        updateAdjustment(key as keyof typeof adjustments, value);
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Presets */}
      <View style={styles.presetsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {PRESETS.map(preset => (
            <TouchableOpacity
              key={preset.name}
              style={styles.presetButton}
              onPress={() => handlePresetPress(preset)}
            >
              <Text style={styles.presetButtonText}>{preset.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Adjustments List */}
      <ScrollView style={styles.adjustmentsList}>
        {ADJUSTMENTS.map(adjustment => {
          const currentValue = adjustments[adjustment.key];
          const isActive = activeAdjustment === adjustment.key;

          return (
            <View key={adjustment.key} style={styles.adjustmentItem}>
              <TouchableOpacity
                style={styles.adjustmentHeader}
                onPress={() => handleAdjustmentPress(adjustment.key)}
              >
                <View style={styles.adjustmentInfo}>
                  <Text style={styles.adjustmentIcon}>{adjustment.icon}</Text>
                  <Text style={styles.adjustmentLabel}>{adjustment.label}</Text>
                </View>
                <View style={styles.adjustmentValue}>
                  <Text style={styles.adjustmentValueText}>
                    {currentValue > 0 ? '+' : ''}
                    {currentValue}
                  </Text>
                  {currentValue !== 0 && (
                    <TouchableOpacity
                      style={styles.resetButton}
                      onPress={() => updateAdjustment(adjustment.key, 0)}
                    >
                      <Text style={styles.resetButtonText}>×</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>

              {isActive && (
                <View style={styles.sliderContainer}>
                  <View style={styles.sliderTrack}>
                    <View
                      style={[
                        styles.sliderFill,
                        {
                          width: `${
                            (Math.abs(currentValue) /
                              Math.max(
                                Math.abs(adjustment.min),
                                adjustment.max,
                              )) *
                            100
                          }%`,
                          backgroundColor:
                            currentValue >= 0 ? COLORS.primary : COLORS.accent,
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.sliderControls}>
                    <TouchableOpacity
                      style={styles.sliderButton}
                      onPress={() => handleValueChange(adjustment.key, -10)}
                    >
                      <Text style={styles.sliderButtonText}>-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.sliderButton}
                      onPress={() => handleValueChange(adjustment.key, 10)}
                    >
                      <Text style={styles.sliderButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.9)',
    height: 300,
  },
  presetsContainer: {
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.s,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.darkGray,
  },
  presetButton: {
    backgroundColor: COLORS.darkGray,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    borderRadius: BORDER_RADIUS.medium,
    marginRight: SPACING.s,
  },
  presetButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.bodySmall,
    fontWeight: '600',
  },
  adjustmentsList: {
    flex: 1,
  },
  adjustmentItem: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.darkGray,
  },
  adjustmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.m,
  },
  adjustmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  adjustmentIcon: {
    fontSize: 20,
    marginRight: SPACING.s,
  },
  adjustmentLabel: {
    color: COLORS.white,
    fontSize: FONT_SIZES.body,
  },
  adjustmentValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adjustmentValueText: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.bodySmall,
    minWidth: 40,
    textAlign: 'right',
  },
  resetButton: {
    marginLeft: SPACING.s,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.darkGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  sliderContainer: {
    paddingHorizontal: SPACING.m,
    paddingBottom: SPACING.m,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: COLORS.darkGray,
    borderRadius: 2,
    marginBottom: SPACING.s,
  },
  sliderFill: {
    height: '100%',
    borderRadius: 2,
  },
  sliderControls: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  sliderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.darkGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING.s,
  },
  sliderButtonText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
});
