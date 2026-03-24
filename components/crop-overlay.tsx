import React, { useMemo, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet } from 'react-native';
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
  isLocked?: boolean;
}

export interface CropOverlayRef {
  centerBox: () => void;
  resetBox: () => void;
}

const CropOverlay = forwardRef<CropOverlayRef, CropOverlayProps>(({
  containerWidth,
  containerHeight,
  aspectRatio,
  onCropChange,
  isLocked = false,
}, ref) => {
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
    
    // Immediately report the target bounds to parent
    onCropChange?.(initial);
  }, [initial, onCropChange]);

  useImperativeHandle(ref, () => ({
    centerBox: () => {
      cropX.value = withTiming(initial.x, { duration: 300 });
      cropY.value = withTiming(initial.y, { duration: 300 });
    },
    resetBox: () => {
      cropX.value = withTiming(initial.x, { duration: 300 });
      cropY.value = withTiming(initial.y, { duration: 300 });
      cropW.value = withTiming(initial.width, { duration: 300 });
      cropH.value = withTiming(initial.height, { duration: 300 });
      
      // Need to report this back to parent so its cropRef is correct
      onCropChange?.(initial);
    }
  }));

  const reportCrop = () => {
    onCropChange?.({
      x: cropX.value,
      y: cropY.value,
      width: cropW.value,
      height: cropH.value,
    });
  };

  const isInteracting = useSharedValue(0.1); // slightly visible normally

  // Pan gesture for moving the crop box
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);
  const savedW = useSharedValue(0);
  const savedH = useSharedValue(0);
  const dragMode = useSharedValue(0); // 0:move, 1:tl, 2:tr, 3:br, 4:bl, 5:t, 6:r, 7:b, 8:l

  const panGesture = useMemo(() => {
    return Gesture.Pan()
      .enabled(!isLocked)
      .onStart((e) => {
        savedX.value = cropX.value;
        savedY.value = cropY.value;
        savedW.value = cropW.value;
        savedH.value = cropH.value;
        isInteracting.value = withTiming(1, { duration: 150 });

        const ACTIVE_AREA = 40;
        const isLeft = e.x < ACTIVE_AREA;
        const isRight = e.x > cropW.value - ACTIVE_AREA;
        const isTop = e.y < ACTIVE_AREA;
        const isBottom = e.y > cropH.value - ACTIVE_AREA;

        if (isTop && isLeft) dragMode.value = 1;
        else if (isTop && isRight) dragMode.value = 2;
        else if (isBottom && isRight) dragMode.value = 3;
        else if (isBottom && isLeft) dragMode.value = 4;
        else if (isTop) dragMode.value = 5;
        else if (isRight) dragMode.value = 6;
        else if (isBottom) dragMode.value = 7;
        else if (isLeft) dragMode.value = 8;
        else dragMode.value = 0; // move
      })
      .onUpdate((e) => {
        let nx = savedX.value;
        let ny = savedY.value;
        let nw = savedW.value;
        let nh = savedH.value;
        const mode = dragMode.value;

        if (mode === 0) {
          nx += e.translationX;
          ny += e.translationY;
        } else {
          // Calculate requested size and position
          if (mode === 1 || mode === 8 || mode === 4) { // left
            const maxDx = savedW.value - MIN_CROP_SIZE;
            const dx = Math.min(e.translationX, maxDx);
            nx += dx;
            nw -= dx;
          }
          if (mode === 2 || mode === 6 || mode === 3) { // right
            const minDx = MIN_CROP_SIZE - savedW.value;
            const dx = Math.max(e.translationX, minDx);
            nw += dx;
          }
          if (mode === 1 || mode === 5 || mode === 2) { // top
            const maxDy = savedH.value - MIN_CROP_SIZE;
            const dy = Math.min(e.translationY, maxDy);
            ny += dy;
            nh -= dy;
          }
          if (mode === 4 || mode === 7 || mode === 3) { // bottom
            const minDy = MIN_CROP_SIZE - savedH.value;
            const dy = Math.max(e.translationY, minDy);
            nh += dy;
          }

          // Enforce aspect ratio
          if (aspectRatio !== null) {
            const expectedH = nw / aspectRatio;
            const expectedW = nh * aspectRatio;

            if (mode === 1 || mode === 2 || mode === 3 || mode === 4) {
              nh = expectedH;
              if (mode === 1 || mode === 2) {
                ny = savedY.value + savedH.value - nh;
              }
            } else if (mode === 6 || mode === 8) {
              nh = expectedH;
              ny = savedY.value + (savedH.value - nh) / 2;
            } else if (mode === 5 || mode === 7) {
              nw = expectedW;
              nx = savedX.value + (savedW.value - nw) / 2;
            }
          }
        }

        // Apply boundary constraints
        if (nw > containerWidth) nw = containerWidth;
        if (nh > containerHeight) nh = containerHeight;
        if (nx < 0) {
          if (mode !== 0) nw += nx;
          nx = 0;
        }
        if (ny < 0) {
          if (mode !== 0) nh += ny;
          ny = 0;
        }
        if (nx + nw > containerWidth) {
          if (mode !== 0) nw = containerWidth - nx;
        }
        if (ny + nh > containerHeight) {
          if (mode !== 0) nh = containerHeight - ny;
        }

        // Solidify Aspect Ratio against bounds clamping destroying it
        if (aspectRatio !== null && mode !== 0) {
          const currentRatio = nw / nh;
          if (Math.abs(currentRatio - aspectRatio) > 0.01) {
            if (currentRatio > aspectRatio) {
              const adjustedW = nh * aspectRatio;
              if (mode === 1 || mode === 8 || mode === 4) nx += nw - adjustedW;
              nw = adjustedW;
            } else {
              const adjustedH = nw / aspectRatio;
              if (mode === 1 || mode === 5 || mode === 2) ny += nh - adjustedH;
              nh = adjustedH;
            }
          }
        }

        if (mode === 0) {
          nx = Math.max(0, Math.min(nx, containerWidth - nw));
          ny = Math.max(0, Math.min(ny, containerHeight - nh));
        }

        cropX.value = nx;
        cropY.value = ny;
        cropW.value = nw;
        cropH.value = nh;
      })
      .onEnd(() => {
        isInteracting.value = withTiming(0.1, { duration: 300 });
        runOnJS(reportCrop)();
      });
  }, [isLocked, containerWidth, containerHeight, aspectRatio]);

  const cropBoxStyle = useAnimatedStyle(() => ({
    left: cropX.value,
    top: cropY.value,
    width: cropW.value,
    height: cropH.value,
  }));

  const gridStyle = useAnimatedStyle(() => ({
    opacity: isInteracting.value,
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
          <Animated.View style={[StyleSheet.absoluteFill, gridStyle]}>
            <View style={[styles.gridLineH, { top: '33.33%' }]} />
            <View style={[styles.gridLineH, { top: '66.66%' }]} />
            <View style={[styles.gridLineV, { left: '33.33%' }]} />
            <View style={[styles.gridLineV, { left: '66.66%' }]} />
          </Animated.View>

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
});

export default CropOverlay;

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
