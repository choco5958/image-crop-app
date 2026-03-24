import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import Animated, {
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { BannerAd, BannerAdSize, TestIds } from '@/components/ads';
import { useLanguage } from '@/context/language-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { t } = useLanguage();
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      router.push({
        pathname: '/editor',
        params: {
          uri: result.assets[0].uri,
          imageWidth: result.assets[0].width,
          imageHeight: result.assets[0].height,
        },
      });
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('카메라 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      router.push({
        pathname: '/editor',
        params: {
          uri: result.assets[0].uri,
          imageWidth: result.assets[0].width,
          imageHeight: result.assets[0].height,
        },
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <View style={styles.bgGradient}>
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />
      </View>

      {/* Header with Settings */}
      <View style={styles.header}>
        <View style={{ width: 44 }} />
        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.logoTitleArea}>
          <Text style={styles.headerTitleTiny}>CropLab</Text>
        </Animated.View>
        <TouchableOpacity 
          style={styles.settingsBtn} 
          onPress={() => router.push('/settings')}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={24} color={Colors.dark.text} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.mainContent}>
          {/* Logo Area */}
          <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.logoArea}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoEmoji}>✂️</Text>
            </View>
            <Text style={styles.title}>CropLab</Text>
            <Text style={styles.subtitle}>{t('appSubtitle')}</Text>
          </Animated.View>

          {/* Feature badges */}
          <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.badges}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>📐 {t('crop')}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>🎨 {t('filter')}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>💾 {t('save')}</Text>
            </View>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.actions}>
            <TouchableOpacity style={styles.primaryButton} onPress={pickImage} activeOpacity={0.8}>
              <View style={styles.primaryButtonInner}>
                <Text style={styles.primaryButtonIcon}>🖼️</Text>
                <Text style={styles.primaryButtonText}>{t('pickGallery')}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={takePhoto} activeOpacity={0.8}>
              <Text style={styles.secondaryButtonIcon}>📷</Text>
              <Text style={styles.secondaryButtonText}>{t('takePhoto')}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Footer (inside scroll area for stability) */}
        <Animated.View entering={FadeInDown.delay(800)} style={styles.footer}>
          <Text style={styles.footerText}>
            {t('supportRatios')}: 1:1 · 9:16 · 16:9 · 4:5 · 3:4 · Free
          </Text>
          <View style={styles.adContainer}>
            <BannerAd
              unitId={TestIds.BANNER}
              size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
              requestOptions={{
                requestNonPersonalizedAdsOnly: true,
              }}
            />
          </View>
        </Animated.View>
      </ScrollView>
    </View>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
    width: '100%',
    zIndex: 10,
  },
  logoTitleArea: {
    alignItems: 'center',
  },
  headerTitleTiny: {
    color: Colors.dark.textSecondary,
    fontSize: 15,
    fontWeight: '700',
    opacity: 0.8,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  scrollContent: {
    flexGrow: 1,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  bgGradient: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  bgCircle1: {
    position: 'absolute',
    top: -100,
    right: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(108, 92, 231, 0.08)',
  },
  bgCircle2: {
    position: 'absolute',
    bottom: -60,
    left: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(162, 155, 254, 0.06)',
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.dark.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 32px rgba(108, 92, 231, 0.2)',
      },
      default: {
        shadowColor: Colors.dark.accent,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
      },
    }),
  },
  logoEmoji: {
    fontSize: 36,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.dark.text,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    marginTop: Spacing.xs,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  badge: {
    backgroundColor: Colors.dark.surfaceLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  badgeText: {
    color: Colors.dark.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  actions: {
    width: '100%',
    maxWidth: 340,
    gap: Spacing.md,
  },
  primaryButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.dark.accent,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 20px rgba(108, 92, 231, 0.4)',
      },
      default: {
        shadowColor: Colors.dark.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 6,
      },
    }),
  },
  primaryButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  primaryButtonIcon: {
    fontSize: 20,
  },
  primaryButtonText: {
    color: Colors.dark.white,
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  secondaryButtonIcon: {
    fontSize: 20,
  },
  secondaryButtonText: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    backgroundColor: Colors.dark.background,
  },
  footerText: {
    color: Colors.dark.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
  },
  adContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.surface,
    minHeight: 50,
  },
});
