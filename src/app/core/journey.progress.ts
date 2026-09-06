/**
 * Progress of a sticky-pinned section, 0→1 across its pinned travel.
 *
 * Pure, and deliberately so: this is the one part of the journey that jsdom CAN verify.
 * vitest does no layout, so anything that reads a real rect is untestable here (#74) —
 * keeping the arithmetic in a function that takes numbers means the interesting half is
 * covered even though the DOM half never will be.
 *
 * `sectionTop` is getBoundingClientRect().top: positive while the section is still below
 * the fold, 0 as it lands, negative as it scrolls past.
 *
 * Travel is (height - viewport), not height: a pinned section stops moving once its
 * bottom edge reaches the viewport bottom. A section no taller than the viewport has no
 * travel at all — return 1 rather than dividing by zero and emitting Infinity/NaN into
 * a camera transform.
 */
export function pinProgress(sectionTop: number, sectionHeight: number, viewportH: number): number {
  const travel = sectionHeight - viewportH;
  if (travel <= 0) return 1;
  const scrolled = -sectionTop;
  if (scrolled <= 0) return 0;
  if (scrolled >= travel) return 1;
  return scrolled / travel;
}

/**
 * How present the rack scene is for a given scroll position, 0→1.
 *
 * Three regimes, in scroll order:
 *  - Approach: 0 while the section is below the fold, ramping to 1 as its top travels the
 *    last 60% of the viewport height. The hero owns scroll zero — the first cut of the scene
 *    ignored this and painted the rack straight over the headline.
 *  - Pinned: 1 for the whole pinned travel.
 *  - After release: eases down to 0.4 over half a viewport, then holds — the spec's beat 3:
 *    the room stays behind the content but stops competing with it.
 *
 * Consumed as tone-mapping exposure inside the scene (templates carry no [style] bindings).
 */
export function sceneVisibility(sectionTop: number, sectionHeight: number, viewportH: number): number {
  const appear = Math.min(1, Math.max(0, (viewportH - sectionTop) / (viewportH * 0.6)));
  const travel = Math.max(0, sectionHeight - viewportH);
  const over = -sectionTop - travel;
  if (over <= 0) return appear;
  return Math.max(0.4, 1 - (0.6 * over) / (viewportH * 0.5));
}

/**
 * How far the rack has travelled from its hero pose to its pinned pose, 0→1.
 *
 * 0 at the top of the page (rack framed beside the hero text), 1 the moment the rack
 * section pins (rack centred, where the lead-line anchors expect it). Driven by document
 * position, not the section's viewport entry, because the journey must START at scroll
 * zero — the rack is the hero's visual and travels the whole way down.
 *
 * The lead lines stay honest without knowing about this: they are gated to the pinned
 * window, and arrival is exactly 1 there by construction (scrollY ≥ document offset).
 */
export function arrivalProgress(scrollY: number, sectionTop: number): number {
  const docTop = scrollY + sectionTop;
  if (docTop <= 0) return 1;
  return Math.min(1, Math.max(0, scrollY / docTop));
}

/**
 * Visibility curve for wide viewports, where the rack IS the hero visual: full presence
 * from scroll zero, dimming to 0.4 only after the pin releases — the same tail as
 * sceneVisibility, with the approach ramp removed. Narrow viewports keep sceneVisibility:
 * there the hero is a single column and a rack behind the headline would fight it.
 */
export function heroSceneVisibility(sectionTop: number, sectionHeight: number, viewportH: number): number {
  const travel = Math.max(0, sectionHeight - viewportH);
  const over = -sectionTop - travel;
  if (over <= 0) return 1;
  return Math.max(0.4, 1 - (0.6 * over) / (viewportH * 0.5));
}
