import { buildRackLayout } from './rack.geometry';
import { PILLARS } from '../../../data/pillars.data';

describe('buildRackLayout', () => {
  it('has one slot per pillar plus one empty slot', () => {
    const { slots } = buildRackLayout();
    expect(slots.length).toBe(PILLARS.length + 1);
  });

  it('fills the slots with the pillars in PILLARS order, top to bottom', () => {
    const { slots } = buildRackLayout();
    const filled = slots.filter((s) => s.slug !== null);
    expect(filled.map((s) => s.slug)).toEqual(PILLARS.map((p) => p.slug));
    // Top to bottom means descending y.
    const ys = filled.map((s) => s.y);
    expect([...ys].sort((a, b) => b - a)).toEqual(ys);
  });

  it('puts the one empty slot at the bottom', () => {
    const { slots } = buildRackLayout();
    const empty = slots.filter((s) => s.slug === null);
    expect(empty.length).toBe(1);
    const lowestFilled = Math.min(...slots.filter((s) => s.slug !== null).map((s) => s.y));
    expect(empty[0].y).toBeLessThan(lowestFilled);
  });

  it('never overlaps two slots', () => {
    const { slots } = buildRackLayout();
    const sorted = [...slots].sort((a, b) => a.y - b.y);
    for (let i = 1; i < sorted.length; i++) {
      const gap = (sorted[i].y - sorted[i].height / 2) - (sorted[i - 1].y + sorted[i - 1].height / 2);
      expect(gap).toBeGreaterThanOrEqual(0);
    }
  });

  it('keeps every slot inside the rack body', () => {
    const { slots, height } = buildRackLayout();
    for (const s of slots) {
      expect(s.y - s.height / 2).toBeGreaterThanOrEqual(0);
      expect(s.y + s.height / 2).toBeLessThanOrEqual(height);
    }
  });
});
