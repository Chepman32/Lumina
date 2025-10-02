import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import type { EditorTool } from './index';
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  BORDER_RADIUS,
} from '../../utils/constants';

interface ToolbarProps {
  activeTool: EditorTool | null;
  onToolSelect: (tool: EditorTool | null) => void;
}

const TOOLS: Array<{ id: EditorTool; label: string; icon: string }> = [
  { id: 'filters', label: 'Filters', icon: '🎨' },
  { id: 'stickers', label: 'Stickers', icon: '😀' },
  { id: 'adjust', label: 'Adjust', icon: '⚙️' },
  { id: 'text', label: 'Text', icon: 'T' },
  { id: 'draw', label: 'Draw', icon: '✏️' },
];

export default function Toolbar({ activeTool, onToolSelect }: ToolbarProps) {
  const handleToolPress = (toolId: EditorTool) => {
    if (activeTool === toolId) {
      onToolSelect(null); // Close if already active
    } else {
      onToolSelect(toolId);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.toolsContainer}>
        {TOOLS.map(tool => {
          const isActive = activeTool === tool.id;
          return (
            <TouchableOpacity
              key={tool.id}
              style={[styles.toolButton, isActive && styles.toolButtonActive]}
              onPress={() => handleToolPress(tool.id)}
            >
              <Text
                style={[styles.toolIcon, isActive && styles.toolIconActive]}
              >
                {tool.icon}
              </Text>
              <Text
                style={[styles.toolLabel, isActive && styles.toolLabelActive]}
              >
                {tool.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.s,
    borderTopWidth: 1,
    borderTopColor: COLORS.darkGray,
  },
  toolsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  toolButton: {
    alignItems: 'center',
    paddingVertical: SPACING.s,
    paddingHorizontal: SPACING.s,
    borderRadius: BORDER_RADIUS.small,
    minWidth: 60,
  },
  toolButtonActive: {
    backgroundColor: COLORS.primary,
  },
  toolIcon: {
    fontSize: 24,
    marginBottom: SPACING.xxs,
  },
  toolIconActive: {
    // Icon styling when active
  },
  toolLabel: {
    fontSize: FONT_SIZES.caption,
    color: COLORS.lightGray,
    textAlign: 'center',
  },
  toolLabelActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
});
