import type { PillarSlug } from '../../../data/pillars.data';

/** Reads one CSS custom property by name. Injected so the palette stays pure. */
export type CssVarReader = (name: string) => string;

export interface Palette {
  readonly hues: Readonly<Record<PillarSlug, string>>;
  readonly accent: string;
}

/**
 * Every name written out in full. Not `--color-pillar-${slug}`: the same rule that governs
 * Tailwind class names in pillar-card.ts applies to grepability here — someone auditing which
 * tokens the scene consumes must be able to find these by searching styles.css's token names.
 */
const HUE_VARS: Record<PillarSlug, string> = {
  'core-platform': '--color-pillar-core-platform',
  'gitops-k8s': '--color-pillar-gitops-k8s',
  'security-ops': '--color-pillar-security-ops',
  'collab-apps': '--color-pillar-collab-apps',
  'custom': '--color-pillar-custom',
};

const ACCENT_VAR = '--color-accent';

/**
 * The scene's colours, read from the design system at runtime.
 *
 * This exists so the rack's node LEDs ARE the pillar tokens rather than copies of them:
 * recolour a pillar in styles.css and the rack follows. Hardcoding the hues here would be a
 * component-level colour value, which CLAUDE.md forbids — and until check 6 landed, the guard
 * could not see the Three.js form of that violation at all.
 *
 * Returns null rather than falling back to a literal. A fallback hex would be the exact
 * violation this function exists to prevent, and worse, it would paint a plausible-looking
 * rack over a real bug — a stylesheet that never landed, an SSR pass, a jsdom test — instead
 * of surfacing it. The caller's job on null is to leave the scene disabled and show the
 * static poster, which is a correct page, not a broken one.
 */
export function readPalette(read: CssVarReader): Palette | null {
  const accent = read(ACCENT_VAR).trim();
  if (!accent) return null;

  const hues = {} as Record<PillarSlug, string>;
  for (const [slug, varName] of Object.entries(HUE_VARS) as [PillarSlug, string][]) {
    const value = read(varName).trim();
    if (!value) return null;
    hues[slug] = value;
  }
  return { hues, accent };
}

/** The scene's material/lighting surface names. Keys mirror --color-scene-* in styles.css. */
export type SceneSurface =
  | 'metal' | 'metalDeep' | 'plate' | 'vent' | 'handle' | 'cavity' | 'floor'
  | 'key' | 'rim' | 'fill' | 'grid' | 'wall';

/** Literal for the same grepability reason as HUE_VARS. */
const SCENE_VARS: Record<SceneSurface, string> = {
  metal: '--color-scene-metal',
  metalDeep: '--color-scene-metal-deep',
  plate: '--color-scene-plate',
  vent: '--color-scene-vent',
  handle: '--color-scene-handle',
  cavity: '--color-scene-cavity',
  floor: '--color-scene-floor',
  key: '--color-scene-key',
  rim: '--color-scene-rim',
  fill: '--color-scene-fill',
  grid: '--color-scene-grid',
  wall: '--color-scene-wall',
};

/**
 * Material/lighting palette for the rack scene. Same contract as readPalette: every token
 * present and non-blank, or null — never a fallback (see readPalette's comment for why).
 */
export function readScenePalette(read: CssVarReader): Record<SceneSurface, string> | null {
  const out = {} as Record<SceneSurface, string>;
  for (const [surface, varName] of Object.entries(SCENE_VARS) as [SceneSurface, string][]) {
    const value = read(varName).trim();
    if (!value) return null;
    out[surface] = value;
  }
  return out;
}

/** The real binding. Browser-only — getComputedStyle does not exist on the server. */
export function cssVarReader(root: HTMLElement): CssVarReader {
  const style = getComputedStyle(root);
  return (name) => style.getPropertyValue(name);
}
