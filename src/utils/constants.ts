import { Dimensions } from 'react-native';

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Colors
export const COLORS = {
  // Primary
  primary: '#8B5CF6',
  primaryLight: '#A78BFA',
  primaryDark: '#7C3AED',
  accent: '#EC4899',

  // Grayscale
  black: '#1F2937',
  darkGray: '#4B5563',
  gray: '#6B7280',
  lightGray: '#9CA3AF',
  lighterGray: '#D1D5DB',
  lightestGray: '#E5E7EB',
  offWhite: '#F3F4F6',
  white: '#FFFFFF',

  // Semantic
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
};

// Typography
export const FONTS = {
  regular: 'System',
  bold: 'System',
  semibold: 'System',
};

export const FONT_SIZES = {
  h1: 32,
  h2: 24,
  h3: 20,
  h4: 18,
  body: 16,
  bodySmall: 14,
  caption: 12,
  button: 16,
};

// Spacing
export const SPACING = {
  xxs: 4,
  xs: 8,
  s: 12,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

// Border Radius
export const BORDER_RADIUS = {
  small: 8,
  medium: 12,
  large: 16,
  xlarge: 24,
  circular: 9999,
};

// Shadows
export const SHADOWS = {
  level1: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  level2: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  level3: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 3,
  },
  level4: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 4,
  },
};

// Animation Durations
export const ANIMATION = {
  fast: 200,
  standard: 300,
  slow: 500,
  verySlow: 800,
};

// Product IDs for IAP
export const PRODUCT_IDS = {
  PREMIUM_BUNDLE: 'com.lumina.premium.bundle',
  FILTER_CINEMATIC: 'com.lumina.filters.cinematic',
  FILTER_AESTHETIC: 'com.lumina.filters.aesthetic',
  FILTER_PORTRAIT: 'com.lumina.filters.portrait',
  FILTER_SEASONAL: 'com.lumina.filters.seasonal',
  FILTER_ARTISTIC: 'com.lumina.filters.artistic',
  FILTER_VINTAGE_FILM: 'com.lumina.filters.vintagefilm',
  STICKER_FASHION: 'com.lumina.stickers.fashion',
  STICKER_TRAVEL: 'com.lumina.stickers.travel',
  STICKER_FOOD: 'com.lumina.stickers.food',
  STICKER_NATURE: 'com.lumina.stickers.nature',
  STICKER_PARTY: 'com.lumina.stickers.party',
  STICKER_TECH: 'com.lumina.stickers.tech',
  STICKER_VINTAGE: 'com.lumina.stickers.vintage',
  STICKER_ANIMATED: 'com.lumina.stickers.animated',
  FONT_PREMIUM: 'com.lumina.fonts.premium',
};

// Adjustments default values
export const DEFAULT_ADJUSTMENTS = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  temperature: 0,
  tint: 0,
  exposure: 0,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  sharpness: 0,
  clarity: 0,
  vibrance: 0,
  grain: 0,
  vignette: 0,
};

// Editor Constraints
export const EDITOR_CONSTRAINTS = {
  MAX_LAYERS: 20,
  MAX_HISTORY_FREE: 50,
  MAX_HISTORY_PREMIUM: -1, // unlimited
  MAX_CANVAS_SIZE: 4096,
  MAX_DRAWING_STROKES: 1000,
};
