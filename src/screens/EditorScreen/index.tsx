import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useEditorStore } from '../../stores/editorStore';
import Canvas from './Canvas';
import Toolbar from './Toolbar';
import FilterPanel from './FilterPanel';
import StickerPanel from './StickerPanel';
import AdjustmentPanel from './AdjustmentPanel';
import TextPanel from './TextPanel';
import DrawingPanel from './DrawingPanel';
import DrawingCanvas from './DrawingCanvas';
import ExportModal from './ExportModal';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

export type EditorTool = 'filters' | 'stickers' | 'adjust' | 'text' | 'draw';

export default function EditorScreen() {
  const navigation = useNavigation();
  const [activeTool, setActiveTool] = useState<EditorTool | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  // Drawing tool state
  const [brushType, setBrushType] = useState<
    'pen' | 'marker' | 'pencil' | 'eraser'
  >('pen');
  const [brushSize, setBrushSize] = useState(12);
  const [brushOpacity, setBrushOpacity] = useState(100);
  const [brushColor, setBrushColor] = useState(COLORS.white);

  const { undo, redo, history, historyIndex } = useEditorStore();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleUndo = () => {
    if (canUndo) {
      undo();
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      redo();
    }
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Toolbar */}
      <View style={styles.topToolbar}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <View style={styles.topToolbarCenter}>
          <TouchableOpacity
            style={[styles.undoButton, !canUndo && styles.disabledButton]}
            onPress={handleUndo}
            disabled={!canUndo}
          >
            <Text
              style={[
                styles.toolbarButtonText,
                !canUndo && styles.disabledButtonText,
              ]}
            >
              ↶
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.redoButton, !canRedo && styles.disabledButton]}
            onPress={handleRedo}
            disabled={!canRedo}
          >
            <Text
              style={[
                styles.toolbarButtonText,
                !canRedo && styles.disabledButtonText,
              ]}
            >
              ↷
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
          <Text style={styles.exportButtonText}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* Canvas Area */}
      <View style={styles.canvasContainer}>
        <Canvas />
        <DrawingCanvas
          brushType={brushType}
          brushSize={brushSize}
          brushOpacity={brushOpacity}
          brushColor={brushColor}
          isActive={activeTool === 'draw'}
        />
      </View>

      {/* Bottom Control Panel */}
      <View style={styles.bottomPanel}>
        <Toolbar activeTool={activeTool} onToolSelect={setActiveTool} />

        {activeTool === 'filters' && <FilterPanel />}

        {activeTool === 'stickers' && <StickerPanel />}

        {activeTool === 'adjust' && <AdjustmentPanel />}

        {activeTool === 'text' && <TextPanel />}

        {activeTool === 'draw' && (
          <DrawingPanel
            brushType={brushType}
            setBrushType={setBrushType}
            brushSize={brushSize}
            setBrushSize={setBrushSize}
            brushOpacity={brushOpacity}
            setBrushOpacity={setBrushOpacity}
            brushColor={brushColor}
            setBrushColor={setBrushColor}
          />
        )}
      </View>

      {/* Export Modal */}
      <ExportModal
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  topToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  backButton: {
    padding: SPACING.s,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  topToolbarCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  undoButton: {
    padding: SPACING.s,
    marginRight: SPACING.s,
  },
  redoButton: {
    padding: SPACING.s,
  },
  toolbarButtonText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  exportButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    borderRadius: 8,
  },
  exportButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.bodySmall,
    fontWeight: '600',
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: COLORS.darkGray,
  },
  bottomPanel: {
    backgroundColor: 'rgba(0,0,0,0.9)',
    paddingBottom: SPACING.m,
  },
  toolPanel: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.darkGray,
  },
  panelText: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.body,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledButtonText: {
    color: COLORS.gray,
  },
});
