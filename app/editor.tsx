import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useLocalSearchParams, router } from 'expo-router';
import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import CropOverlay from '@/components/crop-overlay';
import RatioSelector from '@/components/ratio-selector';

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const interstitial = InterstitialAd.createForAdRequest(TestIds.INTERSTITIAL, {
  requestNonPersonalizedAdsOnly: true,
});

export default function EditorScreen() {
  const params = useLocalSearchParams<{
    uri: string;
    imageWidth: string;
    imageHeight: string;
  }>();

  const imageUri = params.uri;
  const originalWidth = Number(params.imageWidth) || 1080;
  const originalHeight = Number(params.imageHeight) || 1920;

  const [selectedRatioId, setSelectedRatioId] = useState('free');
  const [selectedRatio, setSelectedRatio] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);

  const cropRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);

  // Zoom & Pan shared values
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Calculate image display dimensions
  const PREVIEW_PADDING = 0;
  const maxW = SCREEN_WIDTH - PREVIEW_PADDING * 2;
  const maxH = SCREEN_HEIGHT * 0.55;
  const imageAspect = originalWidth / originalHeight;

  let displayW: number, displayH: number;
  if (imageAspect >= maxW / maxH) {
    displayW = maxW;
    displayH = maxW / imageAspect;
  } else {
    displayH = maxH;
    displayW = maxH * imageAspect;
  }

  React.useEffect(() => {
    const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      setAdLoaded(true);
    });
    
    // Load the ad as soon as editor opens
    interstitial.load();

    return () => {
      unsubscribeLoaded();
    };
  }, []);

  const handleRatioSelect = useCallback((id: string, ratio: number | null) => {
    setSelectedRatioId(id);
    setSelectedRatio(ratio);
  }, []);

  const handleCropChange = useCallback((crop: { x: number; y: number; width: number; height: number }) => {
    cropRef.current = crop;
  }, []);

  const updateZoomLabel = useCallback((s: number) => {
    setZoomLevel(Math.round(s * 10) / 10);
  }, []);

  const resetZoom = useCallback(() => {
    scale.value = withTiming(1, { duration: 250 });
    translateX.value = withTiming(0, { duration: 250 });
    translateY.value = withTiming(0, { duration: 250 });
    savedScale.value = 1;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    setZoomLevel(1);
  }, []);

  // Pinch gesture for zoom
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((e) => {
      const newScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, savedScale.value * e.scale));
      scale.value = newScale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value < 1) {
        scale.value = withTiming(1, { duration: 200 });
        savedScale.value = 1;
        translateX.value = withTiming(0, { duration: 200 });
        translateY.value = withTiming(0, { duration: 200 });
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      }
      runOnJS(updateZoomLabel)(scale.value);
    });

  // Pan gesture for moving zoomed image
  const imagePanGesture = Gesture.Pan()
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((e) => {
      if (scale.value > 1) {
        const maxX = (displayW * (scale.value - 1)) / 2;
        const maxY = (displayH * (scale.value - 1)) / 2;
        translateX.value = Math.min(maxX, Math.max(-maxX, savedTranslateX.value + e.translationX));
        translateY.value = Math.min(maxY, Math.max(-maxY, savedTranslateY.value + e.translationY));
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .minPointers(2);

  const composedGesture = Gesture.Simultaneous(pinchGesture, imagePanGesture);

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Calculate crop rect relative to original image
      const scaleX = originalWidth / displayW;
      const scaleY = originalHeight / displayH;
      const crop = cropRef.current;

      const cropRect = {
        originX: Math.max(0, Math.round(crop.x * scaleX)),
        originY: Math.max(0, Math.round(crop.y * scaleY)),
        width: Math.min(originalWidth, Math.round(crop.width * scaleX)),
        height: Math.min(originalHeight, Math.round(crop.height * scaleY)),
      };

      // Ensure crop rect is within bounds
      if (cropRect.originX + cropRect.width > originalWidth) {
        cropRect.width = originalWidth - cropRect.originX;
      }
      if (cropRect.originY + cropRect.height > originalHeight) {
        cropRect.height = originalHeight - cropRect.originY;
      }

      // Apply crop via image manipulator
      const actions: ImageManipulator.Action[] = [];
      if (cropRect.width > 0 && cropRect.height > 0) {
        actions.push({ crop: cropRect });
      }

      const manipResult = await ImageManipulator.manipulateAsync(
        imageUri,
        actions,
        { compress: 0.95, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Save to gallery
      if (Platform.OS !== 'web') {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
          await MediaLibrary.saveToLibraryAsync(manipResult.uri);
        }
      } else {
        // Web: Download
        const link = document.createElement('a');
        link.href = manipResult.uri;
        link.download = `croplab_${Date.now()}.jpg`;
        link.click();
      }

      setExportDone(true);
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('오류', '이미지 저장 중 오류가 발생했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  if (exportDone) {
    return (
      <View style={styles.container}>
        <Animated.View entering={FadeIn.duration(400)} style={styles.doneContainer}>
          <View style={styles.doneIcon}>
            <Text style={styles.doneEmoji}>✅</Text>
          </View>
          <Text style={styles.doneTitle}>저장 완료!</Text>
          <Text style={styles.doneSubtitle}>
            {Platform.OS === 'web'
              ? '이미지가 다운로드 되었습니다'
              : '갤러리에 저장되었습니다'}
          </Text>
          <View style={styles.doneActions}>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => {
                const action = () => {
                  setExportDone(false);
                  setSelectedRatioId('free');
                  setSelectedRatio(null);
                };
                if (adLoaded) {
                  const unsub = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
                    unsub();
                    interstitial.load();
                    action();
                  });
                  interstitial.show();
                } else {
                  action();
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.doneButtonText}>계속 편집</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.doneButton, styles.doneButtonPrimary]}
              onPress={() => {
                const action = () => router.replace('/');
                if (adLoaded) {
                  const unsub = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
                    unsub();
                    interstitial.load();
                    action();
                  });
                  interstitial.show();
                } else {
                  action();
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.doneButtonText, styles.doneButtonPrimaryText]}>새 사진</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>편집</Text>
        <TouchableOpacity
          onPress={handleExport}
          style={[styles.headerBtn, styles.exportBtn]}
          disabled={isExporting}
        >
          {isExporting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.exportBtnText}>저장</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Image Preview */}
      <View style={styles.previewContainer}>
        <View style={[styles.imageClipContainer, { width: displayW, height: displayH }]}>
          <GestureDetector gesture={composedGesture}>
            <Animated.View
              style={[
                styles.imageWrapper,
                { width: displayW, height: displayH },
                imageAnimatedStyle,
              ]}
            >
              <Image
                source={{ uri: imageUri }}
                style={[styles.previewImage, { width: displayW, height: displayH }]}
                resizeMode="cover"
              />
            </Animated.View>
          </GestureDetector>

          {/* Crop overlay */}
          <CropOverlay
            containerWidth={displayW}
            containerHeight={displayH}
            aspectRatio={selectedRatio}
            onCropChange={handleCropChange}
          />
        </View>

        {/* Zoom indicator */}
        {zoomLevel > 1 && (
          <View style={styles.zoomIndicator}>
            <Text style={styles.zoomText}>🔍 {zoomLevel.toFixed(1)}x</Text>
            <TouchableOpacity onPress={resetZoom} style={styles.zoomResetBtn}>
              <Text style={styles.zoomResetText}>리셋</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Tool Panel */}
      <Animated.View entering={FadeInDown.duration(300)} style={styles.toolPanel}>
        <RatioSelector selectedRatio={selectedRatioId} onSelect={handleRatioSelect} />
      </Animated.View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.dark.background,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.surfaceLight,
  },
  headerBtnText: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: '600',
  },
  headerTitle: {
    color: Colors.dark.text,
    fontSize: 17,
    fontWeight: '700',
  },
  exportBtn: {
    backgroundColor: Colors.dark.accent,
    paddingHorizontal: Spacing.md,
    width: 'auto',
    minWidth: 60,
  },
  exportBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  previewContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  imageClipContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  imageWrapper: {
    position: 'relative',
  },
  previewImage: {
    backgroundColor: '#111',
  },
  zoomIndicator: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  zoomText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  zoomResetBtn: {
    backgroundColor: Colors.dark.accent,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  zoomResetText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  toolPanel: {
    backgroundColor: Colors.dark.surface,
    paddingBottom: Platform.OS === 'ios' ? 34 : Spacing.md,
    minHeight: 100,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  // Export done screen
  doneContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  doneIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.dark.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  doneEmoji: {
    fontSize: 36,
  },
  doneTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.dark.text,
    marginBottom: Spacing.sm,
  },
  doneSubtitle: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.xl,
  },
  doneActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  doneButton: {
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.dark.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  doneButtonText: {
    color: Colors.dark.text,
    fontSize: 15,
    fontWeight: '600',
  },
  doneButtonPrimary: {
    backgroundColor: Colors.dark.accent,
    borderColor: Colors.dark.accent,
  },
  doneButtonPrimaryText: {
    color: '#fff',
  },
});
