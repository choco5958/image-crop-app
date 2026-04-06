import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_ADJUSTMENTS,
  applyFilterPreset,
  buildBaseWebFilter,
} from "../utils/editor-helpers.js";

test("buildBaseWebFilter returns stable CSS filter string", () => {
  const filter = buildBaseWebFilter({
    ...DEFAULT_ADJUSTMENTS,
    brightness: 1.2,
    exposure: 1.1,
    blackPoint: 0.9,
    contrast: 1.3,
    saturation: 0.8,
    vibrance: 1.25,
    tint: 0.5,
  });

  assert.equal(
    filter,
    "brightness(1.1880000000000002) contrast(1.3) saturate(1) hue-rotate(22.5deg)",
  );
});

test("applyFilterPreset maps all supported adjustment keys", () => {
  const next = applyFilterPreset(DEFAULT_ADJUSTMENTS, {
    brightness: 0.95,
    contrast: 1.4,
    saturation: 1.2,
    exposure: 1.1,
    brilliance: 0.3,
    highlights: -0.2,
    shadows: 0.4,
    warmth: 1.05,
    tint: -0.1,
    vignette: 0.2,
    sharpness: 0.5,
    vibrance: 1.3,
    definition: 0.25,
    blackPoint: 0.85,
  });

  assert.equal(next.contrast, 1.4);
  assert.equal(next.vignette, 0.2);
  assert.equal(next.blackPoint, 0.85);
  assert.equal(next.definition, 0.25);
});
