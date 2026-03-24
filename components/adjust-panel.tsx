import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

export interface AdjustValues {
  brightness: number;
  contrast: number;
  saturation: number;
  warmth: number;
  highlights: number;
  shadows: number;
  sharpness: number;
  vignette: number;
}

export const DEFAULT_ADJUST: AdjustValues = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  warmth: 0,
  highlights: 0,
  shadows: 0,
  sharpness: 0,
  vignette: 0,
};

interface AdjustItem {
  key: keyof AdjustValues;
  label: string;
  icon: string;
  min: number;
  max: number;
}

const ADJUST_ITEMS: AdjustItem[] = [
  { key: 'brightness', label: '밝기', icon: '☀️', min: -100, max: 100 },
  { key: 'contrast', label: '대비', icon: '◐', min: -100, max: 100 },
  { key: 'saturation', label: '채도', icon: '💧', min: -100, max: 100 },
  { key: 'warmth', label: '색온도', icon: '🔥', min: -100, max: 100 },
  { key: 'highlights', label: '하이라이트', icon: '✦', min: -100, max: 100 },
  { key: 'shadows', label: '그림자', icon: '🌑', min: -100, max: 100 },
  { key: 'sharpness', label: '선명도', icon: '🔷', min: -100, max: 100 },
  { key: 'vignette', label: '비네팅', icon: '⬭', min: 0, max: 100 },
];

interface AdjustPanelProps {
  values: AdjustValues;
  onChange: (values: AdjustValues) => void;
}

export default function AdjustPanel({ values, onChange }: AdjustPanelProps) {
  const [activeKey, setActiveKey] = useState<keyof AdjustValues>('brightness');

  const activeItem = ADJUST_ITEMS.find((i) => i.key === activeKey)!;
  const currentValue = values[activeKey];

  const handleValueChange = (val: number) => {
    onChange({ ...values, [activeKey]: Math.round(val) });
  };

  const handleReset = () => {
    onChange({ ...values, [activeKey]: 0 });
  };

  const handleResetAll = () => {
    onChange({ ...DEFAULT_ADJUST });
  };

  return (
    <View style={styles.wrapper}>
      {/* Current value display + slider */}
      <View style={styles.sliderSection}>
        <View style={styles.valueHeader}>
          <Text style={styles.valueLabel}>
            {activeItem.icon} {activeItem.label}
          </Text>
          <View style={styles.valueActions}>
            <Text style={styles.valueNumber}>
              {currentValue > 0 ? '+' : ''}{currentValue}
            </Text>
            {currentValue !== 0 && (
              <TouchableOpacity onPress={handleReset} style={styles.resetSingle}>
                <Text style={styles.resetSingleText}>↩</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <CustomSlider
          value={currentValue}
          min={activeItem.min}
          max={activeItem.max}
          onValueChange={handleValueChange}
        />
      </View>

      {/* Adjust item selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.itemList}
      >
        {ADJUST_ITEMS.map((item) => {
          const isActive = activeKey === item.key;
          const val = values[item.key];
          const isModified = val !== 0;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.itemChip, isActive && styles.itemChipActive]}
              onPress={() => setActiveKey(item.key)}
              activeOpacity={0.7}
            >
              <Text style={styles.itemIcon}>{item.icon}</Text>
              <Text style={[styles.itemLabel, isActive && styles.itemLabelActive]}>
                {item.label}
              </Text>
              {isModified && <View style={styles.modifiedDot} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Reset all button */}
      <TouchableOpacity onPress={handleResetAll} style={styles.resetAllBtn}>
        <Text style={styles.resetAllText}>전체 초기화</Text>
      </TouchableOpacity>
    </View>
  );
}

// --- Custom Slider ---

interface CustomSliderProps {
  value: number;
  min: number;
  max: number;
  onValueChange: (value: number) => void;
}

function CustomSlider({ value, min, max, onValueChange }: CustomSliderProps) {
  const TRACK_WIDTH = 280;
  const THUMB_SIZE = 22;

  const normalize = (v: number) => (v - min) / (max - min);
  const denormalize = (n: number) => n * (max - min) + min;

  const thumbX = useSharedValue(normalize(value) * TRACK_WIDTH);

  React.useEffect(() => {
    thumbX.value = normalize(value) * TRACK_WIDTH;
  }, [value, min, max]);

  const savedX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      savedX.value = thumbX.value;
    })
    .onUpdate((e) => {
      const newX = Math.min(TRACK_WIDTH, Math.max(0, savedX.value + e.translationX));
      thumbX.value = newX;
      const newVal = denormalize(newX / TRACK_WIDTH);
      runOnJS(onValueChange)(newVal);
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbX.value - THUMB_SIZE / 2 }],
  }));

  const fillStyle = useAnimatedStyle(() => {
    const center = min < 0 ? TRACK_WIDTH * normalize(0) : 0;
    const current = thumbX.value;

    if (min < 0) {
      const left = Math.min(center, current);
      const width = Math.abs(current - center);
      return { left, width };
    }
    return { left: 0, width: current };
  });

  const centerMark = min < 0 ? normalize(0) * TRACK_WIDTH : null;

  return (
    <View style={sliderStyles.container}>
      <View style={[sliderStyles.track, { width: TRACK_WIDTH }]}>
        {/* Fill */}
        <Animated.View style={[sliderStyles.fill, fillStyle]} />
        {/* Center mark */}
        {centerMark !== null && (
          <View style={[sliderStyles.centerMark, { left: centerMark }]} />
        )}
      </View>
      {/* Thumb */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[sliderStyles.thumb, thumbStyle]} />
      </GestureDetector>
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: 'center',
    alignSelf: 'center',
    width: 304, // TRACK_WIDTH + some padding
  },
  track: {
    height: 4,
    backgroundColor: Colors.dark.border,
    borderRadius: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    top: 0,
    height: 4,
    backgroundColor: Colors.dark.accent,
    borderRadius: 2,
  },
  centerMark: {
    position: 'absolute',
    top: -2,
    width: 2,
    height: 8,
    backgroundColor: Colors.dark.textMuted,
    marginLeft: -1,
  },
  thumb: {
    position: 'absolute',
    top: 9,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: Colors.dark.accent,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      } as any,
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
      },
    }),
  },
});

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: Spacing.sm,
  },
  sliderSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: 4,
  },
  valueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  valueLabel: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '600',
  },
  valueActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  valueNumber: {
    color: Colors.dark.accentLight,
    fontSize: 15,
    fontWeight: '700',
    minWidth: 36,
    textAlign: 'right',
  },
  resetSingle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.dark.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetSingleText: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
  },
  itemList: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: 6,
  },
  itemChip: {
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    minWidth: 56,
    position: 'relative',
  },
  itemChipActive: {
    borderColor: Colors.dark.accent,
    backgroundColor: 'rgba(108, 92, 231, 0.12)',
  },
  itemIcon: {
    fontSize: 16,
  },
  itemLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
  },
  itemLabelActive: {
    color: Colors.dark.accentLight,
    fontWeight: '700',
  },
  modifiedDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.dark.accent,
  },
  resetAllBtn: {
    alignSelf: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  resetAllText: {
    color: Colors.dark.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
});
