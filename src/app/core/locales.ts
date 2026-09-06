/**
 * The single source of truth for locales and page slugs.
 *
 * Routes, the canMatch guard, the language switcher and scripts/generate-sitemap.mjs
 * all derive from these lists. Adding a page here and nowhere else is deliberate:
 * a sitemap that drifts from the routes is worse than no sitemap.
 */
export const LOCALES = ['de', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

/** The locale served at `/`. */
export const DEFAULT_LOCALE: Locale = 'de';

/**
 * English slugs in BOTH locales — deliberate (#58).
 *
 * The audience is infrastructure buyers who read English routinely, and it fixes an
 * inconsistency that already existed: services/:pillar has always had English child
 * slugs (core-platform, gitops-k8s), so /leistungen/core-platform was a German/English
 * mix. The accepted cost is that German URLs lose German keywords.
 *
 * EXCEPT `impressum`: a German legal term of art, not a word to translate. §5 DDG wants
 * it "leicht erkennbar" and German visitors scan for that exact word. Untranslated in
 * both locales, the way "GmbH" would be.
 */
export const PAGE_SLUGS = [
  'services',
  'platform',
  'configurator',
  'quote',
  'about',
  'contact',
  'impressum',
  'privacy',
] as const;

export function isLocale(value: string | undefined | null): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** '/contact' -> '/de/contact'. '/' -> '/de' (no trailing slash). */
export function localizePath(locale: Locale, path: string): string {
  const clean = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  return `/${locale}${clean}`;
}

/** Reads the locale out of a URL path, or null if the first segment isn't one. */
export function localeOfPath(path: string): Locale | null {
  const first = path.split('/').filter(Boolean)[0];
  return isLocale(first) ? first : null;
}

/** '/de/services/x' + 'en' -> '/en/services/x'. Keeps the page; swaps the prefix. */
export function swapLocale(path: string, target: Locale): string {
  const segments = path.split('/').filter(Boolean);
  if (segments.length && isLocale(segments[0])) {
    segments[0] = target;
    return `/${segments.join('/')}`;
  }
  return `/${target}`;
}
