import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';

const HANDLE_SIZE = 20;
const MIN_CROP_SIZE = 60;

interface CropOverlayProps {
  containerWidth: number;
  containerHeight: number;
  aspectRatio: number | null; // null = free
  onCropChange?: (crop: { x: number; y: number; width: number; height: number }) => void;
}

export default function CropOverlay({
  containerWidth,
  containerHeight,
  aspectRatio,
  onCropChange,
}: CropOverlayProps) {
  // Calculate initial crop dimensions
  const initial = useMemo(() => {
    if (aspectRatio === null) {
      const margin = 20;
      return {
        x: margin,
        y: margin,
        width: containerWidth - margin * 2,
        height: containerHeight - margin * 2,
      };
    }

    let w: number, h: number;
    const availW = containerWidth - 40;
    const availH = containerHeight - 40;

    if (aspectRatio >= availW / availH) {
      w = availW;
      h = w / aspectRatio;
    } else {
      h = availH;
      w = h * aspectRatio;
    }

    return {
      x: (containerWidth - w) / 2,
      y: (containerHeight - h) / 2,
      width: w,
      height: h,
    };
  }, [containerWidth, containerHeight, aspectRatio]);

  const cropX = useSharedValue(initial.x);
  const cropY = useSharedValue(initial.y);
  const cropW = useSharedValue(initial.width);
  const cropH = useSharedValue(initial.height);

  // Reset on ratio change
  React.useEffect(() => {
    cropX.value = withTiming(initial.x, { duration: 250 });
    cropY.value = withTiming(initial.y, { duration: 250 });
    cropW.value = withTiming(initial.width, { duration: 250 });
    cropH.value = withTiming(initial.height, { duration: 250 });
  }, [initial]);

  const reportCrop = () => {
    onCropChange?.({
      x: cropX.value,
      y: cropY.value,
      width: cropW.value,
      height: cropH.value,
    });
  };

  // Pan gesture for moving the crop box
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      savedX.value = cropX.value;
      savedY.value = cropY.value;
    })
    .onUpdate((e) => {
      let newX = savedX.value + e.translationX;
      let newY = savedY.value + e.translationY;

      // Clamp to bounds
      newX = Math.max(0, Math.min(newX, containerWidth - cropW.value));
      newY = Math.max(0, Math.min(newY, containerHeight - cropH.value));

      cropX.value = newX;
      cropY.value = newY;
    })
    .onEnd(() => {
      runOnJS(reportCrop)();
    });

  const cropBoxStyle = useAnimatedStyle(() => ({
    left: cropX.value,
    top: cropY.value,
    width: cropW.value,
    height: cropH.value,
  }));

  // Mask overlays (dark areas outside crop)
  const topMask = useAnimatedStyle(() => ({
    top: 0,
    left: 0,
    right: 0,
    height: cropY.value,
  }));

  const bottomMask = useAnimatedStyle(() => ({
    top: cropY.value + cropH.value,
    left: 0,
    right: 0,
    bottom: 0,
  }));

  const leftMask = useAnimatedStyle(() => ({
    top: cropY.value,
    left: 0,
    width: cropX.value,
    height: cropH.value,
  }));

  const rightMask = useAnimatedStyle(() => ({
    top: cropY.value,
    left: cropX.value + cropW.value,
    right: 0,
    height: cropH.value,
  }));

  return (
    <View style={[styles.container, { width: containerWidth, height: containerHeight }]} pointerEvents="box-none">
      {/* Dark masks */}
      <Animated.View style={[styles.mask, topMask]} pointerEvents="none" />
      <Animated.View style={[styles.mask, bottomMask]} pointerEvents="none" />
      <Animated.View style={[styles.mask, leftMask]} pointerEvents="none" />
      <Animated.View style={[styles.mask, rightMask]} pointerEvents="none" />

      {/* Crop box */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.cropBox, cropBoxStyle]}>
          {/* Grid lines */}
          <View style={[styles.gridLineH, { top: '33.33%' }]} />
          <View style={[styles.gridLineH, { top: '66.66%' }]} />
          <View style={[styles.gridLineV, { left: '33.33%' }]} />
          <View style={[styles.gridLineV, { left: '66.66%' }]} />

          {/* Corner handles */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />

          {/* Edge handles */}
          <View style={[styles.edgeMid, styles.edgeTop]} />
          <View style={[styles.edgeMid, styles.edgeBottom]} />
          <View style={[styles.edgeMid, styles.edgeLeft]} />
          <View style={[styles.edgeMid, styles.edgeRight]} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const CORNER_SIZE = 20;
const CORNER_THICK = 3;
const EDGE_LENGTH = 24;
const EDGE_THICK = 3;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  mask: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  cropBox: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
  },
  cornerTL: {
    top: -CORNER_THICK / 2,
    left: -CORNER_THICK / 2,
    borderTopWidth: CORNER_THICK,
    borderLeftWidth: CORNER_THICK,
    borderColor: '#fff',
  },
  cornerTR: {
    top: -CORNER_THICK / 2,
    right: -CORNER_THICK / 2,
    borderTopWidth: CORNER_THICK,
    borderRightWidth: CORNER_THICK,
    borderColor: '#fff',
  },
  cornerBL: {
    bottom: -CORNER_THICK / 2,
    left: -CORNER_THICK / 2,
    borderBottomWidth: CORNER_THICK,
    borderLeftWidth: CORNER_THICK,
    borderColor: '#fff',
  },
  cornerBR: {
    bottom: -CORNER_THICK / 2,
    right: -CORNER_THICK / 2,
    borderBottomWidth: CORNER_THICK,
    borderRightWidth: CORNER_THICK,
    borderColor: '#fff',
  },
  edgeMid: {
    position: 'absolute',
    backgroundColor: '#fff',
  },
  edgeTop: {
    top: -EDGE_THICK / 2,
    left: '50%',
    marginLeft: -EDGE_LENGTH / 2,
    width: EDGE_LENGTH,
    height: EDGE_THICK,
  },
  edgeBottom: {
    bottom: -EDGE_THICK / 2,
    left: '50%',
    marginLeft: -EDGE_LENGTH / 2,
    width: EDGE_LENGTH,
    height: EDGE_THICK,
  },
  edgeLeft: {
    left: -EDGE_THICK / 2,
    top: '50%',
    marginTop: -EDGE_LENGTH / 2,
    width: EDGE_THICK,
    height: EDGE_LENGTH,
  },
  edgeRight: {
    right: -EDGE_THICK / 2,
    top: '50%',
    marginTop: -EDGE_LENGTH / 2,
    width: EDGE_THICK,
    height: EDGE_LENGTH,
  },
});
