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
}

export default function AdjustPanel({ 
  brightness, setBrightness, 
  contrast, setContrast, 
  saturation, setSaturation, 
  warmth, setWarmth, 
  vignette, setVignette 
}: Props) {
  const { t } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<'light' | 'color' | 'fx'>('light');
  const [activeTool, setActiveTool] = useState<'brightness'|'contrast'|'saturation'|'warmth'|'vignette'>('brightness');

  const allTools = [
    { id: 'brightness', label: t('brightness'), icon: 'sunny', min: 0, max: 2, def: 1, category: 'light' },
    { id: 'contrast', label: t('contrast'), icon: 'contrast', min: 0, max: 2, def: 1, category: 'light' },
    { id: 'saturation', label: t('saturation'), icon: 'water', min: 0, max: 2, def: 1, category: 'color' },
    { id: 'warmth', label: t('warmth'), icon: 'thermometer', min: 0, max: 2, def: 1, category: 'color' },
    { id: 'vignette', label: t('vignette'), icon: 'scan-circle', min: 0, max: 1, def: 0, category: 'fx' },
  ] as const;

  const currentTools = allTools.filter(t => t.category === activeSubTab);
  
  // Ensure the active tool is always one of the current sub-tab's tools
  React.useEffect(() => {
    if (!currentTools.find(t => t.id === activeTool)) {
      setActiveTool(currentTools[0].id as any);
    }
  }, [activeSubTab]);

  const currentConfig = allTools.find(t => t.id === activeTool)!;

  const currentValue = activeTool === 'brightness' ? brightness :
                       activeTool === 'contrast' ? contrast :
                       activeTool === 'saturation' ? saturation :
                       activeTool === 'warmth' ? warmth : vignette;
  
  const onChange = (v: number) => {
    if (activeTool === 'brightness') setBrightness(v);
    else if (activeTool === 'contrast') setContrast(v);
    else if (activeTool === 'saturation') setSaturation(v);
    else if (activeTool === 'warmth') setWarmth(v);
    else setVignette(v);
  };

  const subTabs = [
    { id: 'light', label: t('light') },
    { id: 'color', label: t('color') },
    { id: 'fx', label: t('fx') },
  ] as const;

  return (
    <View style={styles.container}>
      {/* Sub-tab Selector */}
      <View style={styles.subTabBar}>
        {subTabs.map(tab => (
          <TouchableOpacity 
            key={tab.id}
            onPress={() => {
              import('expo-haptics').then(H => H.selectionAsync());
              setActiveSubTab(tab.id);
            }}
            style={[styles.subTab, activeSubTab === tab.id && styles.subTabActive]}
          >
            <Text style={[styles.subTabText, activeSubTab === tab.id && styles.subTabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
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
            if (activeTool === 'vignette') return Math.round(v * 100).toString();
            const val = Math.round((v - 1) * 100);
            return val > 0 ? `+${val}` : val.toString();
          }}
        />
      </View>

      <View style={styles.toolsRow}>
        <View style={styles.toolsRowContent}>
          {currentTools.map(tool => (
            <TouchableOpacity 
              key={tool.id} 
              style={[styles.toolBtn, activeTool === tool.id && styles.toolBtnActive]}
              onPress={() => {
                import('expo-haptics').then(Haptics => Haptics.selectionAsync());
                setActiveTool(tool.id as any);
              }}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={tool.icon as any} 
                size={26} 
                color={activeTool === tool.id ? Colors.dark.text : Colors.dark.textSecondary} 
              />
              <Text style={[styles.toolLabel, activeTool === tool.id && styles.toolLabelActive]}>{tool.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 20,
    paddingTop: 8,
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
    marginBottom: 16,
  },
  subTabBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    marginBottom: 8,
  },
  subTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
    marginHorizontal: 4,
  },
  subTabActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  subTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
  },
  subTabTextActive: {
    color: Colors.dark.accentLight,
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
  toolsRow: {
    width: '100%',
  },
  toolsRowContent: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 8,
  },
  toolBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    width: 72,
    gap: 8,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  toolBtnActive: {
    backgroundColor: Colors.dark.surfaceLight,
  },
  toolLabel: {
    color: Colors.dark.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  toolLabelActive: {
    color: Colors.dark.text,
  },
});
