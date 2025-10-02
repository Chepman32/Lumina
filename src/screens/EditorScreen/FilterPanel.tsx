import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useFilterEngine } from '../../hooks/useFilterEngine';
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  BORDER_RADIUS,
} from '../../utils/constants';

interface Filter {
  id: string;
  name: string;
  premium: boolean;
}

const FREE_FILTERS: Filter[] = [
  { id: 'none', name: 'Original', premium: false },
  { id: 'natural', name: 'Natural', premium: false },
  { id: 'bw', name: 'B&W', premium: false },
  { id: 'vintage', name: 'Vintage', premium: false },
  { id: 'vibrant', name: 'Vibrant', premium: false },
  { id: 'cool', name: 'Cool', premium: false },
  { id: 'warm', name: 'Warm', premium: false },
  { id: 'portrait', name: 'Portrait', premium: false },
  { id: 'food', name: 'Food', premium: false },
  { id: 'sunset', name: 'Sunset', premium: false },
  { id: 'dramatic', name: 'Dramatic', premium: false },
  { id: 'pastel', name: 'Pastel', premium: false },
];

const PREMIUM_FILTERS: Filter[] = [
  { id: 'cinematic1', name: 'Cinematic', premium: true },
  { id: 'aesthetic1', name: 'Aesthetic', premium: true },
  { id: 'film1', name: 'Film', premium: true },
  { id: 'artistic1', name: 'Artistic', premium: true },
];

export default function FilterPanel() {
  const {
    availableFilters,
    appliedFilters,
    applyFilterToLayers,
    updateFilterIntensity,
    getFilterIntensity,
    isFilterApplied,
    isProcessing,
  } = useFilterEngine();

  const [selectedFilter, setSelectedFilter] = useState<string>('none');
  const [intensity, setIntensity] = useState(100);

  const allFilters = [...FREE_FILTERS, ...PREMIUM_FILTERS];
  const handleFilterSelect = async (filter: Filter) => {
    if (filter.premium) {
      // TODO: Check if user has purchased premium filters
      // For now, show premium indicator
      return;
    }

    setSelectedFilter(filter.id);

    // Apply new filter (except 'none')
    if (filter.id !== 'none') {
      await applyFilterToLayers(filter.id, intensity / 100);
    }
  };

  const handleIntensityChange = async (newIntensity: number) => {
    setIntensity(newIntensity);

    if (selectedFilter !== 'none') {
      await updateFilterIntensity(selectedFilter, newIntensity / 100);
    }
  };

  return (
    <View style={styles.container}>
      {/* Filter Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {allFilters.map(filter => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterItem,
              selectedFilter === filter.id && styles.filterItemActive,
            ]}
            onPress={() => handleFilterSelect(filter)}
          >
            <View
              style={[
                styles.filterThumbnail,
                filter.premium && styles.filterThumbnailPremium,
              ]}
            >
              {filter.premium && (
                <View style={styles.premiumBadge}>
                  <Text style={styles.premiumBadgeText}>👑</Text>
                </View>
              )}
              <View style={styles.filterPreview} />
            </View>
            <Text
              style={[
                styles.filterName,
                selectedFilter === filter.id && styles.filterNameActive,
              ]}
            >
              {filter.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Intensity Slider */}
      {selectedFilter !== 'none' && (
        <View style={styles.intensityContainer}>
          <Text style={styles.intensityLabel}>Intensity</Text>
          <View style={styles.sliderContainer}>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: `${intensity}%` }]} />
            </View>
            <Text style={styles.intensityValue}>{intensity}%</Text>
          </View>

          {/* Simple intensity controls */}
          <View style={styles.intensityControls}>
            <TouchableOpacity
              style={styles.intensityButton}
              onPress={() => handleIntensityChange(Math.max(0, intensity - 10))}
            >
              <Text style={styles.intensityButtonText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.intensityButton}
              onPress={() =>
                handleIntensityChange(Math.min(100, intensity + 10))
              }
            >
              <Text style={styles.intensityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.9)',
    paddingVertical: SPACING.m,
  },
  filtersContainer: {
    paddingHorizontal: SPACING.m,
    paddingBottom: SPACING.s,
  },
  filterItem: {
    alignItems: 'center',
    marginRight: SPACING.m,
    width: 80,
  },
  filterItemActive: {
    // Active filter styling
  },
  filterThumbnail: {
    width: 70,
    height: 70,
    borderRadius: BORDER_RADIUS.medium,
    backgroundColor: COLORS.darkGray,
    marginBottom: SPACING.xs,
    position: 'relative',
    overflow: 'hidden',
  },
  filterThumbnailPremium: {
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  premiumBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  premiumBadgeText: {
    fontSize: 10,
  },
  filterPreview: {
    flex: 1,
    backgroundColor: COLORS.gray,
    margin: 4,
    borderRadius: BORDER_RADIUS.small,
  },
  filterName: {
    fontSize: FONT_SIZES.caption,
    color: COLORS.lightGray,
    textAlign: 'center',
  },
  filterNameActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  intensityContainer: {
    paddingHorizontal: SPACING.m,
    paddingTop: SPACING.m,
    borderTopWidth: 1,
    borderTopColor: COLORS.darkGray,
  },
  intensityLabel: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.white,
    marginBottom: SPACING.s,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.s,
  },
  sliderTrack: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.darkGray,
    borderRadius: 2,
    marginRight: SPACING.m,
  },
  sliderFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  intensityValue: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.white,
    minWidth: 40,
    textAlign: 'right',
  },
  intensityControls: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  intensityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.darkGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING.s,
  },
  intensityButtonText: {
    fontSize: 20,
    color: COLORS.white,
    fontWeight: 'bold',
  },
});
