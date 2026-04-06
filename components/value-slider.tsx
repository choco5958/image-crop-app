import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/theme';

interface Props {
  value: number;
  min: number;
  max: number;
  onChange: (val: number) => void;
  width?: number;
  formatLabel?: (val: number) => string;
}

export default function ValueSlider({ value, min, max, onChange, width = 200, formatLabel }: Props) {
  const currentVal = useSharedValue(value);
  const savedValue = useSharedValue(value);
  const isDragging = useSharedValue(false);
  const neutralValue = min === 0 && max === 2 ? 1 : 0; // standard neutral
  const lastHapticValue = useSharedValue(value);

  useEffect(() => {
    currentVal.value = value;
  }, [value, currentVal]);

  const pan = Gesture.Pan()
    .onStart(() => {
      savedValue.value = currentVal.value;
      isDragging.value = true;
    })
    .onUpdate((e) => {
      const range = max - min;
      const delta = (e.translationX / width) * range;
      let newVal = savedValue.value + delta;
      newVal = Math.max(min, Math.min(max, newVal));
      
      // Emit precisely rounded value
      const roundedVal = Math.round(newVal * 100) / 100;
      
      // Provide haptic feedback when jumping over the neutral point
      if (Math.abs(roundedVal - neutralValue) < 0.05 && Math.abs(lastHapticValue.value - neutralValue) >= 0.05) {
         runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
      }
      lastHapticValue.value = roundedVal;
      
      currentVal.value = roundedVal; // update instantly on UI thread
      runOnJS(onChange)(roundedVal); // sync back to React JS thread
    })
    .onEnd(() => {
      isDragging.value = false;
    });

  const knobStyle = useAnimatedStyle(() => {
    const pct = (currentVal.value - min) / (max - min);
    return {
      left: pct * width - 10,
      transform: [{ scale: isDragging.value ? 1.2 : 1 }],
    };
  });

  return (
    <View style={[styles.container, { width }]}>
      <GestureDetector gesture={pan}>
        <View style={styles.trackContainer}>
          <View style={styles.track} />
          {/* Reference tick in the exact middle, useful for 0-2 range where 1 is neutral */}
          <View style={styles.centerTick} />
          <Animated.View style={[styles.knob, knobStyle]} />
        </View>
      </GestureDetector>
      <View style={styles.labels}>
        <Text style={styles.labelText}>{formatLabel ? formatLabel(min) : min}</Text>
        <Text style={[styles.labelText, { color: Colors.dark.accent, fontSize: 12 }]}>
          {formatLabel ? formatLabel(value) : value}
        </Text>
        <Text style={styles.labelText}>{formatLabel ? formatLabel(max) : max}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 44,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  trackContainer: {
    height: 30,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: '100%',
    borderRadius: 1,
  },
  centerTick: {
    position: 'absolute',
    left: '50%',
    marginLeft: -1,
    width: 2,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  knob: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginTop: 4,
  },
  labelText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: '600',
  },
});
