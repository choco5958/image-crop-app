import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useLanguage, Language } from '@/context/language-context';
import * as WebBrowser from 'expo-web-browser';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function SettingsScreen() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();

  const openPolicy = async (type: 'privacy' | 'terms') => {
    const url = type === 'privacy' 
      ? 'https://example.com/privacy' 
      : 'https://example.com/terms';
    await WebBrowser.openBrowserAsync(url);
  };

  const languages: { id: Language; label: string; flag: string }[] = [
    { id: 'ko', label: '한국어', flag: '🇰🇷' },
    { id: 'en', label: 'English', flag: '🇺🇸' },
    { id: 'ja', label: '日本語', flag: '🇯🇵' },
    { id: 'zh', label: '简体中文', flag: '🇨🇳' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Language Section */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.section}>
          <Text style={styles.sectionTitle}>{t('language')}</Text>
          <View style={styles.sectionCard}>
            {languages.map((lang, index) => (
              <TouchableOpacity
                key={lang.id}
                style={[
                  styles.menuItem,
                  index === languages.length - 1 && { borderBottomWidth: 0 }
                ]}
                onPress={() => setLanguage(lang.id)}
              >
                <View style={styles.menuItemLeft}>
                  <Text style={styles.flag}>{lang.flag}</Text>
                  <Text style={styles.menuItemText}>{lang.label}</Text>
                </View>
                {language === lang.id && (
                  <Ionicons name="checkmark-circle" size={22} color={Colors.dark.accent} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Policy Section */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
          <Text style={styles.sectionTitle}>Policy & Terms</Text>
          <View style={styles.sectionCard}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => openPolicy('privacy')}
            >
              <Text style={styles.menuItemText}>{t('privacyPolicy')}</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.dark.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.menuItem, { borderBottomWidth: 0 }]}
              onPress={() => openPolicy('terms')}
            >
              <Text style={styles.menuItemText}>{t('termsOfService')}</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.dark.textMuted} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Info Section */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>App Info</Text>
          <View style={styles.sectionCard}>
            <View style={[styles.menuItem, { borderBottomWidth: 0 }]}>
              <Text style={styles.menuItemText}>{t('version')}</Text>
              <Text style={styles.versionValue}>1.0.0</Text>
            </View>
          </View>
        </Animated.View>

        <Text style={styles.copyright}>© 2026 CropLab. All rights reserved.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#0A0A0F',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark.textMuted,
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flag: {
    fontSize: 20,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFF',
  },
  versionValue: {
    fontSize: 14,
    color: Colors.dark.textMuted,
  },
  copyright: {
    textAlign: 'center',
    color: Colors.dark.textMuted,
    fontSize: 12,
    marginTop: 40,
  },
});
