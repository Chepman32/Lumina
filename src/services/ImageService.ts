import { Skia } from '@shopify/react-native-skia';
import type { SkImage } from '@shopify/react-native-skia';

export class ImageService {
  private static imageCache = new Map<string, SkImage>();

  /**
   * Load an image from a URI and return a Skia image
   */
  static async loadImage(uri: string): Promise<SkImage | null> {
    try {
      // Check cache first
      if (this.imageCache.has(uri)) {
        return this.imageCache.get(uri)!;
      }

      // Load image data
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();
      const data = Skia.Data.fromBytes(new Uint8Array(arrayBuffer));

      // Create Skia image
      const image = Skia.Image.MakeImageFromEncoded(data);

      if (image) {
        // Cache the image
        this.imageCache.set(uri, image);
        return image;
      }

      return null;
    } catch (error) {
      console.error('Failed to load image:', error);
      return null;
    }
  }

  /**
   * Create a thumbnail of an image
   */
  static createThumbnail(image: SkImage, size: number): SkImage | null {
    try {
      const surface = Skia.Surface.Make(size, size);
      if (!surface) return null;

      const canvas = surface.getCanvas();
      const paint = Skia.Paint();

      // Calculate scaling to fit within thumbnail size
      const scale = Math.min(size / image.width(), size / image.height());
      const scaledWidth = image.width() * scale;
      const scaledHeight = image.height() * scale;

      // Center the image
      const x = (size - scaledWidth) / 2;
      const y = (size - scaledHeight) / 2;

      canvas.drawImageRect(
        image,
        Skia.XYWHRect(0, 0, image.width(), image.height()),
        Skia.XYWHRect(x, y, scaledWidth, scaledHeight),
        paint,
      );

      return surface.makeImageSnapshot();
    } catch (error) {
      console.error('Failed to create thumbnail:', error);
      return null;
    }
  }

  /**
   * Resize an image to fit within max dimensions while maintaining aspect ratio
   */
  static resizeImage(
    image: SkImage,
    maxWidth: number,
    maxHeight: number,
  ): SkImage | null {
    try {
      const originalWidth = image.width();
      const originalHeight = image.height();

      // Calculate new dimensions
      const scale = Math.min(
        maxWidth / originalWidth,
        maxHeight / originalHeight,
      );
      const newWidth = Math.round(originalWidth * scale);
      const newHeight = Math.round(originalHeight * scale);

      // If no scaling needed, return original
      if (scale >= 1) {
        return image;
      }

      const surface = Skia.Surface.Make(newWidth, newHeight);
      if (!surface) return null;

      const canvas = surface.getCanvas();
      const paint = Skia.Paint();

      canvas.drawImageRect(
        image,
        Skia.XYWHRect(0, 0, originalWidth, originalHeight),
        Skia.XYWHRect(0, 0, newWidth, newHeight),
        paint,
      );

      return surface.makeImageSnapshot();
    } catch (error) {
      console.error('Failed to resize image:', error);
      return null;
    }
  }

  /**
   * Clear the image cache
   */
  static clearCache(): void {
    this.imageCache.clear();
  }

  /**
   * Get cache size (number of cached images)
   */
  static getCacheSize(): number {
    return this.imageCache.size;
  }
}
