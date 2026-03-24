import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { FILTER_CATEGORIES, FilterPreset, FilterCategory } from '@/constants/filters';

interface FilterStripProps {
  imageUri: string;
  selectedFilter: string;
  onSelect: (filter: FilterPreset) => void;
}

export default function FilterStrip({ imageUri, selectedFilter, onSelect }: FilterStripProps) {
  const [activeCategory, setActiveCategory] = useState(FILTER_CATEGORIES[0].id);

  const currentCategory = FILTER_CATEGORIES.find((c) => c.id === activeCategory) ?? FILTER_CATEGORIES[0];

  return (
    <View style={styles.wrapper}>
      {/* Category sub-tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryTabs}
      >
        {FILTER_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryTab, isActive && styles.categoryTabActive]}
              onPress={() => setActiveCategory(cat.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>
                {cat.nameKo}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Filter thumbnails */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
        key={activeCategory} // reset scroll on category change
      >
        {currentCategory.filters.map((filter) => {
          const isSelected = selectedFilter === filter.id;
          return (
            <TouchableOpacity
              key={filter.id}
              style={[styles.filterItem, isSelected && styles.filterItemSelected]}
              onPress={() => onSelect(filter)}
              activeOpacity={0.7}
            >
              <View style={[styles.thumbnailContainer, isSelected && styles.thumbnailSelected]}>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
                {/* Filter overlay */}
                {filter.overlay !== 'transparent' && (
                  <View
                    style={[
                      styles.filterOverlay,
                      { backgroundColor: filter.overlay },
                    ]}
                  />
                )}
                {/* Grayscale indicator for B&W and low saturation */}
                {filter.saturation < 0.5 && (
                  <View style={styles.grayscaleOverlay} />
                )}
                {isSelected && <View style={styles.selectedBorder} />}
              </View>
              <Text style={[styles.filterName, isSelected && styles.filterNameSelected]}>
                {filter.nameKo}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 4,
  },
  categoryTabs: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: 4,
    gap: 6,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.dark.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  categoryTabActive: {
    backgroundColor: 'rgba(108, 92, 231, 0.15)',
    borderColor: Colors.dark.accent,
  },
  categoryIcon: {
    fontSize: 13,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
  },
  categoryLabelActive: {
    color: Colors.dark.accentLight,
    fontWeight: '700',
  },
  filterList: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  filterItem: {
    alignItems: 'center',
    gap: 6,
  },
  filterItemSelected: {},
  thumbnailContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailSelected: {
    borderColor: Colors.dark.accent,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  filterOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  grayscaleOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(128, 128, 128, 0.5)',
  },
  selectedBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderColor: Colors.dark.accent,
    borderRadius: BorderRadius.sm - 2,
  },
  filterName: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.dark.textSecondary,
  },
  filterNameSelected: {
    color: Colors.dark.accentLight,
    fontWeight: '700',
  },
});
