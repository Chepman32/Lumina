import { Skia } from '@shopify/react-native-skia';
import type { SkRuntimeEffect, SkImage } from '@shopify/react-native-skia';

// Basic filter shaders
const FILTER_SHADERS = {
  vintage: `
    uniform shader image;
    uniform float intensity;
    
    vec3 applyVintage(vec3 color) {
      // Increase contrast
      color = (color - 0.5) * 1.15 + 0.5;
      
      // Add warm tone
      color.r *= 1.1;
      color.g *= 1.05;
      color.b *= 0.9;
      
      // Reduce saturation
      float gray = dot(color, vec3(0.299, 0.587, 0.114));
      color = mix(vec3(gray), color, 0.7);
      
      // Add sepia overlay
      vec3 sepia = vec3(
        color.r * 0.393 + color.g * 0.769 + color.b * 0.189,
        color.r * 0.349 + color.g * 0.686 + color.b * 0.168,
        color.r * 0.272 + color.g * 0.534 + color.b * 0.131
      );
      
      return mix(color, sepia, 0.3);
    }
    
    vec4 main(vec2 coord) {
      vec4 color = image.eval(coord);
      vec3 processed = applyVintage(color.rgb);
      vec3 final = mix(color.rgb, processed, intensity);
      return vec4(final, color.a);
    }
  `,

  bw: `
    uniform shader image;
    uniform float intensity;
    
    vec4 main(vec2 coord) {
      vec4 color = image.eval(coord);
      float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      vec3 bw = vec3(gray);
      vec3 final = mix(color.rgb, bw, intensity);
      return vec4(final, color.a);
    }
  `,

  vibrant: `
    uniform shader image;
    uniform float intensity;
    
    vec4 main(vec2 coord) {
      vec4 color = image.eval(coord);
      
      // Increase saturation
      float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      vec3 saturated = mix(vec3(gray), color.rgb, 1.5);
      
      // Increase contrast
      saturated = (saturated - 0.5) * 1.2 + 0.5;
      
      vec3 final = mix(color.rgb, saturated, intensity);
      return vec4(final, color.a);
    }
  `,

  cool: `
    uniform shader image;
    uniform float intensity;
    
    vec4 main(vec2 coord) {
      vec4 color = image.eval(coord);
      
      // Add cool tone (blue tint)
      vec3 cool = color.rgb;
      cool.r *= 0.9;
      cool.g *= 0.95;
      cool.b *= 1.1;
      
      vec3 final = mix(color.rgb, cool, intensity);
      return vec4(final, color.a);
    }
  `,

  warm: `
    uniform shader image;
    uniform float intensity;
    
    vec4 main(vec2 coord) {
      vec4 color = image.eval(coord);
      
      // Add warm tone (orange/yellow tint)
      vec3 warm = color.rgb;
      warm.r *= 1.1;
      warm.g *= 1.05;
      warm.b *= 0.9;
      
      vec3 final = mix(color.rgb, warm, intensity);
      return vec4(final, color.a);
    }
  `,

  dramatic: `
    uniform shader image;
    uniform float intensity;
    
    vec4 main(vec2 coord) {
      vec4 color = image.eval(coord);
      
      // High contrast
      vec3 dramatic = (color.rgb - 0.5) * 1.8 + 0.5;
      
      // Slight desaturation
      float gray = dot(dramatic, vec3(0.299, 0.587, 0.114));
      dramatic = mix(vec3(gray), dramatic, 0.8);
      
      vec3 final = mix(color.rgb, dramatic, intensity);
      return vec4(final, color.a);
    }
  `,
};

export class FilterService {
  private static shaderCache = new Map<string, SkRuntimeEffect>();

  /**
   * Get or create a runtime effect for a filter
   */
  static getFilterEffect(filterName: string): SkRuntimeEffect | null {
    try {
      // Check cache first
      if (this.shaderCache.has(filterName)) {
        return this.shaderCache.get(filterName)!;
      }

      // Get shader source
      const shaderSource =
        FILTER_SHADERS[filterName as keyof typeof FILTER_SHADERS];
      if (!shaderSource) {
        console.warn(`Filter '${filterName}' not found`);
        return null;
      }

      // Create runtime effect
      const effect = Skia.RuntimeEffect.Make(shaderSource);
      if (effect) {
        this.shaderCache.set(filterName, effect);
        return effect;
      }

      return null;
    } catch (error) {
      console.error(
        `Failed to create filter effect for '${filterName}':`,
        error,
      );
      return null;
    }
  }

  /**
   * Apply a filter to an image
   */
  static applyFilter(
    image: SkImage,
    filterName: string,
    intensity: number = 1.0,
  ): SkImage | null {
    try {
      const effect = this.getFilterEffect(filterName);
      if (!effect) return null;

      // Create surface for rendering
      const surface = Skia.Surface.Make(image.width(), image.height());
      if (!surface) return null;

      const canvas = surface.getCanvas();
      const paint = Skia.Paint();

      // Create shader with uniforms
      const shader = effect.makeShader([image.makeShader(), intensity]);

      paint.setShader(shader);

      // Draw filtered image
      canvas.drawRect(
        Skia.XYWHRect(0, 0, image.width(), image.height()),
        paint,
      );

      return surface.makeImageSnapshot();
    } catch (error) {
      console.error(`Failed to apply filter '${filterName}':`, error);
      return null;
    }
  }

  /**
   * Get list of available filters
   */
  static getAvailableFilters(): string[] {
    return Object.keys(FILTER_SHADERS);
  }

  /**
   * Clear shader cache
   */
  static clearCache(): void {
    this.shaderCache.clear();
  }
}
