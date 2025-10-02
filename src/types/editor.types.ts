import type { SkImage } from '@shopify/react-native-skia';

export type BlendMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten';

export type LayerType = 'image' | 'sticker' | 'text' | 'drawing';

export interface Transform {
  x: number;
  y: number;
  scale: number;
  rotation: number; // radians
}

export interface ImageLayerData {
  path: string;
  width: number;
  height: number;
}

export type StickerSourceType = 'emoji';

export interface StickerLayerData {
  assetId: string;
  sourceType: StickerSourceType;
  emoji?: string;
  image?: SkImage;
  tint?: string;
  width: number;
  height: number;
}

export interface TextLayerData {
  text: string;
  font: string;
  fontSize: number;
  color: string;
  style: {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikethrough: boolean;
  };
  background?: {
    type: 'none' | 'solid' | 'gradient';
    color?: string;
    gradient?: string[];
  };
  shadow?: {
    offsetX: number;
    offsetY: number;
    blur: number;
    color: string;
    opacity: number;
  };
  outline?: {
    width: number;
    color: string;
  };
  padding?: number;
  borderRadius?: number;
  textWidth?: number;
  textHeight?: number;
  curved?: boolean;
  curveRadius?: number;
  curveAngle?: number;
}

export interface DrawingStroke {
  id: string;
  points: Point[];
  brushType: 'pen' | 'marker' | 'pencil' | 'eraser';
  color: string;
  size: number;
  opacity: number;
  timestamp: number;
}

export interface DrawingLayerData {
  strokes: DrawingStroke[];
}

export interface Point {
  x: number;
  y: number;
  pressure?: number;
}

export interface Layer {
  id: string;
  type: LayerType;
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: BlendMode;
  transform: Transform;
  data: ImageLayerData | StickerLayerData | TextLayerData | DrawingLayerData;
}

export interface AppliedFilter {
  id: string;
  name: string;
  shader?: string;
  uniforms?: Record<string, number | number[]>;
  intensity: number;
}

export interface Adjustment {
  brightness: number;
  contrast: number;
  saturation: number;
  temperature: number;
  tint: number;
  exposure: number;
  highlights: number;
  shadows: number;
  whites: number;
  blacks: number;
  sharpness: number;
  clarity: number;
  vibrance: number;
  grain: number;
  vignette: number;
}

export interface HistoryState {
  id: string;
  timestamp: number;
  action: string;
  editorState: EditorState;
  thumbnail?: string;
}

export interface EditorState {
  layers: Layer[];
  activeLayerId: string | null;
  canvasSize: { width: number; height: number };
  zoom: number;
  pan: { x: number; y: number };
  history: HistoryState[];
  historyIndex: number;
  filters: AppliedFilter[];
  adjustments: Adjustment;
}
