import { pinProgress } from './journey.progress';

describe('pinProgress', () => {
  // A 2000px section pinned in an 800px viewport travels 2000-800 = 1200px.
  const H = 2000, VP = 800;

  it('is 0 before the section reaches the top of the viewport', () => {
    expect(pinProgress(500, H, VP)).toBe(0);
    expect(pinProgress(1, H, VP)).toBe(0);
  });

  it('is 0 exactly as the section lands at the top', () => {
    expect(pinProgress(0, H, VP)).toBe(0);
  });

  it('is 0.5 at the midpoint of the pinned travel', () => {
    expect(pinProgress(-600, H, VP)).toBeCloseTo(0.5, 5);
  });

  it('is 1 at the end of the pinned travel', () => {
    expect(pinProgress(-1200, H, VP)).toBe(1);
  });

  it('clamps to 1 once scrolled beyond the section', () => {
    expect(pinProgress(-5000, H, VP)).toBe(1);
  });

  it('returns 1 when the section is not taller than the viewport (no travel to divide by)', () => {
    // Guards a division by zero: an 800px section in an 800px viewport has 0 travel.
    expect(pinProgress(0, 800, 800)).toBe(1);
    expect(pinProgress(-10, 600, 800)).toBe(1);
  });
});

import { sceneVisibility } from './journey.progress';

describe('sceneVisibility', () => {
  const H = 2000, VP = 800; // travel = 1200

  it('is 0 while the section is below the fold', () => {
    expect(sceneVisibility(800, H, VP)).toBe(0);
    expect(sceneVisibility(2000, H, VP)).toBe(0);
  });

  it('ramps in as the section top crosses the last 60% of the viewport', () => {
    expect(sceneVisibility(560, H, VP)).toBeCloseTo(0.5, 5); // (800-560)/480
    expect(sceneVisibility(320, H, VP)).toBe(1);
  });

  it('holds 1 for the whole pinned travel', () => {
    expect(sceneVisibility(0, H, VP)).toBe(1);
    expect(sceneVisibility(-600, H, VP)).toBe(1);
    expect(sceneVisibility(-1200, H, VP)).toBe(1);
  });

  it('dims toward 0.4 after the pin releases, and holds there', () => {
    expect(sceneVisibility(-1400, H, VP)).toBeCloseTo(1 - (0.6 * 200) / 400, 5);
    expect(sceneVisibility(-1600, H, VP)).toBeCloseTo(0.4, 5);
    expect(sceneVisibility(-9000, H, VP)).toBeCloseTo(0.4, 5);
  });
});

import { arrivalProgress, heroSceneVisibility } from './journey.progress';

describe('arrivalProgress', () => {
  it('is 0 at the top of the page', () => {
    expect(arrivalProgress(0, 2200)).toBe(0);
  });

  it('is the fraction of the way to the pin', () => {
    expect(arrivalProgress(1100, 1100)).toBeCloseTo(0.5, 5);
    expect(arrivalProgress(550, 1650)).toBeCloseTo(0.25, 5);
  });

  it('is 1 exactly when the section reaches the viewport top, and stays there', () => {
    expect(arrivalProgress(2200, 0)).toBe(1);
    expect(arrivalProgress(3000, -800)).toBe(1);
  });

  it('degenerate document offset never divides by zero', () => {
    expect(arrivalProgress(0, 0)).toBe(1);
  });
});

describe('heroSceneVisibility', () => {
  const H = 2000, VP = 800;

  it('is 1 from scroll zero through the whole approach and pin', () => {
    expect(heroSceneVisibility(2200, H, VP)).toBe(1);
    expect(heroSceneVisibility(400, H, VP)).toBe(1);
    expect(heroSceneVisibility(-1200, H, VP)).toBe(1);
  });

  it('shares sceneVisibility\'s dim tail after the pin releases', () => {
    expect(heroSceneVisibility(-1400, H, VP)).toBeCloseTo(1 - (0.6 * 200) / 400, 5);
    expect(heroSceneVisibility(-9000, H, VP)).toBeCloseTo(0.4, 5);
  });
});
