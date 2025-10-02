import { useState, useCallback, useRef } from 'react';
import { useEditorStore } from '../stores/editorStore';
import { FilterService } from '../services/FilterService';
import { ImageService } from '../services/ImageService';
import type { AppliedFilter } from '../types/editor.types';

export const useFilterEngine = () => {
  const { layers, filters, applyFilter, removeFilter } = useEditorStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef<boolean>(false);

  /**
   * Apply a filter to the current image layers
   */
  const applyFilterToLayers = useCallback(
    async (filterName: string, intensity: number = 1.0) => {
      if (processingRef.current) return;

      try {
        setIsProcessing(true);
        processingRef.current = true;

        // Remove existing filter with same name
        const existingFilter = filters.find(f => f.name === filterName);
        if (existingFilter) {
          removeFilter(existingFilter.id);
        }

        // Create new filter
        const newFilter: AppliedFilter = {
          id: `filter_${Date.now()}`,
          name: filterName,
          intensity,
        };

        // Apply the filter
        applyFilter(newFilter);
      } catch (error) {
        console.error('Failed to apply filter:', error);
      } finally {
        setIsProcessing(false);
        processingRef.current = false;
      }
    },
    [filters, applyFilter, removeFilter],
  );

  /**
   * Remove a specific filter
   */
  const removeFilterByName = useCallback(
    (filterName: string) => {
      const filter = filters.find(f => f.name === filterName);
      if (filter) {
        removeFilter(filter.id);
      }
    },
    [filters, removeFilter],
  );

  /**
   * Update filter intensity
   */
  const updateFilterIntensity = useCallback(
    async (filterName: string, intensity: number) => {
      await applyFilterToLayers(filterName, intensity);
    },
    [applyFilterToLayers],
  );

  /**
   * Get current filter intensity
   */
  const getFilterIntensity = useCallback(
    (filterName: string): number => {
      const filter = filters.find(f => f.name === filterName);
      return filter?.intensity || 0;
    },
    [filters],
  );

  /**
   * Check if a filter is currently applied
   */
  const isFilterApplied = useCallback(
    (filterName: string): boolean => {
      return filters.some(f => f.name === filterName);
    },
    [filters],
  );

  /**
   * Get all available filters
   */
  const availableFilters = FilterService.getAvailableFilters();

  /**
   * Create filter thumbnail for preview
   */
  const createFilterThumbnail = useCallback(
    async (filterName: string, baseImageUri?: string) => {
      if (!baseImageUri) {
        // Use the first image layer as base
        const imageLayer = layers.find(layer => layer.type === 'image');
        if (!imageLayer) return null;

        baseImageUri = (imageLayer.data as any).path;
      }

      try {
        const baseImage = await ImageService.loadImage(baseImageUri);
        if (!baseImage) return null;

        return FilterService.createFilterThumbnail(baseImage, filterName, 80);
      } catch (error) {
        console.error('Failed to create filter thumbnail:', error);
        return null;
      }
    },
    [layers],
  );

  /**
   * Clear all filters
   */
  const clearAllFilters = useCallback(() => {
    filters.forEach(filter => {
      removeFilter(filter.id);
    });
  }, [filters, removeFilter]);

  return {
    // State
    isProcessing,
    availableFilters,
    appliedFilters: filters,

    // Actions
    applyFilterToLayers,
    removeFilterByName,
    updateFilterIntensity,
    clearAllFilters,
    createFilterThumbnail,

    // Getters
    getFilterIntensity,
    isFilterApplied,
  };
};
