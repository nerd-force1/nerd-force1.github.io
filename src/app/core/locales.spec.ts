import { LOCALES, PAGE_SLUGS, isLocale, localizePath, swapLocale } from './locales';

describe('locales', () => {
  it('supports exactly de and en', () => {
    expect([...LOCALES]).toEqual(['de', 'en']);
  });

  it('recognises only known locales', () => {
    expect(isLocale('de')).toBe(true);
    expect(isLocale('en')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale('services')).toBe(false);
  });

  it('keeps impressum untranslated — a German legal term of art (§5 DDG)', () => {
    expect(PAGE_SLUGS).toContain('impressum');
    expect(PAGE_SLUGS).not.toContain('legal-notice');
    expect(PAGE_SLUGS).not.toContain('imprint');
  });

  it('uses English slugs for everything else', () => {
    for (const s of ['services', 'platform', 'configurator', 'quote', 'about', 'contact', 'privacy']) {
      expect(PAGE_SLUGS).toContain(s);
    }
  });

  it('localizePath prefixes with the locale', () => {
    expect(localizePath('de', '/contact')).toBe('/de/contact');
    expect(localizePath('en', '/services')).toBe('/en/services');
  });

  it('localizePath maps the home path to the bare locale, not a trailing slash', () => {
    expect(localizePath('de', '/')).toBe('/de');
    expect(localizePath('en', '/')).toBe('/en');
  });

  it('swapLocale keeps the page and swaps only the prefix', () => {
    expect(swapLocale('/de/services/core-platform', 'en')).toBe('/en/services/core-platform');
    expect(swapLocale('/en/contact', 'de')).toBe('/de/contact');
    expect(swapLocale('/de', 'en')).toBe('/en');
  });

  it('swapLocale on a path with no locale prefix returns the target locale root', () => {
    expect(swapLocale('/', 'en')).toBe('/en');
  });
});
