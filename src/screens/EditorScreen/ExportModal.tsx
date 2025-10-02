import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useEditorStore } from '../../stores/editorStore';
import { ExportService } from '../../services/ExportService';
import type {
  ExportOptions,
  ExportProgress,
} from '../../services/ExportService';
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  BORDER_RADIUS,
  SHADOWS,
} from '../../utils/constants';

interface ExportModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ExportModal({ visible, onClose }: ExportModalProps) {
  const editorState = useEditorStore();
  const [selectedFormat, setSelectedFormat] = useState('jpg');
  const [selectedQuality, setSelectedQuality] = useState(85);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(
    null,
  );

  const formats = ExportService.getAvailableFormats();
  const qualityPresets = ExportService.getQualityPresets();

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setExportProgress({
        phase: 'rendering',
        progress: 0,
        message: 'Preparing export...',
      });

      const options: ExportOptions = {
        format: selectedFormat as 'jpg' | 'png' | 'heic',
        quality: selectedQuality,
      };

      const result = await ExportService.exportImage(
        editorState,
        options,
        setExportProgress,
      );

      if (result) {
        Alert.alert(
          'Export Successful',
          'Your image has been saved to your photo library!',
          [
            {
              text: 'Share',
              onPress: () => {
                // TODO: Implement share functionality
                console.log('Share image:', result);
              },
            },
            { text: 'OK', style: 'default' },
          ],
        );
        onClose();
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert(
        'Export Failed',
        'Failed to export image. Please try again.',
        [{ text: 'OK' }],
      );
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  const handleCancel = () => {
    if (!isExporting) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} disabled={isExporting}>
            <Text
              style={[styles.headerButton, isExporting && styles.disabledText]}
            >
              Cancel
            </Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Export Image</Text>
          <TouchableOpacity onPress={handleExport} disabled={isExporting}>
            <Text
              style={[
                styles.headerButton,
                styles.exportButton,
                isExporting && styles.disabledText,
              ]}
            >
              Export
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Format Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Format</Text>
            <View style={styles.optionsContainer}>
              {formats.map(format => (
                <TouchableOpacity
                  key={format.id}
                  style={[
                    styles.optionButton,
                    selectedFormat === format.id && styles.optionButtonActive,
                  ]}
                  onPress={() => setSelectedFormat(format.id)}
                  disabled={isExporting}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      selectedFormat === format.id &&
                        styles.optionButtonTextActive,
                    ]}
                  >
                    {format.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quality Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quality</Text>
            <View style={styles.optionsContainer}>
              {qualityPresets.map(preset => (
                <TouchableOpacity
                  key={preset.id}
                  style={[
                    styles.optionButton,
                    selectedQuality === preset.quality &&
                      styles.optionButtonActive,
                  ]}
                  onPress={() => setSelectedQuality(preset.quality)}
                  disabled={isExporting}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      selectedQuality === preset.quality &&
                        styles.optionButtonTextActive,
                    ]}
                  >
                    {preset.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Export Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Export Settings</Text>
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Format:</Text>
                <Text style={styles.infoValue}>
                  {selectedFormat.toUpperCase()}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Quality:</Text>
                <Text style={styles.infoValue}>{selectedQuality}%</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Size:</Text>
                <Text style={styles.infoValue}>
                  {editorState.canvasSize.width} ×{' '}
                  {editorState.canvasSize.height}
                </Text>
              </View>
            </View>
          </View>

          {/* Progress */}
          {isExporting && exportProgress && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressTitle}>Exporting...</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${exportProgress.progress * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressMessage}>
                {exportProgress.message}
              </Text>
              <ActivityIndicator
                size="large"
                color={COLORS.primary}
                style={styles.progressSpinner}
              />
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightestGray,
  },
  headerButton: {
    fontSize: FONT_SIZES.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  exportButton: {
    color: COLORS.primary,
  },
  disabledText: {
    color: COLORS.gray,
  },
  headerTitle: {
    fontSize: FONT_SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  content: {
    flex: 1,
    padding: SPACING.m,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.h4,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SPACING.m,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.s,
  },
  optionButton: {
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    borderRadius: BORDER_RADIUS.medium,
    backgroundColor: COLORS.offWhite,
    borderWidth: 1,
    borderColor: COLORS.lighterGray,
  },
  optionButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionButtonText: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  optionButtonTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: COLORS.offWhite,
    borderRadius: BORDER_RADIUS.medium,
    padding: SPACING.m,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.s,
  },
  infoLabel: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.gray,
  },
  infoValue: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.black,
    fontWeight: '600',
  },
  progressContainer: {
    backgroundColor: COLORS.offWhite,
    borderRadius: BORDER_RADIUS.medium,
    padding: SPACING.l,
    alignItems: 'center',
    ...SHADOWS.level2,
  },
  progressTitle: {
    fontSize: FONT_SIZES.h4,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SPACING.m,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.lighterGray,
    borderRadius: 4,
    marginBottom: SPACING.s,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressMessage: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.gray,
    marginBottom: SPACING.m,
  },
  progressSpinner: {
    marginTop: SPACING.s,
  },
});
