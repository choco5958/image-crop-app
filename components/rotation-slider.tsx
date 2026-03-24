import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/theme';

interface Props {
  value: number; // angle in degrees
  onChange: (val: number) => void;
  width?: number;
}

export default function RotationSlider({ value, onChange, width = 200 }: Props) {
  const savedValue = useSharedValue(value);
  const isDragging = useSharedValue(false);
  const lastHapticValue = useSharedValue(Math.round(value));

  const pan = Gesture.Pan()
    .onStart(() => {
      savedValue.value = value;
      isDragging.value = true;
    })
    .onUpdate((e) => {
      // Full track width represents 90 degrees (-45 to +45)
      const deltaAngle = (e.translationX / width) * 90;
      let newAngle = savedValue.value + deltaAngle;
      
      // Clamp between -45 and 45
      newAngle = Math.max(-45, Math.min(45, newAngle));
      
      const roundedAngle = Math.round(newAngle * 10) / 10;
      
      if (Math.round(newAngle) === 0 && lastHapticValue.value !== 0) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        lastHapticValue.value = 0;
      } else if (Math.round(newAngle) !== 0) {
        lastHapticValue.value = Math.round(newAngle);
      }
      
      runOnJS(onChange)(roundedAngle);
    })
    .onEnd(() => {
      isDragging.value = false;
    });

  const knobStyle = useAnimatedStyle(() => {
    // 0 degrees => 50%
    const pct = ((value + 45) / 90);
    return {
      left: pct * width - 10, // 10 is half knob width
      transform: [{ scale: isDragging.value ? 1.2 : 1 }],
    };
  });

  return (
    <View style={[styles.container, { width }]}>
      <GestureDetector gesture={pan}>
        <View style={styles.trackContainer}>
          <View style={styles.track} />
          {/* Tick mark at 0 */}
          <View style={styles.zeroTick} />
          
          <Animated.View style={[styles.knob, knobStyle]} />
        </View>
      </GestureDetector>
      <View style={styles.labels}>
        <Text style={styles.labelText}>-45°</Text>
        <Text style={[styles.labelText, { color: value !== 0 ? Colors.dark.accent : 'rgba(255,255,255,0.5)', fontSize: 12 }]}>
          {value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1)}°
        </Text>
        <Text style={styles.labelText}>+45°</Text>
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
  zeroTick: {
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
