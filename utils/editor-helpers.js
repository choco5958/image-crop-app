const DEFAULT_ADJUSTMENTS = Object.freeze({
  brightness: 1,
  contrast: 1,
  saturation: 1,
  warmth: 1,
  vignette: 0,
  exposure: 1,
  brilliance: 0,
  highlights: 0,
  shadows: 0,
  tint: 0,
  sharpness: 0,
  vibrance: 1,
  definition: 0,
  blackPoint: 1,
});

function buildBaseWebFilter(adjustments) {
  return `brightness(${adjustments.brightness * adjustments.exposure * adjustments.blackPoint}) contrast(${adjustments.contrast}) saturate(${adjustments.saturation * adjustments.vibrance}) hue-rotate(${adjustments.tint * 45}deg)`;
}

function applyFilterPreset(adjustments, preset) {
  return {
    ...adjustments,
    brightness: preset.brightness,
    contrast: preset.contrast,
    saturation: preset.saturation,
    exposure: preset.exposure,
    brilliance: preset.brilliance,
    highlights: preset.highlights,
    shadows: preset.shadows,
    warmth: preset.warmth,
    tint: preset.tint,
    vignette: preset.vignette,
    sharpness: preset.sharpness,
    vibrance: preset.vibrance || 1,
    definition: preset.definition || 0,
    blackPoint: preset.blackPoint || 1,
  };
}

module.exports = {
  DEFAULT_ADJUSTMENTS,
  buildBaseWebFilter,
  applyFilterPreset,
};
