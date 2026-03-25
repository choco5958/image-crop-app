import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform, Image } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { FILTER_CATEGORIES, FilterPreset } from '@/constants/filters';
import { useLanguage } from '@/context/language-context';

interface Props {
  activeFilterId: string;
  onSelectFilter: (filter: FilterPreset) => void;
  imageUri: string;
}

export default function FilterPanel({ activeFilterId, onSelectFilter, imageUri }: Props) {
  const { language, t } = useLanguage();
  const [activeCatId, setActiveCatId] = React.useState('basic');
  
  // Get active filters
  const currentFilters = FILTER_CATEGORIES.find(cat => cat.id === activeCatId)?.filters || [];

  return (
    <View style={styles.container}>
      {/* Sub-tab Selector */}
      <View style={styles.subTabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subTabScroll}>
          {FILTER_CATEGORIES.map(cat => (
            <TouchableOpacity 
              key={cat.id}
              onPress={() => {
                import('expo-haptics').then(H => H.selectionAsync());
                setActiveCatId(cat.id);
              }}
              style={[styles.subTab, activeCatId === cat.id && styles.subTabActive]}
            >
              <Text style={[styles.subTabText, activeCatId === cat.id && styles.subTabTextActive]}>
                {language === 'ko' ? cat.nameKo : 
                 language === 'ja' ? cat.nameJa : 
                 language === 'zh' ? cat.nameZh : cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {currentFilters.map((filter) => {
          const isActive = activeFilterId === filter.id;
          
          return (
            <TouchableOpacity 
              key={filter.id} 
              style={styles.filterItem}
              onPress={() => onSelectFilter(filter)}
              activeOpacity={0.7}
            >
              <View style={[styles.thumbContainer, isActive && styles.thumbContainerActive]}>
                <Image 
                  source={{ uri: imageUri }} 
                  style={[
                    styles.filterThumbImage,
                    Platform.OS === 'web' && { 
                      filter: `brightness(${filter.brightness}) contrast(${filter.contrast}) saturate(${filter.saturation})`
                    } as any
                  ]}
                  resizeMode="cover"
                />
                <View 
                  style={[StyleSheet.absoluteFill, { backgroundColor: filter.overlay }]} 
                  pointerEvents="none" 
                />
              </View>
              <Text style={[styles.filterName, isActive && styles.filterNameActive]}>
                {language === 'ko' ? filter.nameKo : 
                 language === 'ja' ? filter.nameJa : 
                 language === 'zh' ? filter.nameZh : filter.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 16,
    paddingTop: 8,
    paddingBottom: 8,
    alignItems: 'center',
  },
  subTabBar: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    marginBottom: 12,
  },
  subTabScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  subTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: 'transparent',
  },
  subTabActive: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  subTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
  },
  subTabTextActive: {
    color: Colors.dark.accentLight,
  },
  filterItem: {
    alignItems: 'center',
    gap: 8,
  },
  thumbContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: Colors.dark.surfaceLight,
  },
  thumbContainerActive: {
    borderColor: Colors.dark.accent,
  },
  filterThumbImage: {
    width: '100%',
    height: '100%',
  },
  filterName: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  filterNameActive: {
    color: Colors.dark.accent,
    fontWeight: '700',
  },
});
