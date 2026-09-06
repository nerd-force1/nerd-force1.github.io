import { PILLARS } from '../../../data/pillars.data';
import type { PillarSlug } from '../../../data/pillars.data';

/** One mounted unit. `slug: null` is the deliberate empty slot at the bottom. */
export interface SlotBox {
  readonly slug: PillarSlug | null;
  /** Slot centre, in local units, measured up from the rack floor. */
  readonly y: number;
  readonly height: number;
}

export interface RackLayout {
  readonly width: number;
  readonly height: number;
  readonly depth: number;
  readonly slots: SlotBox[];
}

/** Slots in the cabinet: one per pillar, plus one left empty. */
export const RACK_UNITS = PILLARS.length + 1;
export const SLOT_GAP = 0.06;
const SLOT_HEIGHT = 0.5;
const RACK_WIDTH = 2.2;
const RACK_DEPTH = 1.6;
const FRAME_PAD = 0.12;

/**
 * The rack as data, before any of it becomes a mesh.
 *
 * Separated from rack-scene.ts because this arithmetic is the only part of the scene jsdom can
 * check: vitest does no layout and no WebGL, so a mesh's real position is unverifiable here
 * (#74). Stacking, overlap and containment are ordinary numbers, so they live where tests reach.
 *
 * Slot order follows PILLARS and reads top-to-bottom — descending y — because that is the order
 * the cards are written in the DOM, and a rack whose nodes run the other way to the card column
 * would make every lead line cross.
 *
 * The empty slot at the bottom is content, not spare geometry. A rack with room left in it says
 * "we scale with you" without a line of copy, and it is the most honest home the `custom` pillar
 * could have. Do not fill it to use up the space.
 */
export function buildRackLayout(): RackLayout {
  const height = RACK_UNITS * SLOT_HEIGHT + (RACK_UNITS + 1) * SLOT_GAP + FRAME_PAD * 2;

  // Top slot first: start at the top of the usable interior and walk down.
  const top = height - FRAME_PAD - SLOT_GAP - SLOT_HEIGHT / 2;
  const step = SLOT_HEIGHT + SLOT_GAP;

  const slots: SlotBox[] = PILLARS.map((p, i) => ({
    slug: p.slug,
    y: top - i * step,
    height: SLOT_HEIGHT,
  }));
  slots.push({ slug: null, y: top - PILLARS.length * step, height: SLOT_HEIGHT });

  return { width: RACK_WIDTH, height, depth: RACK_DEPTH, slots };
}
