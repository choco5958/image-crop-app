import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { ASPECT_RATIOS } from '@/constants/filters';

interface RatioSelectorProps {
  selectedRatio: string;
  onSelect: (id: string, ratio: number | null) => void;
}

export default function RatioSelector({ selectedRatio, onSelect }: RatioSelectorProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {ASPECT_RATIOS.map((item) => {
        const isSelected = selectedRatio === item.id;
        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={() => onSelect(item.id, item.ratio)}
            activeOpacity={0.7}
          >
            <View style={[styles.ratioIcon, isSelected && styles.ratioIconSelected]}>
              <RatioVisual ratio={item.ratio} isSelected={isSelected} />
            </View>
            <Text style={[styles.label, isSelected && styles.labelSelected]}>
              {item.labelKo}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function RatioVisual({ ratio, isSelected }: { ratio: number | null; isSelected: boolean }) {
  const color = isSelected ? Colors.dark.accent : Colors.dark.textMuted;

  if (ratio === null) {
    return (
      <View style={[styles.freeBox, { borderColor: color }]}>
        <Text style={[styles.freeText, { color }]}>↔</Text>
      </View>
    );
  }

  const maxSize = 24;
  let w: number, h: number;
  if (ratio >= 1) {
    w = maxSize;
    h = maxSize / ratio;
  } else {
    h = maxSize;
    w = maxSize * ratio;
  }

  return (
    <View
      style={[
        styles.ratioBox,
        {
          width: Math.max(w, 8),
          height: Math.max(h, 8),
          borderColor: color,
          backgroundColor: isSelected ? Colors.dark.accentGlow : 'transparent',
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  chip: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    minWidth: 60,
    gap: 4,
  },
  chipSelected: {
    borderColor: Colors.dark.accent,
    backgroundColor: 'rgba(108, 92, 231, 0.12)',
  },
  ratioIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratioIconSelected: {},
  ratioBox: {
    borderWidth: 2,
    borderRadius: 3,
  },
  freeBox: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: 4,
    borderStyle: 'dashed',
  },
  freeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
  },
  labelSelected: {
    color: Colors.dark.accentLight,
  },
});
