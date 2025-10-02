import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  TextInput,
  Alert,
} from 'react-native';
import { useEditorStore } from '../../stores/editorStore';
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  BORDER_RADIUS,
} from '../../utils/constants';

const FONTS = ['System', 'Helvetica', 'Times', 'Courier'];

const COLORS_PALETTE = [
  COLORS.white,
  COLORS.black,
  COLORS.primary,
  COLORS.accent,
  COLORS.success,
  COLORS.error,
  COLORS.warning,
  COLORS.info,
];

export default function TextPanel() {
  const { addLayer, canvasSize } = useEditorStore();
  const [text, setText] = useState('');
  const [selectedFont, setSelectedFont] = useState('System');
  const [selectedColor, setSelectedColor] = useState(COLORS.white);
  const [fontSize, setFontSize] = useState(32);

  const handleAddText = () => {
    if (!text.trim()) {
      Alert.alert('Enter Text', 'Please enter some text to add to the canvas.');
      return;
    }

    // Add text layer to canvas center
    const textWidth = text.length * (fontSize * 0.6); // Rough estimate
    const textHeight = fontSize * 1.2;
    const centerX = (canvasSize.width - textWidth) / 2;
    const centerY = (canvasSize.height - textHeight) / 2;

    addLayer({
      id: `text_${Date.now()}`,
      type: 'text',
      visible: true,
      locked: false,
      opacity: 1,
      blendMode: 'normal',
      transform: {
        x: centerX,
        y: centerY,
        scale: 1,
        rotation: 0,
      },
      data: {
        text: text.trim(),
        font: selectedFont,
        fontSize,
        color: selectedColor,
        style: {
          bold: false,
          italic: false,
          underline: false,
          strikethrough: false,
        },
        textWidth,
        textHeight,
      },
    });

    // Clear input after adding
    setText('');
  };

  return (
    <View style={styles.container}>
      {/* Text Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Enter your text..."
          placeholderTextColor={COLORS.gray}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={100}
        />
        <TouchableOpacity
          style={[styles.addButton, !text.trim() && styles.addButtonDisabled]}
          onPress={handleAddText}
          disabled={!text.trim()}
        >
          <Text style={styles.addButtonText}>Add Text</Text>
        </TouchableOpacity>
      </View>

      {/* Font Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Font</Text>
        <View style={styles.fontContainer}>
          {FONTS.map(font => (
            <TouchableOpacity
              key={font}
              style={[
                styles.fontButton,
                selectedFont === font && styles.fontButtonActive,
              ]}
              onPress={() => setSelectedFont(font)}
            >
              <Text
                style={[
                  styles.fontButtonText,
                  selectedFont === font && styles.fontButtonTextActive,
                ]}
              >
                {font}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Font Size */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Size: {fontSize}pt</Text>
        <View style={styles.sizeContainer}>
          <TouchableOpacity
            style={styles.sizeButton}
            onPress={() => setFontSize(Math.max(12, fontSize - 4))}
          >
            <Text style={styles.sizeButtonText}>-</Text>
          </TouchableOpacity>
          <View style={styles.sizeDisplay}>
            <Text style={styles.sizeDisplayText}>{fontSize}</Text>
          </View>
          <TouchableOpacity
            style={styles.sizeButton}
            onPress={() => setFontSize(Math.min(72, fontSize + 4))}
          >
            <Text style={styles.sizeButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Color Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Color</Text>
        <View style={styles.colorContainer}>
          {COLORS_PALETTE.map(color => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorButton,
                { backgroundColor: color },
                selectedColor === color && styles.colorButtonActive,
              ]}
              onPress={() => setSelectedColor(color)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.9)',
    height: 280,
    padding: SPACING.m,
  },
  inputContainer: {
    marginBottom: SPACING.m,
  },
  textInput: {
    backgroundColor: COLORS.darkGray,
    color: COLORS.white,
    fontSize: FONT_SIZES.body,
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.medium,
    marginBottom: SPACING.s,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.s,
    paddingHorizontal: SPACING.m,
    borderRadius: BORDER_RADIUS.medium,
    alignSelf: 'flex-end',
  },
  addButtonDisabled: {
    backgroundColor: COLORS.darkGray,
    opacity: 0.5,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.bodySmall,
    fontWeight: '600',
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
  fontContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  fontButton: {
    backgroundColor: COLORS.darkGray,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    borderRadius: BORDER_RADIUS.small,
    marginRight: SPACING.s,
    marginBottom: SPACING.s,
  },
  fontButtonActive: {
    backgroundColor: COLORS.primary,
  },
  fontButtonText: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.bodySmall,
  },
  fontButtonTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  sizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.darkGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeButtonText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  sizeDisplay: {
    marginHorizontal: SPACING.l,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    backgroundColor: COLORS.darkGray,
    borderRadius: BORDER_RADIUS.small,
    minWidth: 60,
  },
  sizeDisplayText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.body,
    textAlign: 'center',
    fontWeight: '600',
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: SPACING.s,
    marginBottom: SPACING.s,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorButtonActive: {
    borderColor: COLORS.white,
    borderWidth: 3,
  },
});
