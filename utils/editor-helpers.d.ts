export type AdjustmentState = {
  brightness: number;
  contrast: number;
  saturation: number;
  warmth: number;
  vignette: number;
  exposure: number;
  brilliance: number;
  highlights: number;
  shadows: number;
  tint: number;
  sharpness: number;
  vibrance: number;
  definition: number;
  blackPoint: number;
};

export const DEFAULT_ADJUSTMENTS: Readonly<AdjustmentState>;
export function buildBaseWebFilter(adjustments: AdjustmentState): string;
export function applyFilterPreset(
  adjustments: AdjustmentState,
  preset: {
    brightness: number;
    contrast: number;
    saturation: number;
    exposure: number;
    brilliance: number;
    highlights: number;
    shadows: number;
    warmth: number;
    tint: number;
    vignette: number;
    sharpness: number;
    vibrance?: number;
    definition?: number;
    blackPoint?: number;
  },
): AdjustmentState;
