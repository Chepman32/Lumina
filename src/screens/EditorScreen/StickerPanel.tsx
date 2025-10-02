import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useEditorStore } from '../../stores/editorStore';
import { StickerService } from '../../services/StickerService';
import type { StickerAsset } from '../../services/StickerService';
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  BORDER_RADIUS,
} from '../../utils/constants';

const CATEGORIES = [
  { id: 'emoji', name: 'Emoji', icon: '😀' },
  { id: 'doodles', name: 'Doodles', icon: '✏️' },
  { id: 'shapes', name: 'Shapes', icon: '⭕' },
  { id: 'fashion', name: 'Fashion', icon: '👗' },
];

export default function StickerPanel() {
  const { addLayer, canvasSize } = useEditorStore();
  const [activeCategory, setActiveCategory] = useState('emoji');

  const stickers = StickerService.getStickersByCategory(activeCategory);

  const handleStickerSelect = (sticker: StickerAsset) => {
    if (sticker.premium) {
      // TODO: Check if user has purchased premium stickers
      // For now, show premium indicator
      return;
    }

    // Add sticker to canvas center
    const centerX = (canvasSize.width - sticker.width) / 2;
    const centerY = (canvasSize.height - sticker.height) / 2;

    addLayer({
      id: `sticker_${Date.now()}`,
      type: 'sticker',
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
      data: StickerService.createStickerLayerData(sticker),
    });
  };

  return (
    <View style={styles.container}>
      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {CATEGORIES.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryTab,
              activeCategory === category.id && styles.categoryTabActive,
            ]}
            onPress={() => setActiveCategory(category.id)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text
              style={[
                styles.categoryName,
                activeCategory === category.id && styles.categoryNameActive,
              ]}
            >
              {category.name}
            </Text>
            {category.id === 'fashion' && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>👑</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sticker Grid */}
      <ScrollView
        style={styles.gridContainer}
        contentContainerStyle={styles.gridContent}
      >
        <View style={styles.stickerGrid}>
          {stickers.map(sticker => (
            <TouchableOpacity
              key={sticker.id}
              style={[
                styles.stickerItem,
                sticker.premium && styles.stickerItemPremium,
              ]}
              onPress={() => handleStickerSelect(sticker)}
            >
              {sticker.premium && (
                <View style={styles.stickerPremiumBadge}>
                  <Text style={styles.stickerPremiumBadgeText}>👑</Text>
                </View>
              )}
              <Text style={styles.stickerEmoji}>{sticker.emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Search Bar Placeholder */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchPlaceholder}>Search stickers...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.9)',
    height: 180,
  },
  categoriesContainer: {
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
  },
  categoryTab: {
    alignItems: 'center',
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    borderRadius: BORDER_RADIUS.medium,
    marginRight: SPACING.s,
    minWidth: 80,
    position: 'relative',
  },
  categoryTabActive: {
    backgroundColor: COLORS.primary,
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: SPACING.xxs,
  },
  categoryName: {
    fontSize: FONT_SIZES.caption,
    color: COLORS.lightGray,
    textAlign: 'center',
  },
  categoryNameActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  premiumBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumBadgeText: {
    fontSize: 8,
  },
  gridContainer: {
    flex: 1,
  },
  gridContent: {
    padding: SPACING.m,
  },
  stickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  stickerItem: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: COLORS.darkGray,
    borderRadius: BORDER_RADIUS.medium,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.s,
    position: 'relative',
  },
  stickerItemPremium: {
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  stickerPremiumBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  stickerPremiumBadgeText: {
    fontSize: 8,
  },
  stickerEmoji: {
    fontSize: 32,
  },
  searchContainer: {
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    borderTopWidth: 1,
    borderTopColor: COLORS.darkGray,
  },
  searchPlaceholder: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.gray,
    textAlign: 'center',
    paddingVertical: SPACING.s,
    backgroundColor: COLORS.darkGray,
    borderRadius: BORDER_RADIUS.small,
  },
});
