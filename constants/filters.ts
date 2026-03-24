export interface FilterPreset {
  id: string;
  name: string;
  nameKo: string;
  /** RGBA overlay color */
  overlay: string;
  /** 0-1 overlay opacity */
  overlayOpacity: number;
  /** brightness multiplier: 1 = normal */
  brightness: number;
  /** contrast multiplier: 1 = normal */
  contrast: number;
  /** saturation multiplier: 1 = normal, 0 = grayscale */
  saturation: number;
}

export interface FilterCategory {
  id: string;
  name: string;
  nameKo: string;
  icon: string;
  filters: FilterPreset[];
}

export const FILTER_CATEGORIES: FilterCategory[] = [
  {
    id: 'basic',
    name: 'Basic',
    nameKo: '기본',
    icon: '✨',
    filters: [
      {
        id: 'original',
        name: 'Original',
        nameKo: '원본',
        overlay: 'transparent',
        overlayOpacity: 0,
        brightness: 1,
        contrast: 1,
        saturation: 1,
      },
      {
        id: 'vivid',
        name: 'Vivid',
        nameKo: '비비드',
        overlay: 'rgba(255, 100, 50, 0.08)',
        overlayOpacity: 0.08,
        brightness: 1.1,
        contrast: 1.2,
        saturation: 1.4,
      },
      {
        id: 'soft',
        name: 'Soft',
        nameKo: '소프트',
        overlay: 'rgba(255, 230, 220, 0.1)',
        overlayOpacity: 0.1,
        brightness: 1.08,
        contrast: 0.9,
        saturation: 0.9,
      },
      {
        id: 'sharp',
        name: 'Sharp',
        nameKo: '선명한',
        overlay: 'transparent',
        overlayOpacity: 0,
        brightness: 1.02,
        contrast: 1.35,
        saturation: 1.15,
      },
    ],
  },
  {
    id: 'mood',
    name: 'Mood',
    nameKo: '무드',
    icon: '🌙',
    filters: [
      {
        id: 'warm',
        name: 'Warm',
        nameKo: '따뜻한',
        overlay: 'rgba(255, 165, 0, 0.15)',
        overlayOpacity: 0.15,
        brightness: 1.05,
        contrast: 1.0,
        saturation: 1.1,
      },
      {
        id: 'cool',
        name: 'Cool',
        nameKo: '쿨톤',
        overlay: 'rgba(0, 120, 255, 0.12)',
        overlayOpacity: 0.12,
        brightness: 1.0,
        contrast: 1.05,
        saturation: 0.95,
      },
      {
        id: 'dreamy',
        name: 'Dreamy',
        nameKo: '몽환',
        overlay: 'rgba(200, 150, 255, 0.15)',
        overlayOpacity: 0.15,
        brightness: 1.1,
        contrast: 0.85,
        saturation: 0.85,
      },
      {
        id: 'cozy',
        name: 'Cozy',
        nameKo: '아늑한',
        overlay: 'rgba(180, 120, 60, 0.12)',
        overlayOpacity: 0.12,
        brightness: 1.02,
        contrast: 0.95,
        saturation: 1.05,
      },
    ],
  },
  {
    id: 'nature',
    name: 'Nature',
    nameKo: '자연',
    icon: '🌿',
    filters: [
      {
        id: 'sunset',
        name: 'Sunset',
        nameKo: '석양',
        overlay: 'rgba(255, 100, 50, 0.18)',
        overlayOpacity: 0.18,
        brightness: 1.05,
        contrast: 1.1,
        saturation: 1.2,
      },
      {
        id: 'ocean',
        name: 'Ocean',
        nameKo: '바다',
        overlay: 'rgba(0, 200, 200, 0.12)',
        overlayOpacity: 0.12,
        brightness: 1.0,
        contrast: 1.05,
        saturation: 1.1,
      },
      {
        id: 'forest',
        name: 'Forest',
        nameKo: '숲',
        overlay: 'rgba(34, 139, 34, 0.12)',
        overlayOpacity: 0.12,
        brightness: 0.95,
        contrast: 1.1,
        saturation: 1.15,
      },
      {
        id: 'spring',
        name: 'Spring',
        nameKo: '봄',
        overlay: 'rgba(255, 200, 220, 0.1)',
        overlayOpacity: 0.1,
        brightness: 1.08,
        contrast: 0.95,
        saturation: 1.2,
      },
      {
        id: 'autumn',
        name: 'Autumn',
        nameKo: '가을',
        overlay: 'rgba(200, 120, 40, 0.15)',
        overlayOpacity: 0.15,
        brightness: 0.98,
        contrast: 1.1,
        saturation: 1.1,
      },
    ],
  },
  {
    id: 'retro',
    name: 'Retro',
    nameKo: '레트로',
    icon: '📷',
    filters: [
      {
        id: 'vintage',
        name: 'Vintage',
        nameKo: '빈티지',
        overlay: 'rgba(200, 160, 90, 0.2)',
        overlayOpacity: 0.2,
        brightness: 0.95,
        contrast: 0.9,
        saturation: 0.7,
      },
      {
        id: 'film',
        name: 'Film',
        nameKo: '필름',
        overlay: 'rgba(80, 100, 80, 0.1)',
        overlayOpacity: 0.1,
        brightness: 0.98,
        contrast: 1.15,
        saturation: 0.85,
      },
      {
        id: 'polaroid',
        name: 'Polaroid',
        nameKo: '폴라로이드',
        overlay: 'rgba(255, 240, 200, 0.15)',
        overlayOpacity: 0.15,
        brightness: 1.05,
        contrast: 0.9,
        saturation: 0.8,
      },
      {
        id: 'sepia',
        name: 'Sepia',
        nameKo: '세피아',
        overlay: 'rgba(180, 130, 70, 0.25)',
        overlayOpacity: 0.25,
        brightness: 0.95,
        contrast: 1.0,
        saturation: 0.4,
      },
    ],
  },
  {
    id: 'bnw',
    name: 'B&W',
    nameKo: '흑백',
    icon: '⚫',
    filters: [
      {
        id: 'bw',
        name: 'B&W',
        nameKo: '흑백',
        overlay: 'transparent',
        overlayOpacity: 0,
        brightness: 1.05,
        contrast: 1.2,
        saturation: 0,
      },
      {
        id: 'noir',
        name: 'Noir',
        nameKo: '느와르',
        overlay: 'rgba(0, 0, 30, 0.15)',
        overlayOpacity: 0.15,
        brightness: 0.85,
        contrast: 1.4,
        saturation: 0.3,
      },
      {
        id: 'silver',
        name: 'Silver',
        nameKo: '실버',
        overlay: 'rgba(180, 190, 200, 0.08)',
        overlayOpacity: 0.08,
        brightness: 1.1,
        contrast: 1.1,
        saturation: 0.1,
      },
      {
        id: 'ink',
        name: 'Ink',
        nameKo: '잉크',
        overlay: 'rgba(10, 10, 30, 0.12)',
        overlayOpacity: 0.12,
        brightness: 0.9,
        contrast: 1.6,
        saturation: 0,
      },
    ],
  },
];

// Flat list of all filters (for compatibility)
export const FILTERS: FilterPreset[] = FILTER_CATEGORIES.flatMap((cat) => cat.filters);

export const ASPECT_RATIOS = [
  { id: 'free', label: 'Free', labelKo: '자유', ratio: null },
  { id: '1:1', label: '1:1', labelKo: '1:1', ratio: 1 },
  { id: '9:16', label: '9:16', labelKo: '9:16', ratio: 9 / 16 },
  { id: '16:9', label: '16:9', labelKo: '16:9', ratio: 16 / 9 },
  { id: '4:5', label: '4:5', labelKo: '4:5', ratio: 4 / 5 },
  { id: '3:4', label: '3:4', labelKo: '3:4', ratio: 3 / 4 },
  { id: '4:3', label: '4:3', labelKo: '4:3', ratio: 4 / 3 },
];
