import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

export type Language = 'ko' | 'en' | 'ja' | 'zh';

type Translations = {
  [key in Language]: {
    [key: string]: string;
  };
};

const translations: Translations = {
  ko: {
    settings: '설정',
    language: '언어 설정',
    selectLanguage: '언어를 선택하세요',
    privacyPolicy: '개인정보 처리방침',
    termsOfService: '서비스 이용약관',
    version: '버전 정보',
    back: '뒤로',
    save: '저장',
    cancel: '취소',
    all: '전체',
    pickGallery: '갤러리에서 선택',
    takePhoto: '카메라 촬영',
    appSubtitle: '비율 자르기 & 필터 편집기',
    supportRatios: '지원 비율',
    highQuality: '고화질 원본',
    standardQuality: '일반 저장',
    standardQualityDesc: '표준 해상도로 빠르게 저장합니다.',
    highQualityDesc: '최고 화질로 저장합니다. (광고 시청)',
    saveOptions: '저장 옵션',
    saveResolution: '어떤 화질로 저장하시겠어요?',
    saveSuccess: '저장 완료!',
    saveCompleteTitle: '저장 완료!',
    saveCompleteWeb: '이미지가 다운로드되었습니다.',
    saveCompleteNative: '갤러리에 저장되었습니다',
    continueEditing: '계속 편집',
    newPhoto: '새 사진',
    error: '오류',
    notice: '알림',
    saveError: '이미지 저장 중 오류가 발생했습니다.',
    cameraPermissionRequired: '카메라 권한이 필요합니다.',
    adLoading: '광고를 불러오는 중입니다.',
    mediaPermissionDenied: '갤러리 접근 권한이 필요합니다.',
    edit: '편집',
    reset: '초기화',
    crop: '자르기',
    filter: '필터',
    adjust: '보정',
    fitMode: '여백 보이기',
    bgColor: '배경색',
    brightness: '밝기',
    contrast: '대비',
    saturation: '채도',
    warmth: '온도',
    vignette: '비네팅',
    ratio: '비율',
    skew: '기울기',
    light: '밝기',
    color: '색상',
    fx: '효과',
    exposure: '노출',
    brilliance: '휘도',
    highlights: '하이라이트',
    shadows: '그림자',
    tint: '틴트',
    sharpness: '선명도',
    vibrance: '생동감',
    definition: '디피니션',
    blackPoint: '블랙 포인트',
    policyTerms: '정책 및 약관',
    appInfo: '앱 정보',
  },
  en: {
    settings: 'Settings',
    language: 'Language',
    selectLanguage: 'Select a Language',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    version: 'Version',
    back: 'Back',
    save: 'Save',
    cancel: 'Cancel',
    all: 'All',
    pickGallery: 'Choose from Gallery',
    takePhoto: 'Take Photo',
    appSubtitle: 'Aspect Ratio Crop & Filter Editor',
    supportRatios: 'Supported Ratios',
    highQuality: 'High Quality',
    standardQuality: 'Standard Quality',
    standardQualityDesc: 'Quick save at standard resolution.',
    highQualityDesc: 'Save in best quality. (Watch an ad)',
    saveOptions: 'Save Options',
    saveResolution: 'Choose a save quality',
    saveSuccess: 'Saved Successfully!',
    saveCompleteTitle: 'Save Complete!',
    saveCompleteWeb: 'Image downloaded.',
    saveCompleteNative: 'Saved to Gallery',
    continueEditing: 'Continue Editing',
    newPhoto: 'New Photo',
    error: 'Error',
    notice: 'Notice',
    saveError: 'An error occurred while saving.',
    cameraPermissionRequired: 'Camera permission is required.',
    adLoading: 'Loading ad. Please wait.',
    mediaPermissionDenied: 'Gallery permission is required.',
    edit: 'Edit',
    reset: 'Reset',
    crop: 'Crop',
    filter: 'Filter',
    adjust: 'Adjust',
    fitMode: 'Fit Mode',
    bgColor: 'Background',
    brightness: 'Brightness',
    contrast: 'Contrast',
    saturation: 'Saturation',
    warmth: 'Warmth',
    vignette: 'Vignette',
    ratio: 'Ratio',
    skew: 'Rotation',
    light: 'Light',
    color: 'Color',
    fx: 'Effects',
    exposure: 'Exposure',
    brilliance: 'Brilliance',
    highlights: 'Highlights',
    shadows: 'Shadows',
    tint: 'Tint',
    sharpness: 'Sharpness',
    vibrance: 'Vibrance',
    definition: 'Definition',
    blackPoint: 'Black Point',
    policyTerms: 'Policy & Terms',
    appInfo: 'App Info',
  },
  ja: {
    settings: '設定',
    language: '言語設定',
    selectLanguage: '言語を選択してください',
    privacyPolicy: 'プライバシーポリシー',
    termsOfService: '利用規約',
    version: 'バージョン情報',
    back: '戻る',
    save: '保存',
    cancel: 'キャンセル',
    all: 'すべて',
    pickGallery: 'ギャラリーから選択',
    takePhoto: 'カメラで撮影',
    appSubtitle: 'アスペクト比クロップ＆フィルターエディタ',
    supportRatios: 'サポートされている比率',
    highQuality: '高画質保存',
    standardQuality: '標準保存',
    standardQualityDesc: '標準解像度で素早く保存します。',
    highQualityDesc: '最高の画質で保存します。（広告視聴）',
    saveOptions: '保存オプション',
    saveResolution: '保存の画質を選択してください',
    saveSuccess: '保存が完了しました！',
    saveCompleteTitle: '保存完了！',
    saveCompleteWeb: '画像がダウンロードされました',
    saveCompleteNative: 'ギャラリーに保存されました',
    continueEditing: '編集を続ける',
    newPhoto: '新しい写真',
    error: 'エラー',
    notice: 'お知らせ',
    saveError: '保存中にエラーが発生しました。',
    cameraPermissionRequired: 'カメラの権限が必要です。',
    adLoading: '広告を読み込んでいます。しばらくお待ちください。',
    mediaPermissionDenied: 'ギャラリーへのアクセス権限が必要です。',
    edit: '編集',
    reset: 'リセット',
    crop: '切り抜き',
    filter: 'フィルター',
    adjust: '補正',
    fitMode: 'フィットモード',
    bgColor: '背景色',
    brightness: '明るさ',
    contrast: 'コントラスト',
    saturation: '彩度',
    warmth: '暖かさ',
    vignette: '周辺減光',
    ratio: '比率',
    skew: '傾き',
    light: 'ライト',
    color: 'カラー',
    fx: 'エフェクト',
    exposure: '露出',
    brilliance: '輝度',
    highlights: 'ハイライト',
    shadows: 'シャドウ',
    tint: 'ティント',
    sharpness: 'シャープネス',
    vibrance: '自然な彩度',
    definition: '精細度',
    blackPoint: 'ブラックポイント',
    policyTerms: 'ポリシーと規約',
    appInfo: 'アプリ情報',
  },
  zh: {
    settings: '设置',
    language: '语言设置',
    selectLanguage: '请选择语言',
    privacyPolicy: '隐私政策',
    termsOfService: '服务条款',
    version: '版本信息',
    back: '返回',
    save: '保存',
    cancel: '取消',
    all: '全部',
    pickGallery: '从相册选择',
    takePhoto: '拍照',
    appSubtitle: '比例裁剪和滤镜编辑器',
    supportRatios: '支持的比例',
    highQuality: '高清原图',
    standardQuality: '标准保存',
    standardQualityDesc: '以标准分辨率快速保存。',
    highQualityDesc: '以最高画质保存。（观看广告）',
    saveOptions: '保存选项',
    saveResolution: '您想以哪种画质保存？',
    saveSuccess: '保存成功！',
    saveCompleteTitle: '保存成功！',
    saveCompleteWeb: '图片已下载',
    saveCompleteNative: '已保存到相册',
    continueEditing: '继续编辑',
    newPhoto: '新照片',
    error: '错误',
    notice: '提示',
    saveError: '保存图片时发生错误。',
    cameraPermissionRequired: '需要相机权限。',
    adLoading: '正在加载广告，请稍候。',
    mediaPermissionDenied: '需要相册访问权限。',
    edit: '编辑',
    reset: '重置',
    crop: '裁剪',
    filter: '滤镜',
    adjust: '调整',
    fitMode: '适应模式',
    bgColor: '背景颜色',
    brightness: '亮度',
    contrast: '对比度',
    saturation: '饱和度',
    warmth: '色温',
    vignette: '暗角',
    ratio: '比例',
    skew: '角度',
    light: '光感',
    color: '色彩',
    fx: '效果',
    exposure: '曝光',
    brilliance: '光采',
    highlights: '高光',
    shadows: '阴影',
    tint: '色调',
    sharpness: '锐도',
    vibrance: '鲜艳度',
    definition: '清晰度',
    blackPoint: '黑点',
    policyTerms: '政策与条款',
    appInfo: '应用信息',
  },
};

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('ko');

  useEffect(() => {
    if (Platform.OS === 'web') {
      const saved = localStorage.getItem('user-language') as Language;
      if (saved && (saved === 'ko' || saved === 'en' || saved === 'ja' || saved === 'zh')) {
        setLanguageState(saved);
      }
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    if (Platform.OS === 'web') {
      localStorage.setItem('user-language', lang);
    }
  }, []);

  const t = useCallback((key: string) => {
    return translations[language][key] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
