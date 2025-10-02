import { Skia, TextAlign } from '@shopify/react-native-skia';
import type { SkParagraph } from '@shopify/react-native-skia';
import type { StickerLayerData } from '../types/editor.types';

export interface StickerAsset {
  id: string;
  name: string;
  category: string;
  emoji?: string; // For emoji-based stickers
  premium: boolean;
  width: number;
  height: number;
}

// Free stickers using emojis for now
const FREE_STICKERS: StickerAsset[] = [
  // Emoji Pack
  {
    id: 'emoji_heart',
    name: 'Heart',
    category: 'emoji',
    emoji: '❤️',
    premium: false,
    width: 60,
    height: 60,
  },
  {
    id: 'emoji_star',
    name: 'Star',
    category: 'emoji',
    emoji: '⭐',
    premium: false,
    width: 60,
    height: 60,
  },
  {
    id: 'emoji_fire',
    name: 'Fire',
    category: 'emoji',
    emoji: '🔥',
    premium: false,
    width: 60,
    height: 60,
  },
  {
    id: 'emoji_sparkles',
    name: 'Sparkles',
    category: 'emoji',
    emoji: '✨',
    premium: false,
    width: 60,
    height: 60,
  },
  {
    id: 'emoji_rainbow',
    name: 'Rainbow',
    category: 'emoji',
    emoji: '🌈',
    premium: false,
    width: 80,
    height: 60,
  },
  {
    id: 'emoji_sun',
    name: 'Sun',
    category: 'emoji',
    emoji: '☀️',
    premium: false,
    width: 60,
    height: 60,
  },
  {
    id: 'emoji_moon',
    name: 'Moon',
    category: 'emoji',
    emoji: '🌙',
    premium: false,
    width: 60,
    height: 60,
  },
  {
    id: 'emoji_lightning',
    name: 'Lightning',
    category: 'emoji',
    emoji: '⚡',
    premium: false,
    width: 60,
    height: 60,
  },
  {
    id: 'emoji_crown',
    name: 'Crown',
    category: 'emoji',
    emoji: '👑',
    premium: false,
    width: 60,
    height: 60,
  },
  {
    id: 'emoji_gem',
    name: 'Gem',
    category: 'emoji',
    emoji: '💎',
    premium: false,
    width: 60,
    height: 60,
  },

  // Doodles Pack (using simple emojis for now)
  {
    id: 'doodle_arrow',
    name: 'Arrow',
    category: 'doodles',
    emoji: '➡️',
    premium: false,
    width: 80,
    height: 40,
  },
  {
    id: 'doodle_check',
    name: 'Check',
    category: 'doodles',
    emoji: '✅',
    premium: false,
    width: 60,
    height: 60,
  },
  {
    id: 'doodle_x',
    name: 'X Mark',
    category: 'doodles',
    emoji: '❌',
    premium: false,
    width: 60,
    height: 60,
  },
  {
    id: 'doodle_question',
    name: 'Question',
    category: 'doodles',
    emoji: '❓',
    premium: false,
    width: 60,
    height: 60,
  },
  {
    id: 'doodle_exclamation',
    name: 'Exclamation',
    category: 'doodles',
    emoji: '❗',
    premium: false,
    width: 60,
    height: 60,
  },
  {
    id: 'doodle_heart_eyes',
    name: 'Heart Eyes',
    category: 'doodles',
    emoji: '😍',
    premium: false,
    width: 60,
    height: 60,
  },
  {
    id: 'doodle_thumbs_up',
    name: 'Thumbs Up',
    category: 'doodles',
    emoji: '👍',
    premium: false,
    width: 60,
    height: 60,
  },
  {
    id: 'doodle_peace',
    name: 'Peace',
    category: 'doodles',
    emoji: '✌️',
    premium: false,
    width: 60,
    height: 60,
  },
  {
    id: 'doodle_ok',
    name: 'OK Hand',
    category: 'doodles',
    emoji: '👌',
    premium: false,
    width: 60,
    height: 60,
  },
  {
    id: 'doodle_clap',
    name: 'Clap',
    category: 'doodles',
    emoji: '👏',
    premium: false,
    width: 60,
    height: 60,
  },

  // Shapes Pack
  {
    id: 'shape_circle',
    name: 'Circle',
    category: 'shapes',
    emoji: '⭕',
    premium: false,
    width: 60,
    height: 60,
  },
  {
    id: 'shape_square',
    name: 'Square',
    category: 'shapes',
    emoji: '⬜',
    premium: false,
    width: 60,
    height: 60,
  },
  {
    id: 'shape_triangle',
    name: 'Triangle',
    category: 'shapes',
    emoji: '🔺',
    premium: false,
    width: 60,
    height: 60,
  },
  {
    id: 'shape_diamond',
    name: 'Diamond',
    category: 'shapes',
    emoji: '🔶',
    premium: false,
    width: 60,
    height: 60,
  },
  {
    id: 'shape_hexagon',
    name: 'Hexagon',
    category: 'shapes',
    emoji: '⬡',
    premium: false,
    width: 60,
    height: 60,
  },
  {
    id: 'shape_star_outline',
    name: 'Star Outline',
    category: 'shapes',
    emoji: '☆',
    premium: false,
    width: 60,
    height: 60,
  },
  {
    id: 'shape_heart_outline',
    name: 'Heart Outline',
    category: 'shapes',
    emoji: '♡',
    premium: false,
    width: 60,
    height: 60,
  },
  {
    id: 'shape_plus',
    name: 'Plus',
    category: 'shapes',
    emoji: '➕',
    premium: false,
    width: 60,
    height: 60,
  },
  {
    id: 'shape_minus',
    name: 'Minus',
    category: 'shapes',
    emoji: '➖',
    premium: false,
    width: 60,
    height: 60,
  },
  {
    id: 'shape_multiply',
    name: 'Multiply',
    category: 'shapes',
    emoji: '✖️',
    premium: false,
    width: 60,
    height: 60,
  },
];

