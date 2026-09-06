import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import type { PillarSlug } from '../data/pillars.data';

/** A node's projected screen position, in CSS pixels relative to the viewport. */
export interface NodeAnchor {
  readonly slug: PillarSlug;
  readonly x: number;
  readonly y: number;
}

export interface JourneyState {
  /** Pinned-section progress, 0→1. */
  progress: number;
  /**
   * How present the scene is, 0→1: 0 above the rack section (the hero must own scroll
   * zero — the scene fighting it is exactly the failure the first cut shipped), ramping
   * up as the section approaches, dimmed again once the pin releases and content scrolls
   * over the room. Consumed by the scene as tone-mapping exposure, NOT as a DOM style —
   * templates carry no [style] bindings (CLAUDE.md), so the fade lives inside WebGL.
   */
  visibility: number;
  /**
   * The rack's journey from hero pose to pinned pose, 0→1 (see arrivalProgress). Defaults
   * to 1 — the pinned pose — so a scene running without a pillar-fan to drive it (or on a
   * narrow viewport, where the fan pins it at 1) renders the rack centred, never stranded
   * halfway to the hero.
   */
  arrival: number;
  /** True only once the WebGL scene is actually running. */
  enabled: boolean;
  /** Where each node currently is on screen. Empty unless the scene is running. */
  anchors: NodeAnchor[];
}

const initialState: JourneyState = { progress: 0, visibility: 0, arrival: 1, enabled: false, anchors: [] };

/**
 * Cross-component journey state. In a store rather than a service because three unrelated
 * consumers read it — the canvas, the SVG lead lines, and the card fan — which is exactly the
 * case CLAUDE.md reserves the Signal Store for.
 *
 * Starts disabled. The scene is opt-IN: SSR, reduced-motion, no-WebGL and slow connections all
 * simply never call enable(), so the default state is the safe one rather than a state something
 * has to remember to correct.
 */
export const JourneyStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    setProgress(p: number): void {
      patchState(store, { progress: Math.min(1, Math.max(0, p)) });
    },
    setVisibility(v: number): void {
      patchState(store, { visibility: Math.min(1, Math.max(0, v)) });
    },
    setArrival(a: number): void {
      patchState(store, { arrival: Math.min(1, Math.max(0, a)) });
    },
    enable(): void {
      patchState(store, { enabled: true });
    },
    /**
     * Also drops the anchors. A disabled scene has no nodes on screen, and a lead line drawn
     * to a stale anchor would point confidently at empty space.
     */
    disable(): void {
      patchState(store, { enabled: false, anchors: [] });
    },
    setAnchors(anchors: NodeAnchor[]): void {
      patchState(store, { anchors });
    },
  })),
);
