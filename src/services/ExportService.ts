import { Skia } from '@shopify/react-native-skia';
import type { SkImage, SkSurface } from '@shopify/react-native-skia';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import type { EditorState } from '../types/editor.types';
import { ImageService } from './ImageService';

export interface ExportOptions {
  format: 'jpg' | 'png' | 'heic';
  quality: number; // 0-100
  width?: number;
  height?: number;
}

export interface ExportProgress {
  phase: 'rendering' | 'encoding' | 'saving';
  progress: number; // 0-1
  message: string;
}

export class ExportService {
  /**
   * Export the current editor state as an image
   */
  static async exportImage(
    editorState: EditorState,
    options: ExportOptions,
    onProgress?: (progress: ExportProgress) => void,
  ): Promise<string | null> {
    try {
      onProgress?.({
        phase: 'rendering',
        progress: 0,
        message: 'Starting export...',
      });

      // Step 1: Render all layers to a single image
      const renderedImage = await this.renderFinalImage(
        editorState,
        progress => {
          onProgress?.({
            phase: 'rendering',
            progress: progress * 0.7,
            message: 'Rendering layers...',
          });
        },
      );

      if (!renderedImage) {
        throw new Error('Failed to render image');
      }

      onProgress?.({
        phase: 'encoding',
        progress: 0.7,
        message: 'Encoding image...',
      });

      // Step 2: Encode to desired format
      const encodedData = await this.encodeImage(renderedImage, options);

      onProgress?.({
        phase: 'saving',
        progress: 0.9,
        message: 'Saving to library...',
      });

      // Step 3: Save to photo library
      const savedPath = await this.saveToLibrary(encodedData, options.format);

      onProgress?.({
        phase: 'saving',
        progress: 1,
        message: 'Export complete!',
      });

      return savedPath;
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  /**
   * Render all layers into a single image
   */
  private static async renderFinalImage(
    editorState: EditorState,
    onProgress?: (progress: number) => void,
  ): Promise<SkImage | null> {
    try {
      const { canvasSize, layers, filters, adjustments } = editorState;

      // Create rendering surface
      const surface = Skia.Surface.Make(canvasSize.width, canvasSize.height);
      if (!surface) return null;

      const canvas = surface.getCanvas();

      // Clear with white background
      canvas.clear(Skia.Color('white'));

      onProgress?.(0.1);

      // Render visible layers
      const visibleLayers = layers.filter(layer => layer.visible);

      for (let i = 0; i < visibleLayers.length; i++) {
        const layer = visibleLayers[i];
        onProgress?.(((i + 1) / visibleLayers.length) * 0.8);

        await this.renderLayerToCanvas(canvas, layer);
      }

      onProgress?.(0.9);

      // Apply filters if any
      let finalImage = surface.makeImageSnapshot();

      for (const filter of filters) {
        const filteredImage = await this.applyFilterToImage(finalImage, filter);
        if (filteredImage) {
          finalImage = filteredImage;
        }
      }

      onProgress?.(1.0);
      return finalImage;
    } catch (error) {
      console.error('Failed to render final image:', error);
      return null;
    }
  }

  /**
   * Render a single layer to canvas
   */
  private static async renderLayerToCanvas(
    canvas: any,
    layer: any,
  ): Promise<void> {
    const { transform, opacity } = layer;

    // Save canvas state
    canvas.save();

    // Apply transform
    canvas.translate(transform.x, transform.y);
    canvas.scale(transform.scale, transform.scale);
    canvas.rotate(transform.rotation);

    // Set opacity
    const paint = Skia.Paint();
    paint.setAlphaf(opacity);

    switch (layer.type) {
      case 'image':
        await this.renderImageLayer(canvas, layer, paint);
        break;
      case 'sticker':
        await this.renderStickerLayer(canvas, layer, paint);
        break;
      case 'text':
        await this.renderTextLayer(canvas, layer, paint);
        break;
      case 'drawing':
        await this.renderDrawingLayer(canvas, layer, paint);
        break;
    }

    // Restore canvas state
    canvas.restore();
  }

  private static async renderImageLayer(
    canvas: any,
    layer: any,
    paint: any,
  ): Promise<void> {
    try {
      const data = layer.data;
      const image = await ImageService.loadImage(data.path);

      if (image) {
        canvas.drawImageRect(
          image,
          Skia.XYWHRect(0, 0, image.width(), image.height()),
          Skia.XYWHRect(0, 0, data.width, data.height),
          paint,
        );
      }
    } catch (error) {
      console.error('Failed to render image layer:', error);
    }
  }

  private static async renderStickerLayer(
    canvas: any,
    layer: any,
    paint: any,
  ): Promise<void> {
    // For now, render a colored rectangle
    const data = layer.data;
    const rect = Skia.XYWHRect(0, 0, data.width, data.height);
    paint.setColor(Skia.Color('#EC4899')); // Accent color
    canvas.drawRoundRect(rect, 8, 8, paint);
  }

  private static async renderTextLayer(
    canvas: any,
    layer: any,
    paint: any,
  ): Promise<void> {
    // For now, render a colored rectangle representing text
    const data = layer.data;
    const rect = Skia.XYWHRect(
      0,
      0,
      data.textWidth || 120,
      data.textHeight || 40,
    );
    paint.setColor(Skia.Color('#3B82F6')); // Info color
    canvas.drawRoundRect(rect, 4, 4, paint);
  }

  private static async renderDrawingLayer(
    canvas: any,
    layer: any,
    paint: any,
  ): Promise<void> {
    // For now, render a colored rectangle representing drawing
    const rect = Skia.XYWHRect(0, 0, 100, 100);
    paint.setColor(Skia.Color('#10B981')); // Success color
    canvas.drawRoundRect(rect, 4, 4, paint);
  }

  private static async applyFilterToImage(
    image: SkImage,
    filter: any,
  ): Promise<SkImage | null> {
    // This would apply the filter using FilterService
    // For now, return the original image
    return image;
  }

  /**
   * Encode image to specified format
   */
  private static async encodeImage(
    image: SkImage,
    options: ExportOptions,
  ): Promise<Uint8Array> {
    let format: any;

    switch (options.format) {
      case 'png':
        format = Skia.ImageFormat.PNG;
        break;
      case 'jpg':
      case 'heic':
      default:
        format = Skia.ImageFormat.JPEG;
        break;
    }

    const data = image.encodeToBytes(format, options.quality);
    return new Uint8Array(data);
  }

  /**
   * Save encoded data to photo library
   */
  private static async saveToLibrary(
    data: Uint8Array,
    format: string,
  ): Promise<string> {
    // Create temporary file
    const filename = `lumina_export_${Date.now()}.${format}`;
    const tempPath = `${FileSystem.documentDirectory}${filename}`;

    // Convert Uint8Array to base64
    const base64Data = this.uint8ArrayToBase64(data);

    // Write to temporary file
    await FileSystem.writeAsStringAsync(tempPath, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Save to photo library
    const asset = await MediaLibrary.saveToLibraryAsync(tempPath);

    // Clean up temporary file
    await FileSystem.deleteAsync(tempPath, { idempotent: true });

    return asset.uri;
  }

  /**
   * Convert Uint8Array to base64 string
   */
  private static uint8ArrayToBase64(uint8Array: Uint8Array): string {
    let binary = '';
    const len = uint8Array.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
  }

  /**
   * Get available export formats
   */
  static getAvailableFormats(): Array<{
    id: string;
    name: string;
    extension: string;
  }> {
    return [
      { id: 'jpg', name: 'JPEG', extension: 'jpg' },
      { id: 'png', name: 'PNG', extension: 'png' },
      { id: 'heic', name: 'HEIC', extension: 'heic' },
    ];
  }

  /**
   * Get quality presets
   */
  static getQualityPresets(): Array<{
    id: string;
    name: string;
    quality: number;
  }> {
    return [
      { id: 'low', name: 'Low (70%)', quality: 70 },
      { id: 'medium', name: 'Medium (85%)', quality: 85 },
      { id: 'high', name: 'High (95%)', quality: 95 },
      { id: 'maximum', name: 'Maximum (100%)', quality: 100 },
    ];
  }
}
