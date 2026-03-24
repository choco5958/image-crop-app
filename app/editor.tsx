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
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { FILTERS, FilterPreset } from '@/constants/filters';
import CropOverlay from '@/components/crop-overlay';
import RatioSelector from '@/components/ratio-selector';
import FilterStrip from '@/components/filter-strip';
import AdjustPanel, { AdjustValues, DEFAULT_ADJUST } from '@/components/adjust-panel';
import BeautyPanel, { BeautyValues, DEFAULT_BEAUTY } from '@/components/beauty-panel';

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type EditorMode = 'crop' | 'filter' | 'adjust' | 'beauty';

export default function EditorScreen() {
  const params = useLocalSearchParams<{
    uri: string;
    imageWidth: string;
    imageHeight: string;
  }>();

  const imageUri = params.uri;
  const originalWidth = Number(params.imageWidth) || 1080;
  const originalHeight = Number(params.imageHeight) || 1920;

  const [mode, setMode] = useState<EditorMode>('crop');
  const [selectedRatioId, setSelectedRatioId] = useState('free');
  const [selectedRatio, setSelectedRatio] = useState<number | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterPreset>(FILTERS[0]);
  const [adjustValues, setAdjustValues] = useState<AdjustValues>({ ...DEFAULT_ADJUST });
  const [beautyValues, setBeautyValues] = useState<BeautyValues>({ ...DEFAULT_BEAUTY });
  const [isExporting, setIsExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);

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

  const handleRatioSelect = useCallback((id: string, ratio: number | null) => {
    setSelectedRatioId(id);
    setSelectedRatio(ratio);
  }, []);

  const handleFilterSelect = useCallback((filter: FilterPreset) => {
    setSelectedFilter(filter);
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
                setExportDone(false);
                setSelectedFilter(FILTERS[0]);
                setSelectedRatioId('free');
                setSelectedRatio(null);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.doneButtonText}>계속 편집</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.doneButton, styles.doneButtonPrimary]}
              onPress={() => router.replace('/')}
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

              {/* Filter overlay on preview */}
              {selectedFilter.id !== 'original' && (
                <View
                  style={[
                    styles.filterPreviewOverlay,
                    {
                      backgroundColor: selectedFilter.overlay,
                      opacity: selectedFilter.saturation < 0.5 ? 0.5 : selectedFilter.overlayOpacity * 2,
                    },
                  ]}
                  pointerEvents="none"
                />
              )}
              {selectedFilter.saturation < 0.5 && (
                <View
                  style={[styles.filterPreviewOverlay, { backgroundColor: 'rgba(128,128,128,0.45)' }]}
                  pointerEvents="none"
                />
              )}

              {/* Adjust overlays on preview */}
              {(adjustValues.brightness !== 0 || adjustValues.warmth !== 0) && (
                <View
                  style={[
                    styles.filterPreviewOverlay,
                    {
                      backgroundColor: adjustValues.warmth > 0
                        ? `rgba(255, 165, 0, ${Math.abs(adjustValues.warmth) / 500})`
                        : adjustValues.warmth < 0
                        ? `rgba(0, 120, 255, ${Math.abs(adjustValues.warmth) / 500})`
                        : 'transparent',
                      opacity: 1,
                    },
                  ]}
                  pointerEvents="none"
                />
              )}
              {adjustValues.brightness !== 0 && (
                <View
                  style={[
                    styles.filterPreviewOverlay,
                    {
                      backgroundColor: adjustValues.brightness > 0
                        ? `rgba(255, 255, 255, ${adjustValues.brightness / 300})`
                        : `rgba(0, 0, 0, ${Math.abs(adjustValues.brightness) / 300})`,
                    },
                  ]}
                  pointerEvents="none"
                />
              )}
              {adjustValues.vignette > 0 && (
                <View
                  style={[
                    styles.filterPreviewOverlay,
                    {
                      backgroundColor: 'transparent',
                      borderWidth: adjustValues.vignette * 0.5,
                      borderColor: `rgba(0, 0, 0, ${adjustValues.vignette / 150})`,
                    },
                  ]}
                  pointerEvents="none"
                />
              )}

              {/* Beauty overlays on preview */}
              {beautyValues.blush > 0 && (
                <View
                  style={[
                    styles.filterPreviewOverlay,
                    {
                      backgroundColor: `rgba(255, 107, 157, ${beautyValues.blush / 400})`,
                    },
                  ]}
                  pointerEvents="none"
                />
              )}
              {beautyValues.skinTone > 0 && (
                <View
                  style={[
                    styles.filterPreviewOverlay,
                    {
                      backgroundColor: `rgba(255, 240, 230, ${beautyValues.skinTone / 400})`,
                    },
                  ]}
                  pointerEvents="none"
                />
              )}
              {beautyValues.skinSmooth > 0 && (
                <View
                  style={[
                    styles.filterPreviewOverlay,
                    {
                      // fake blur/smoothing via subtle white overlay
                      backgroundColor: `rgba(255, 255, 255, ${beautyValues.skinSmooth / 400})`,
                    },
                  ]}
                  pointerEvents="none"
                />
              )}
            </Animated.View>
          </GestureDetector>

          {/* Crop overlay (only in crop mode) */}
          {mode === 'crop' && (
            <CropOverlay
              containerWidth={displayW}
              containerHeight={displayH}
              aspectRatio={selectedRatio}
              onCropChange={handleCropChange}
            />
          )}
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

      {/* Mode Tabs */}
      <View style={styles.modeTabs}>
        <TouchableOpacity
          style={[styles.modeTab, mode === 'crop' && styles.modeTabActive]}
          onPress={() => setMode('crop')}
        >
          <Text style={[styles.modeTabIcon, mode === 'crop' && styles.modeTabIconActive]}>📐</Text>
          <Text style={[styles.modeTabText, mode === 'crop' && styles.modeTabTextActive]}>
            크롭
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeTab, mode === 'filter' && styles.modeTabActive]}
          onPress={() => setMode('filter')}
        >
          <Text style={[styles.modeTabIcon, mode === 'filter' && styles.modeTabIconActive]}>🎨</Text>
          <Text style={[styles.modeTabText, mode === 'filter' && styles.modeTabTextActive]}>
            필터
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeTab, mode === 'adjust' && styles.modeTabActive]}
          onPress={() => setMode('adjust')}
        >
          <Text style={[styles.modeTabIcon, mode === 'adjust' && styles.modeTabIconActive]}>🎚️</Text>
          <Text style={[styles.modeTabText, mode === 'adjust' && styles.modeTabTextActive]}>
            보정
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeTab, mode === 'beauty' && styles.modeTabActive]}
          onPress={() => setMode('beauty')}
        >
          <Text style={[styles.modeTabIcon, mode === 'beauty' && styles.modeTabIconActive]}>✨</Text>
          <Text style={[styles.modeTabText, mode === 'beauty' && styles.modeTabTextActive]}>
            뷰티
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tool Panel */}
      <Animated.View entering={FadeInDown.duration(300)} style={styles.toolPanel}>
        {mode === 'crop' && (
          <RatioSelector selectedRatio={selectedRatioId} onSelect={handleRatioSelect} />
        )}
        {mode === 'filter' && (
          <FilterStrip
            imageUri={imageUri}
            selectedFilter={selectedFilter.id}
            onSelect={handleFilterSelect}
          />
        )}
        {mode === 'adjust' && (
          <AdjustPanel values={adjustValues} onChange={setAdjustValues} />
        )}
        {mode === 'beauty' && (
          <BeautyPanel values={beautyValues} onChange={setBeautyValues} />
        )}
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
  filterPreviewOverlay: {
    ...StyleSheet.absoluteFillObject,
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
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm + 2,
    gap: 6,
  },
  modeTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.dark.accent,
  },
  modeTabIcon: {
    fontSize: 16,
    opacity: 0.5,
  },
  modeTabIconActive: {
    opacity: 1,
  },
  modeTabText: {
    color: Colors.dark.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  modeTabTextActive: {
    color: Colors.dark.accentLight,
  },
  toolPanel: {
    backgroundColor: Colors.dark.surface,
    paddingBottom: Platform.OS === 'ios' ? 34 : Spacing.md,
    minHeight: 100,
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
