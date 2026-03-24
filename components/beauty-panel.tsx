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

// --- Types ---

export interface BeautyValues {
  // 피부
  skinSmooth: number;
  skinTone: number;
  blemish: number;
  // 얼굴형
  faceSlim: number;
  jawline: number;
  forehead: number;
  // 눈
  eyeSize: number;
  eyeBright: number;
  // 코/입
  noseSlim: number;
  lipColor: number;
  blush: number;
}

export const DEFAULT_BEAUTY: BeautyValues = {
  skinSmooth: 0,
  skinTone: 0,
  blemish: 0,
  faceSlim: 0,
  jawline: 0,
  forehead: 0,
  eyeSize: 0,
  eyeBright: 0,
  noseSlim: 0,
  lipColor: 0,
  blush: 0,
};

// --- Category & Item Definitions ---

interface BeautyItem {
  key: keyof BeautyValues;
  label: string;
  icon: string;
  max: number;
}

interface BeautyCategory {
  id: string;
  nameKo: string;
  icon: string;
  items: BeautyItem[];
}

const BEAUTY_CATEGORIES: BeautyCategory[] = [
  {
    id: 'skin',
    nameKo: '피부',
    icon: '✨',
    items: [
      { key: 'skinSmooth', label: '스무딩', icon: '🫧', max: 100 },
      { key: 'skinTone', label: '피부톤', icon: '💡', max: 100 },
      { key: 'blemish', label: '잡티 제거', icon: '🩹', max: 100 },
    ],
  },
  {
    id: 'face',
    nameKo: '얼굴형',
    icon: '🫶',
    items: [
      { key: 'faceSlim', label: '갸름하게', icon: '📐', max: 100 },
      { key: 'jawline', label: '턱 라인', icon: '🔻', max: 100 },
      { key: 'forehead', label: '이마', icon: '🔼', max: 100 },
    ],
  },
  {
    id: 'eyes',
    nameKo: '눈',
    icon: '👁',
    items: [
      { key: 'eyeSize', label: '눈 크기', icon: '⭕', max: 100 },
      { key: 'eyeBright', label: '눈 밝기', icon: '💫', max: 100 },
    ],
  },
  {
    id: 'makeup',
    nameKo: '메이크업',
    icon: '💄',
    items: [
      { key: 'noseSlim', label: '코 라인', icon: '👃', max: 100 },
      { key: 'lipColor', label: '입술 컬러', icon: '💋', max: 100 },
      { key: 'blush', label: '블러셔', icon: '🌸', max: 100 },
    ],
  },
];

// --- Component ---

interface BeautyPanelProps {
  values: BeautyValues;
  onChange: (values: BeautyValues) => void;
}

