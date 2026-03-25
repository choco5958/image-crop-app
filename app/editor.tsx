import AdjustPanel from "@/components/adjust-panel";
import {
  AdEventType,
  InterstitialAd,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from "@/components/ads";
import CropOverlay, { CropOverlayRef } from "@/components/crop-overlay";
import FilterPanel from "@/components/filter-panel";
import RatioSelector from "@/components/ratio-selector";
import RotationSlider from "@/components/rotation-slider";
import { FilterPreset } from "@/constants/filters";
import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { useLanguage } from "@/context/language-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImageManipulator from "expo-image-manipulator";
import * as MediaLibrary from "expo-media-library";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  FadeIn,
  FadeInDown,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import ViewShot from "react-native-view-shot";

const MIN_ZOOM = 0.05;
const MAX_ZOOM = 5;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const interstitial = InterstitialAd.createForAdRequest(TestIds.INTERSTITIAL, {
  requestNonPersonalizedAdsOnly: true,
});

const rewardedAd = RewardedAd.createForAdRequest(TestIds.REWARDED, {
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

  const [selectedRatioId, setSelectedRatioId] = useState("free");
  const [selectedRatio, setSelectedRatio] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);
  const [rewardedLoaded, setRewardedLoaded] = useState(false);
  const [rotation, setRotation] = useState(0); // Fine tilt (-45 to 45)
  const [orientation, setOrientation] = useState(0); // 90 degree increments
  const [bgColor, setBgColor] = useState("#000000");
  const [isFitMode, setIsFitMode] = useState(false);

  // Tab State
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"crop" | "adjust" | "filter">(
    "crop",
  );
  const [cropSubTab, setCropSubTab] = useState<"ratio" | "rotation">("ratio");

  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [saturation, setSaturation] = useState(1);
  const [warmth, setWarmth] = useState(1);
  const [vignette, setVignette] = useState(0);
  const [exposure, setExposure] = useState(1);
  const [brilliance, setBrilliance] = useState(0);
  const [highlights, setHighlights] = useState(0);
  const [shadows, setShadows] = useState(0);
  const [tint, setTint] = useState(0);
  const [sharpness, setSharpness] = useState(0);
  const [vibrance, setVibrance] = useState(1);
  const [definition, setDefinition] = useState(0);
  const [blackPoint, setBlackPoint] = useState(1);
  const [activeFilterId, setActiveFilterId] = useState("original");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [overlayColor, setOverlayColor] = useState("transparent");

  const switchTab = useCallback((tab: "crop" | "adjust" | "filter") => {
    Haptics.selectionAsync();
    setActiveTab(tab);
  }, []);

  const handleSelectFilter = useCallback((filter: FilterPreset) => {
    setActiveFilterId(filter.id);
    setBrightness(filter.brightness);
    setContrast(filter.contrast);
    setSaturation(filter.saturation);
    setOverlayColor(filter.overlay);

    // Apply extended professional adjustments from the preset
    setExposure(filter.exposure);
    setBrilliance(filter.brilliance);
    setHighlights(filter.highlights);
    setShadows(filter.shadows);
    setWarmth(filter.warmth);
    setTint(filter.tint);
    setVignette(filter.vignette);
    setSharpness(filter.sharpness);
    setVibrance(filter.vibrance || 1);
    setDefinition(filter.definition || 0);
    setBlackPoint(filter.blackPoint || 1);
  }, []);

  const cropRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const viewShotRef = useRef<ViewShot>(null);
  const cropOverlayRef = useRef<CropOverlayRef>(null);

  // Zoom & Pan shared values
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Calculate image display dimensions
  const PREVIEW_PADDING = 20;

  // Constrain max image height so it never overlaps the dense bottom panels
  // On very short screens (e.g. iPhone SE 1st gen), use a smaller multiplier
  const isShortScreen = SCREEN_HEIGHT < 700;
  const maxW = SCREEN_WIDTH - PREVIEW_PADDING * 2;
  const maxH = isShortScreen ? SCREEN_HEIGHT * 0.38 : SCREEN_HEIGHT * 0.45;

  const imageAspect = useMemo(
    () => originalWidth / originalHeight,
    [originalWidth, originalHeight],
  );

  let displayW: number, displayH: number;
  if (imageAspect >= maxW / maxH) {
    displayW = maxW;
    displayH = maxW / imageAspect;
  } else {
    displayH = maxH;
    displayW = maxH * imageAspect;
  }

  React.useEffect(() => {
    const unsubscribeLoaded = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => {
        setAdLoaded(true);
      },
    );
    const unsubscribeRewarded = rewardedAd.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        setRewardedLoaded(true);
      },
    );

    // Load the ads as soon as editor opens
    interstitial.load();
    rewardedAd.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeRewarded();
    };
  }, []);

  const resetZoom = useCallback(() => {
    scale.value = withTiming(1, { duration: 250 });
    translateX.value = withTiming(0, { duration: 250 });
    translateY.value = withTiming(0, { duration: 250 });
    savedScale.value = 1;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    setIsFitMode(false);
  }, []);

  const handleRatioSelect = useCallback(
    (id: string, ratio: number | null) => {
      Haptics.selectionAsync();
      setSelectedRatioId(id);
      setSelectedRatio(ratio);
      setIsFitMode(false);
      resetZoom();
    },
    [resetZoom],
  );

  const handleCropChange = useCallback(
    (crop: { x: number; y: number; width: number; height: number }) => {
      cropRef.current = crop;
    },
    [],
  );

  const toggleFitMode = useCallback(() => {
    // 1. Reset the crop box to its maximum stable size for the current ratio.
    // This prevents the "shrinking spiral" where we scale against a shrunk box.
    cropOverlayRef.current?.resetBox();

    // The resetBox call immediately updates cropRef.current to the 'initial' state.
    const crop = cropRef.current;
    if (crop.width === 0 || crop.height === 0) return;

    const totalRotation = orientation + rotation;
    const rad = (Math.abs(totalRotation) * Math.PI) / 180;
    const cosA = Math.abs(Math.cos(rad));
    const sinA = Math.abs(Math.sin(rad));

    const newIsFitMode = !isFitMode;
    let targetScale = 1;

    // Bounding Box of the image after ALL rotations (orientation + tilt)
    const orientedBW = displayW * cosA + displayH * sinA;
    const orientedBH = displayW * sinA + displayH * cosA;

    if (newIsFitMode) {
      // FIT: Image fits entirely inside the crop box
      targetScale = Math.min(crop.width / orientedBW, crop.height / orientedBH);
    } else {
      // FILL: Image fills the crop box (minimal covering scale)
      targetScale = Math.max(crop.width / orientedBW, crop.height / orientedBH);
    }

    scale.value = withTiming(targetScale, { duration: 300 });
    translateX.value = withTiming(0, { duration: 300 });
    translateY.value = withTiming(0, { duration: 300 });

    savedScale.value = targetScale;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;

    runOnJS(setIsFitMode)(newIsFitMode);
  }, [displayW, displayH, isFitMode, rotation, orientation]);

  // Pinch gesture for zoom
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((e) => {
      const newScale = Math.min(
        MAX_ZOOM,
        Math.max(MIN_ZOOM, savedScale.value * e.scale),
      );
      scale.value = newScale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      // Removed the snap-back to 1.0 because 'Fit' mode often requires scales < 1.0.
      // The user can still zoom in further, and we rely on MAX_ZOOM for limits.
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
        translateX.value = Math.min(
          maxX,
          Math.max(-maxX, savedTranslateX.value + e.translationX),
        );
        translateY.value = Math.min(
          maxY,
          Math.max(-maxY, savedTranslateY.value + e.translationY),
        );
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .minPointers(2);

  const composedGesture = Gesture.Simultaneous(pinchGesture, imagePanGesture);

  const imageAnimatedStyle = useAnimatedStyle(
    () => ({
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
        { rotate: `${orientation + rotation}deg` },
      ],
    }),
    [orientation, rotation],
  );

  const processExport = async (isPremium: boolean) => {
    setIsExporting(true);
    try {
      if (Platform.OS === "web") {
        // --- Web Export Logic using HTML5 Canvas ---
        const image = new window.Image();
        image.crossOrigin = "anonymous";
        image.src = imageUri;
        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = reject;
        });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context failed");

        const qualityScale = isPremium ? 2 : 1.2;
        canvas.width = displayW * qualityScale;
        canvas.height = displayH * qualityScale;

        // 1. Fill Background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. Apply Filters
        ctx.filter = `brightness(${brightness * exposure * blackPoint}) contrast(${contrast}) saturate(${saturation * vibrance}) hue-rotate(${tint * 45}deg) ${
          sharpness > 0 || definition !== 0 ? "url(#adjust-sharpness)" : ""
        } ${highlights !== 0 || shadows !== 0 ? "url(#adjust-hi-sh)" : ""}`;

        // 3. Transformations
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(((orientation + rotation) * Math.PI) / 180);
        ctx.scale(scale.value * qualityScale, scale.value * qualityScale);
        ctx.translate(translateX.value, translateY.value);

        // 4. Draw Image (centered)
        ctx.drawImage(image, -displayW / 2, -displayH / 2, displayW, displayH);

        ctx.restore();

        // 5. Apply Vignette (simple radial gradient for web)
        if (vignette > 0) {
          const grad = ctx.createRadialGradient(
            canvas.width / 2,
            canvas.height / 2,
            0,
            canvas.width / 2,
            canvas.height / 2,
            Math.max(canvas.width, canvas.height) / 1.5,
          );
          grad.addColorStop(0, "rgba(0,0,0,0)");
          grad.addColorStop(1, `rgba(0,0,0,${vignette * 0.9})`);
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 6. Crop if we have a specific crop range (usually view is already clipped by ViewShot layout)
        const crop = cropRef.current;
        const resultCanvas = document.createElement("canvas");
        resultCanvas.width = crop.width * qualityScale;
        resultCanvas.height = crop.height * qualityScale;
        const resultCtx = resultCanvas.getContext("2d");
        resultCtx?.drawImage(
          canvas,
          crop.x * qualityScale,
          crop.y * qualityScale,
          crop.width * qualityScale,
          crop.height * qualityScale,
          0,
          0,
          resultCanvas.width,
          resultCanvas.height,
        );

        const link = document.createElement("a");
        link.href = resultCanvas.toDataURL("image/jpeg", 0.92);
        link.download = `croplab_${Date.now()}.jpg`;
        link.click();

        setExportDone(true);
      } else {
        // --- Native Export Logic (ViewShot) ---
        if (!viewShotRef.current?.capture)
          throw new Error("ViewShot not ready");

        const pr = 2; // captures at 2x resolution
        const snapshotUri = await viewShotRef.current.capture();

        const crop = cropRef.current;
        const cropRect = {
          originX: Math.round(crop.x * pr),
          originY: Math.round(crop.y * pr),
          width: Math.round(crop.width * pr),
          height: Math.round(crop.height * pr),
        };

        const manipResult = await ImageManipulator.manipulateAsync(
          snapshotUri,
          [{ crop: cropRect }],
          {
            compress: isPremium ? 1.0 : 0.8,
            format: ImageManipulator.SaveFormat.JPEG,
          },
        );

        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === "granted") {
          await MediaLibrary.saveToLibraryAsync(manipResult.uri);
          setExportDone(true);
        }
      }
    } catch (error) {
      console.error("Export error:", error);
      Alert.alert(t("error"), t("saveError"));
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportClick = () => {
    setShowSaveModal(true);
  };

  if (exportDone) {
    return (
      <View style={styles.container}>
        <Animated.View
          entering={FadeIn.duration(400)}
          style={styles.doneContainer}
        >
          <View style={styles.doneIcon}>
            <Text style={styles.doneEmoji}>✅</Text>
          </View>
          <Text style={styles.doneTitle}>{t("saveCompleteTitle")}</Text>
          <Text style={styles.doneSubtitle}>
            {Platform.OS === "web"
              ? t("saveCompleteWeb")
              : t("saveCompleteNative")}
          </Text>
          <View style={styles.doneActions}>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => {
                const action = () => {
                  setExportDone(false);
                  setSelectedRatioId("free");
                  setSelectedRatio(null);
                };
                if (adLoaded) {
                  const unsub = interstitial.addAdEventListener(
                    AdEventType.CLOSED,
                    () => {
                      unsub();
                      interstitial.load();
                      action();
                    },
                  );
                  interstitial.show();
                } else {
                  action();
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.doneButtonText}>{t("continueEditing")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.doneButton, styles.doneButtonPrimary]}
              onPress={() => {
                const action = () => router.replace("/");
                if (adLoaded) {
                  const unsub = interstitial.addAdEventListener(
                    AdEventType.CLOSED,
                    () => {
                      unsub();
                      interstitial.load();
                      action();
                    },
                  );
                  interstitial.show();
                } else {
                  action();
                }
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.doneButtonText, styles.doneButtonPrimaryText]}
              >
                {t("newPhoto")}
              </Text>
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
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBtn}
        >
          <Text style={styles.headerBtnText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("edit")}</Text>
        <TouchableOpacity
          onPress={handleExportClick}
          style={[styles.headerBtn, styles.exportBtn]}
          disabled={isExporting}
        >
          {isExporting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.exportBtnText}>{t("save")}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Image Preview */}
      <View style={styles.previewContainer}>
        <View style={{ width: displayW, height: displayH }}>
          <ViewShot
            ref={viewShotRef}
            options={{ format: "jpg", quality: 1 }}
            style={[
              styles.imageClipContainer,
              { width: displayW, height: displayH, backgroundColor: bgColor },
            ]}
          >
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
                  style={[
                    styles.previewImage,
                    { width: displayW, height: displayH },
                    Platform.OS === "web" &&
                      ({
                        filter: `brightness(${brightness * exposure * blackPoint}) contrast(${contrast}) saturate(${saturation * vibrance}) hue-rotate(${tint * 45}deg) ${
                          sharpness > 0 || definition !== 0
                            ? "url(#adjust-sharpness)"
                            : ""
                        } ${
                          highlights !== 0 || shadows !== 0
                            ? "url(#adjust-hi-sh)"
                            : ""
                        }`,
                      } as any),
                  ]}
                  resizeMode="contain"
                />
                <View
                  style={[
                    StyleSheet.absoluteFill,
                    { backgroundColor: overlayColor },
                    { pointerEvents: "none" },
                  ]}
                />

                {/* Warmth Tone Overlay */}
                <View
                  style={[
                    StyleSheet.absoluteFill,
                    {
                      backgroundColor:
                        warmth > 1
                          ? `rgba(255, 140, 0, ${(warmth - 1) * 0.25})`
                          : `rgba(0, 100, 255, ${(1 - warmth) * 0.25})`,
                    },
                    { pointerEvents: "none" },
                  ]}
                />

                {/* Vignette Overlay (Web CSS) */}
                {vignette > 0 && Platform.OS === "web" && (
                  <View
                    style={[
                      StyleSheet.absoluteFill,
                      {
                        pointerEvents: "none",
                        boxShadow: `inset 0 0 ${vignette * 150}px rgba(0,0,0,${vignette * 0.9})`,
                      } as any,
                    ]}
                  />
                )}
              </Animated.View>
            </GestureDetector>
          </ViewShot>

          {/* Crop overlay */}
          <CropOverlay
            ref={cropOverlayRef}
            containerWidth={displayW}
            containerHeight={displayH}
            aspectRatio={selectedRatio}
            onCropChange={handleCropChange}
            isLocked={isFitMode}
          />
        </View>
      </View>

      {/* Tool Panel */}
      <Animated.View
        entering={FadeInDown.duration(300)}
        style={styles.toolPanel}
      >
        {/* Tab Contents */}
        <View style={styles.tabContentContainer}>
          {activeTab === "crop" && (
            <Animated.View
              entering={FadeIn.duration(200)}
              style={[styles.tabContent, { paddingBottom: 0 }]}
            >
              {/* Sub-tab Selector */}
              <View style={styles.cropSubTabBar}>
                <TouchableOpacity
                  onPress={() => {
                    Haptics.selectionAsync();
                    setCropSubTab("ratio");
                  }}
                  style={[
                    styles.cropSubTab,
                    cropSubTab === "ratio" && styles.cropSubTabActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.cropSubTabText,
                      cropSubTab === "ratio" && styles.cropSubTabTextActive,
                    ]}
                  >
                    {t("ratio")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    Haptics.selectionAsync();
                    setCropSubTab("rotation");
                  }}
                  style={[
                    styles.cropSubTab,
                    cropSubTab === "rotation" && styles.cropSubTabActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.cropSubTabText,
                      cropSubTab === "rotation" && styles.cropSubTabTextActive,
                    ]}
                  >
                    {t("skew")}
                  </Text>
                </TouchableOpacity>
              </View>

              {cropSubTab === "ratio" ? (
                <View style={{ flex: 1, justifyContent: "center" }}>
                  <View
                    style={[
                      styles.cropActionHeader,
                      {
                        justifyContent: "space-between",
                        width: "100%",
                        paddingHorizontal: 24,
                        marginBottom: 12,
                      },
                    ]}
                  >
                    {/* Background Palette */}
                    <View style={styles.bgPalette}>
                      {["#000000", "#FFFFFF"].map((col) => (
                        <TouchableOpacity
                          key={col}
                          onPress={() => {
                            Haptics.selectionAsync();
                            setBgColor(col);
                          }}
                          style={[
                            styles.paletteCircle,
                            {
                              backgroundColor: col,
                              width: 28,
                              height: 28,
                              borderColor:
                                col === "#FFFFFF"
                                  ? "rgba(255,255,255,0.3)"
                                  : "rgba(255,255,255,0.1)",
                            },
                            bgColor === col && styles.paletteCircleActive,
                          ]}
                        />
                      ))}
                    </View>

                    {/* Fit Toggle */}
                    <TouchableOpacity
                      onPress={toggleFitMode}
                      style={[
                        styles.iconBtn,
                        isFitMode && { backgroundColor: Colors.dark.accent },
                      ]}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={isFitMode ? "expand" : "contract"}
                        size={22}
                        color={isFitMode ? "#fff" : Colors.dark.text}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={{ marginBottom: 0 }}>
                    <RatioSelector
                      selectedRatio={selectedRatioId}
                      onSelect={handleRatioSelect}
                    />
                  </View>
                </View>
              ) : (
                <View
                  style={[
                    styles.tabContent,
                    { gap: 12, justifyContent: "center" },
                  ]}
                >
                  <View
                    style={[
                      styles.cropActionHeader,
                      { justifyContent: "center", width: "100%", gap: 20 },
                    ]}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setOrientation((o) => o - 90);
                      }}
                      style={styles.iconBtn}
                    >
                      <Ionicons
                        name="refresh"
                        size={20}
                        color={Colors.dark.text}
                        style={{ transform: [{ scaleX: -1 }] }}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setOrientation((o) => o + 90);
                      }}
                      style={styles.iconBtn}
                    >
                      <Ionicons
                        name="refresh"
                        size={20}
                        color={Colors.dark.text}
                      />
                    </TouchableOpacity>

                    <View style={styles.resetContainer}>
                      <TouchableOpacity
                        onPress={() => {
                          if (rotation === 0 && orientation === 0) return;
                          Haptics.notificationAsync(
                            Haptics.NotificationFeedbackType.Success,
                          );
                          setRotation(0);
                          setOrientation(0);
                        }}
                        style={[
                          styles.resetBtn,
                          rotation === 0 &&
                            orientation === 0 && { opacity: 0.5 },
                        ]}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="refresh"
                          size={14}
                          color={Colors.dark.text}
                        />
                        <Text style={styles.resetText}>{t("reset")}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={[styles.sliderSection, { paddingBottom: 12 }]}>
                    <RotationSlider
                      value={rotation}
                      onChange={setRotation}
                      width={SCREEN_WIDTH - 64}
                    />
                  </View>
                </View>
              )}
            </Animated.View>
          )}

          {activeTab === "adjust" && (
            <Animated.View
              entering={FadeIn.duration(200)}
              style={styles.tabContent}
            >
              <AdjustPanel
                brightness={brightness}
                setBrightness={setBrightness}
                contrast={contrast}
                setContrast={setContrast}
                saturation={saturation}
                setSaturation={setSaturation}
                warmth={warmth}
                setWarmth={setWarmth}
                vignette={vignette}
                setVignette={setVignette}
                exposure={exposure}
                setExposure={setExposure}
                brilliance={brilliance}
                setBrilliance={setBrilliance}
                highlights={highlights}
                setHighlights={setHighlights}
                shadows={shadows}
                setShadows={setShadows}
                tint={tint}
                setTint={setTint}
                sharpness={sharpness}
                setSharpness={setSharpness}
                vibrance={vibrance}
                setVibrance={setVibrance}
                definition={definition}
                setDefinition={setDefinition}
                blackPoint={blackPoint}
                setBlackPoint={setBlackPoint}
              />
            </Animated.View>
          )}

          {activeTab === "filter" && (
            <Animated.View
              entering={FadeIn.duration(200)}
              style={styles.tabContentCenter}
            >
              <FilterPanel
                activeFilterId={activeFilterId}
                onSelectFilter={handleSelectFilter}
                imageUri={imageUri}
              />
            </Animated.View>
          )}
        </View>

        {/* Bottom Tab Bar */}
        <View style={styles.bottomTabBar}>
          <TouchableOpacity
            onPress={() => switchTab("crop")}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <Ionicons
              name="crop"
              size={22}
              color={
                activeTab === "crop"
                  ? Colors.dark.accent
                  : Colors.dark.textSecondary
              }
              style={{ marginBottom: 4 }}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === "crop" && styles.tabLabelActive,
              ]}
            >
              {t("crop")}
            </Text>
            {activeTab === "crop" && <View style={styles.activeDot} />}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => switchTab("filter")}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <Ionicons
              name="color-filter"
              size={22}
              color={
                activeTab === "filter"
                  ? Colors.dark.accent
                  : Colors.dark.textSecondary
              }
              style={{ marginBottom: 4 }}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === "filter" && styles.tabLabelActive,
              ]}
            >
              {t("filter")}
            </Text>
            {activeTab === "filter" && <View style={styles.activeDot} />}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => switchTab("adjust")}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <Ionicons
              name="options"
              size={22}
              color={
                activeTab === "adjust"
                  ? Colors.dark.accent
                  : Colors.dark.textSecondary
              }
              style={{ marginBottom: 4 }}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === "adjust" && styles.tabLabelActive,
              ]}
            >
              {t("adjust")}
            </Text>
            {activeTab === "adjust" && <View style={styles.activeDot} />}
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Save Selection Modal */}
      {showSaveModal && (
        <View style={StyleSheet.absoluteFill}>
          <Animated.View
            entering={FadeIn.duration(200)}
            style={styles.modalOverlay}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => setShowSaveModal(false)}
              style={StyleSheet.absoluteFill}
            />

            <Animated.View
              entering={FadeInDown.springify()}
              style={styles.modalContent}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t("saveOptions")}</Text>
                <Text style={styles.modalSubtitle}>{t("saveResolution")}</Text>
              </View>

              <View style={styles.modalOptions}>
                <TouchableOpacity
                  style={styles.modalOptionBtn}
                  onPress={() => {
                    setShowSaveModal(false);
                    processExport(false);
                  }}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.optionIcon,
                      { backgroundColor: "rgba(255,255,255,0.1)" },
                    ]}
                  >
                    <Ionicons
                      name="image-outline"
                      size={24}
                      color={Colors.dark.text}
                    />
                  </View>
                  <View style={styles.optionInfo}>
                    <Text style={styles.modalOptionTitle}>
                      {t("standardQuality")}
                    </Text>
                    <Text style={styles.modalOptionDesc}>
                      표준 해상도로 빠르게 저장합니다.
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalOptionBtn, styles.modalOptionBtnPrimary]}
                  onPress={() => {
                    setShowSaveModal(false);
                    if (Platform.OS === "web") {
                      processExport(true);
                    } else if (rewardedLoaded) {
                      // Original Ad logic for native platforms
                      let rewarded = false;
                      const unsubEarned = rewardedAd.addAdEventListener(
                        RewardedAdEventType.EARNED_REWARD,
                        () => {
                          rewarded = true;
                        },
                      );
                      const unsubClosed = rewardedAd.addAdEventListener(
                        AdEventType.CLOSED,
                        () => {
                          unsubEarned();
                          unsubClosed();
                          rewardedAd.load();
                          if (rewarded) processExport(true);
                        },
                      );
                      rewardedAd.show();
                    } else {
                      Alert.alert("알림", "광고를 불러오는 중입니다.");
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.optionIcon,
                      { backgroundColor: "rgba(52, 199, 89, 0.2)" },
                    ]}
                  >
                    <Ionicons name="sparkles" size={24} color="#34C759" />
                  </View>
                  <View style={styles.optionInfo}>
                    <Text
                      style={[styles.modalOptionTitle, { color: "#34C759" }]}
                    >
                      👑 {t("highQuality")}
                    </Text>
                    <Text style={styles.modalOptionDesc}>
                      {t("highQualityDesc")}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowSaveModal(false)}
              >
                <Text style={styles.modalCancelText}>{t("cancel")}</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </View>
      )}
      {/* SVG Filters for Web Adjustments */}
      {Platform.OS === "web" && (
        <View
          style={{ position: "absolute", width: 0, height: 0, opacity: 0 }}
          pointerEvents="none"
        >
          {/* We can define custom feComponentTransfer or feColorMatrix here if needed for highlights/shadows */}
          <svg width="0" height="0">
            <defs>
              <filter id="adjust-sharpness">
                <feConvolveMatrix
                  order="3"
                  kernelMatrix={`0 -${sharpness + Math.abs(definition) * 0.5} 0 -${sharpness + Math.abs(definition) * 0.5} ${1 + 4 * (sharpness + Math.abs(definition) * 0.5)} -${sharpness + Math.abs(definition) * 0.5} 0 -${sharpness + Math.abs(definition) * 0.5} 0`}
                  preserveAlpha="true"
                />
              </filter>
              <filter id="adjust-hi-sh">
                <feComponentTransfer>
                  {/* Highlights Adjustment */}
                  <feFuncR
                    type="gamma"
                    exponent={
                      highlights > 0 ? 1 - highlights * 0.5 : 1 - highlights
                    }
                  />
                  <feFuncG
                    type="gamma"
                    exponent={
                      highlights > 0 ? 1 - highlights * 0.5 : 1 - highlights
                    }
                  />
                  <feFuncB
                    type="gamma"
                    exponent={
                      highlights > 0 ? 1 - highlights * 0.5 : 1 - highlights
                    }
                  />
                </feComponentTransfer>
                <feComponentTransfer>
                  {/* Shadows Adjustment */}
                  <feFuncR
                    type="linear"
                    slope={1 + shadows * 0.5}
                    intercept={shadows * 0.1}
                  />
                  <feFuncG
                    type="linear"
                    slope={1 + shadows * 0.5}
                    intercept={shadows * 0.1}
                  />
                  <feFuncB
                    type="linear"
                    slope={1 + shadows * 0.5}
                    intercept={shadows * 0.1}
                  />
                </feComponentTransfer>
              </filter>
            </defs>
          </svg>
        </View>
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === "ios" ? 56 : 20,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.dark.background,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.dark.surfaceLight,
  },
  headerBtnText: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: "600",
  },
  headerTitle: {
    color: Colors.dark.text,
    fontSize: 17,
    fontWeight: "700",
  },
  exportBtn: {
    backgroundColor: Colors.dark.accent,
    paddingHorizontal: Spacing.md,
    width: "auto",
    minWidth: 60,
  },
  exportBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  previewContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },
  imageClipContainer: {
    position: "relative",
    overflow: "hidden",
  },
  imageWrapper: {
    position: "relative",
  },
  previewImage: {
    backgroundColor: "#111",
  },
  zoomIndicator: {
    position: "absolute",
    top: 12,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  zoomText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  zoomResetBtn: {
    backgroundColor: Colors.dark.accent,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  zoomResetText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  toolPanel: {
    backgroundColor: Colors.dark.surface,
    paddingBottom:
      Platform.OS === "ios"
        ? SCREEN_HEIGHT < 700
          ? 10
          : 20
        : SCREEN_HEIGHT < 700
          ? 10
          : 0,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  tabContentContainer: {
    minHeight: SCREEN_HEIGHT < 700 ? 100 : 120,
    justifyContent: "flex-end",
  },
  tabContent: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 20,
  },
  tabContentCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomTabBar: {
    flexDirection: "row",
    height: SCREEN_HEIGHT < 700 ? 54 : 64,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
    backgroundColor: Colors.dark.surface,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    fontWeight: "500",
  },
  tabLabelActive: {
    color: Colors.dark.accent,
    fontWeight: "700",
  },
  activeDot: {
    position: "absolute",
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.dark.accent,
  },
  cropSubTabBar: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
    marginBottom: 12,
  },
  cropSubTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: "transparent",
  },
  cropSubTabActive: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  cropSubTabText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.dark.textSecondary,
  },
  cropSubTabTextActive: {
    color: Colors.dark.accentLight,
  },
  cropActionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
  },
  sliderSection: {
    paddingHorizontal: 32,
    alignItems: "center",
    paddingBottom: 8,
  },
  sliderHeader: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  cropActionGroup: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: Colors.dark.surfaceLight,
  },
  resetContainer: {},
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  resetText: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  bgPalette: {
    flexDirection: "row",
    gap: 12,
  },
  paletteCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "transparent",
  },
  paletteCircleActive: {
    borderColor: Colors.dark.accent,
  },
  // Export done screen
  doneContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  doneIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.dark.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  doneEmoji: {
    fontSize: 36,
  },
  doneTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.dark.text,
    marginBottom: Spacing.sm,
  },
  doneSubtitle: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.xl,
  },
  doneActions: {
    flexDirection: "row",
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
    fontWeight: "600",
  },
  doneButtonPrimary: {
    backgroundColor: Colors.dark.accent,
    borderColor: Colors.dark.accent,
  },
  doneButtonPrimaryText: {
    color: "#fff",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  modalContent: {
    width: SCREEN_WIDTH - 32,
    backgroundColor: "#1C1C1E",
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  modalHeader: {
    marginBottom: 24,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFF",
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  modalOptions: {
    gap: 12,
    marginBottom: 16,
  },
  modalOptionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 16,
    borderRadius: 18,
    gap: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },
  modalOptionBtnPrimary: {
    borderColor: "rgba(52, 199, 89, 0.3)",
    backgroundColor: "rgba(52, 199, 89, 0.05)",
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  optionInfo: {
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 2,
  },
  modalOptionDesc: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  modalCancelBtn: {
    paddingVertical: 12,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 15,
    color: Colors.dark.textSecondary,
    fontWeight: "600",
  },
});