const PREMIUM_STICKERS: StickerAsset[] = [
  // Fashion Pack
  {
    id: 'fashion_sunglasses',
    name: 'Sunglasses',
    category: 'fashion',
    emoji: '🕶️',
    premium: true,
    width: 80,
    height: 40,
  },
  {
    id: 'fashion_lipstick',
    name: 'Lipstick',
    category: 'fashion',
    emoji: '💄',
    premium: true,
    width: 40,
    height: 80,
  },
  {
    id: 'fashion_heels',
    name: 'High Heels',
    category: 'fashion',
    emoji: '👠',
    premium: true,
    width: 60,
    height: 80,
  },
  {
    id: 'fashion_dress',
    name: 'Dress',
    category: 'fashion',
    emoji: '👗',
    premium: true,
    width: 60,
    height: 80,
  },
  {
    id: 'fashion_handbag',
    name: 'Handbag',
    category: 'fashion',
    emoji: '👜',
    premium: true,
    width: 60,
    height: 60,
  },
];

export class StickerService {
  /**
   * Get all available stickers
   */
  static getAllStickers(): StickerAsset[] {
    return [...FREE_STICKERS, ...PREMIUM_STICKERS];
  }

  /**
   * Get stickers by category
   */
  static getStickersByCategory(category: string): StickerAsset[] {
    return this.getAllStickers().filter(
      sticker => sticker.category === category,
    );
  }

  /**
   * Get free stickers only
   */
  static getFreeStickers(): StickerAsset[] {
    return FREE_STICKERS;
  }

  /**
   * Get premium stickers only
   */
  static getPremiumStickers(): StickerAsset[] {
    return PREMIUM_STICKERS;
  }

  /**
   * Get sticker by ID
   */
  static getStickerById(id: string): StickerAsset | null {
    return this.getAllStickers().find(sticker => sticker.id === id) || null;
  }

  /**
   * Get all categories
   */
  static getCategories(): string[] {
    const categories = new Set(
      this.getAllStickers().map(sticker => sticker.category),
    );
    return Array.from(categories);
  }

  /**
   * Create sticker layer data from asset
   */
  static createStickerLayerData(asset: StickerAsset): StickerLayerData {
    return {
      assetId: asset.id,
      sourceType: 'emoji',
      emoji: asset.emoji,
      width: asset.width,
      height: asset.height,
    };
  }

  /**
   * Check if sticker is premium
   */
  static isPremium(stickerId: string): boolean {
    const sticker = this.getStickerById(stickerId);
    return sticker?.premium || false;
  }

  /**
   * Build a Skia paragraph representation for an emoji sticker.
   */
  static createEmojiParagraph(
    emoji: string,
    width: number,
    height: number,
  ): SkParagraph | null {
    if (!emoji) {
      return null;
    }

    try {
      const builder = Skia.ParagraphBuilder.Make({
        textAlign: TextAlign.Center,
        textStyle: {
          fontFamilies: [
            'Apple Color Emoji',
            'Segoe UI Emoji',
            'Noto Color Emoji',
            'Twemoji Mozilla',
            'sans-serif',
          ],
          fontSize: Math.min(width, height) * 0.85,
        },
      });

      builder.addText(emoji);
      const paragraph = builder.build();
      paragraph.layout(width);
      return paragraph;
    } catch (error) {
      console.error('Failed to create sticker paragraph:', error);
      return null;
    }
  }
}