export default function BeautyPanel({ values, onChange }: BeautyPanelProps) {
  const [activeCat, setActiveCat] = useState(BEAUTY_CATEGORIES[0].id);
  const [activeKey, setActiveKey] = useState<keyof BeautyValues>('skinSmooth');

  const currentCategory = BEAUTY_CATEGORIES.find((c) => c.id === activeCat)!;
  const currentItem = currentCategory.items.find((i) => i.key === activeKey)
    ?? currentCategory.items[0];
  const currentValue = values[currentItem.key];

  const handleCatChange = (catId: string) => {
    setActiveCat(catId);
    const cat = BEAUTY_CATEGORIES.find((c) => c.id === catId)!;
    setActiveKey(cat.items[0].key);
  };

  const handleValueChange = (val: number) => {
    onChange({ ...values, [currentItem.key]: Math.round(Math.max(0, val)) });
  };

  const handleReset = () => {
    onChange({ ...values, [currentItem.key]: 0 });
  };

  const handleResetAll = () => {
    onChange({ ...DEFAULT_BEAUTY });
  };

  const hasAnyModified = Object.values(values).some((v) => v !== 0);

  return (
    <View style={styles.wrapper}>
      {/* Category sub-tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryTabs}
      >
        {BEAUTY_CATEGORIES.map((cat) => {
          const isActive = activeCat === cat.id;
          const catModified = cat.items.some((i) => values[i.key] !== 0);
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryTab, isActive && styles.categoryTabActive]}
              onPress={() => handleCatChange(cat.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>
                {cat.nameKo}
              </Text>
              {catModified && <View style={styles.catDot} />}
            </TouchableOpacity>
          );
        })}
        {hasAnyModified && (
          <TouchableOpacity style={styles.resetAllChip} onPress={handleResetAll}>
            <Text style={styles.resetAllText}>↩ 초기화</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Slider + current item */}
      <View style={styles.sliderSection}>
        <View style={styles.valueHeader}>
          <Text style={styles.valueLabel}>
            {currentItem.icon} {currentItem.label}
          </Text>
          <View style={styles.valueActions}>
            <Text style={styles.valueNumber}>{currentValue}</Text>
            {currentValue !== 0 && (
              <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
                <Text style={styles.resetBtnText}>↩</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <BeautySlider
          value={currentValue}
          max={currentItem.max}
          onValueChange={handleValueChange}
        />
      </View>

      {/* Item buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.itemList}
        key={activeCat}
      >
        {currentCategory.items.map((item) => {
          const isActive = activeKey === item.key;
          const isModified = values[item.key] !== 0;
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
    </View>
  );
}

// --- Beauty Slider (0-max, no negative) ---

function BeautySlider({
  value,
  max,
  onValueChange,
}: {
  value: number;
  max: number;
  onValueChange: (v: number) => void;
}) {
  const TRACK_WIDTH = 280;
  const THUMB_SIZE = 22;

  const normalize = (v: number) => v / max;
  const denormalize = (n: number) => n * max;

  const thumbX = useSharedValue(normalize(value) * TRACK_WIDTH);

  React.useEffect(() => {
    thumbX.value = normalize(value) * TRACK_WIDTH;
  }, [value, max]);

  const savedX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      savedX.value = thumbX.value;
    })
    .onUpdate((e) => {
      const newX = Math.min(TRACK_WIDTH, Math.max(0, savedX.value + e.translationX));
      thumbX.value = newX;
      runOnJS(onValueChange)(denormalize(newX / TRACK_WIDTH));
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbX.value - THUMB_SIZE / 2 }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: thumbX.value,
  }));

  return (
    <View style={sliderStyles.container}>
      <View style={[sliderStyles.track, { width: TRACK_WIDTH }]}>
        <Animated.View style={[sliderStyles.fill, fillStyle]} />
      </View>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[sliderStyles.thumb, thumbStyle]} />
      </GestureDetector>
    </View>
  );
}

// --- Styles ---

const sliderStyles = StyleSheet.create({
  container: {
    height: 36,
    justifyContent: 'center',
    alignSelf: 'center',
    width: 304,
  },
  track: {
    height: 4,
    backgroundColor: Colors.dark.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: 4,
    backgroundColor: '#FF6B9D',
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    top: 7,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FF6B9D',
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
    paddingTop: 2,
  },
  categoryTabs: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    gap: 6,
    alignItems: 'center',
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
    position: 'relative',
  },
  categoryTabActive: {
    backgroundColor: 'rgba(255, 107, 157, 0.12)',
    borderColor: '#FF6B9D',
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
    color: '#FF9BBF',
    fontWeight: '700',
  },
  catDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#FF6B9D',
  },
  resetAllChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.dark.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  resetAllText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.dark.textMuted,
  },
  sliderSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: 2,
  },
  valueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
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
    color: '#FF9BBF',
    fontSize: 15,
    fontWeight: '700',
    minWidth: 30,
    textAlign: 'right',
  },
  resetBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.dark.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtnText: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
  },
  itemList: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
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
    borderColor: '#FF6B9D',
    backgroundColor: 'rgba(255, 107, 157, 0.1)',
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
    color: '#FF9BBF',
    fontWeight: '700',
  },
  modifiedDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#FF6B9D',
  },
});
