import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import ValueSlider from './value-slider';
import { Colors, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/context/language-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  brightness: number;
  setBrightness: (v: number) => void;
  contrast: number;
  setContrast: (v: number) => void;
  saturation: number;
  setSaturation: (v: number) => void;
  warmth: number;
  setWarmth: (v: number) => void;
  vignette: number;
  setVignette: (v: number) => void;
  exposure: number;
  setExposure: (v: number) => void;
  brilliance: number;
  setBrilliance: (v: number) => void;
  highlights: number;
  setHighlights: (v: number) => void;
  shadows: number;
  setShadows: (v: number) => void;
  tint: number;
  setTint: (v: number) => void;
  sharpness: number;
  setSharpness: (v: number) => void;
  vibrance: number;
  setVibrance: (v: number) => void;
  definition: number;
  setDefinition: (v: number) => void;
  blackPoint: number;
  setBlackPoint: (v: number) => void;
}

export default function AdjustPanel({ 
  brightness, setBrightness, 
  contrast, setContrast, 
  saturation, setSaturation, 
  warmth, setWarmth, 
  vignette, setVignette,
  exposure, setExposure,
  brilliance, setBrilliance,
  highlights, setHighlights,
  shadows, setShadows,
  tint, setTint,
  sharpness, setSharpness,
  vibrance, setVibrance,
  definition, setDefinition,
  blackPoint, setBlackPoint
}: Props) {
  const { t } = useLanguage();

  const allTools = [
    { id: 'exposure', label: t('exposure'), icon: 'sunny', min: 0, max: 2, def: 1 },
    { id: 'brilliance', label: t('brilliance'), icon: 'sparkles', min: -1, max: 1, def: 0 },
    { id: 'highlights', label: t('highlights'), icon: 'triangle', min: -1, max: 1, def: 0 },
    { id: 'shadows', label: t('shadows'), icon: 'triangle-outline', min: -1, max: 1, def: 0 },
    { id: 'contrast', label: t('contrast'), icon: 'contrast', min: 0, max: 2, def: 1 },
    { id: 'brightness', label: t('brightness'), icon: 'sunny-outline', min: 0, max: 2, def: 1 },
    { id: 'blackPoint', label: t('blackPoint'), icon: 'radio-button-off', min: 0, max: 2, def: 1 },
    { id: 'saturation', label: t('saturation'), icon: 'color-palette', min: 0, max: 2, def: 1 },
    { id: 'vibrance', label: t('vibrance'), icon: 'flash', min: 0, max: 2, def: 1 },
    { id: 'warmth', label: t('warmth'), icon: 'thermometer', min: 0, max: 2, def: 1 },
    { id: 'tint', label: t('tint'), icon: 'color-fill', min: -1, max: 1, def: 0 },
    { id: 'sharpness', label: t('sharpness'), icon: 'shutter', min: 0, max: 1, def: 0 },
    { id: 'definition', label: t('definition'), icon: 'layers', min: -1, max: 1, def: 0 },
    { id: 'vignette', label: t('vignette'), icon: 'scan-circle', min: 0, max: 1, def: 0 },
  ] as const;

  const [activeTool, setActiveTool] = useState<typeof allTools[number]['id']>('exposure');

  const currentConfig = allTools.find(t => t.id === activeTool)!;

  const currentValue = 
    activeTool === 'exposure' ? exposure :
    activeTool === 'brightness' ? brightness :
    activeTool === 'brilliance' ? brilliance :
    activeTool === 'highlights' ? highlights :
    activeTool === 'shadows' ? shadows :
    activeTool === 'contrast' ? contrast :
    activeTool === 'saturation' ? saturation :
    activeTool === 'vibrance' ? vibrance :
    activeTool === 'warmth' ? warmth :
    activeTool === 'tint' ? tint :
    activeTool === 'sharpness' ? sharpness : 
    activeTool === 'definition' ? definition :
    activeTool === 'blackPoint' ? blackPoint : vignette;
  
  const onChange = (v: number) => {
    if (activeTool === 'exposure') setExposure(v);
    else if (activeTool === 'brightness') setBrightness(v);
    else if (activeTool === 'brilliance') setBrilliance(v);
    else if (activeTool === 'highlights') setHighlights(v);
    else if (activeTool === 'shadows') setShadows(v);
    else if (activeTool === 'contrast') setContrast(v);
    else if (activeTool === 'saturation') setSaturation(v);
    else if (activeTool === 'vibrance') setVibrance(v);
    else if (activeTool === 'warmth') setWarmth(v);
    else if (activeTool === 'tint') setTint(v);
    else if (activeTool === 'sharpness') setSharpness(v);
    else if (activeTool === 'definition') setDefinition(v);
    else if (activeTool === 'blackPoint') setBlackPoint(v);
    else setVignette(v);
  };

  const subTabs = allTools.map(t => ({ id: t.id, label: t.label }));

  return (
    <View style={styles.container}>
      {/* Sub-tab Selector */}
      <View style={styles.subTabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subTabScroll}>
          {subTabs.map(tab => (
            <TouchableOpacity 
              key={tab.id}
              onPress={() => {
                import('expo-haptics').then(H => H.selectionAsync());
                setActiveTool(tab.id as any);
              }}
              style={[styles.subTab, activeTool === tab.id && styles.subTabActive]}
            >
              <Text style={[styles.subTabText, activeTool === tab.id && styles.subTabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.sliderSection}>
        <View style={styles.sliderHeader}>
          <Text style={styles.sliderLabel}>{currentConfig.label}</Text>
          <View style={styles.resetContainer}>
            <TouchableOpacity 
              onPress={() => {
                if (currentValue === currentConfig.def) return;
                import('expo-haptics').then(Haptics => Haptics.selectionAsync());
                onChange(currentConfig.def);
              }}
              activeOpacity={0.7} 
              style={[styles.resetBtn, currentValue === currentConfig.def && { opacity: 0.5 }]}
            >
              <Ionicons name="refresh" size={12} color={Colors.dark.textSecondary} />
              <Text style={styles.resetText}>{t('reset')}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <ValueSlider
          value={currentValue}
          min={currentConfig.min}
          max={currentConfig.max}
          onChange={onChange}
          width={SCREEN_WIDTH - 64}
          formatLabel={(v) => {
            if (activeTool === 'vignette' || activeTool === 'sharpness' || activeTool === 'brilliance' || activeTool === 'highlights' || activeTool === 'shadows' || activeTool === 'tint' || activeTool === 'definition') {
              const val = Math.round(v * 100);
              return val > 0 ? `+${val}` : val.toString();
            }
            const val = Math.round((v - 1) * 100);
            return val > 0 ? `+${val}` : val.toString();
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 20,
  },
  subTabBar: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    marginBottom: 12,
  },
  subTabScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  subTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: 'transparent',
  },
  subTabActive: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  subTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
  },
  subTabTextActive: {
    color: Colors.dark.accentLight,
  },
  sliderSection: {
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  sliderHeader: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 24,
  },
  sliderLabel: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '700',
  },
  resetContainer: {
    position: 'absolute',
    right: 0,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resetText: {
    color: Colors.dark.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
});
