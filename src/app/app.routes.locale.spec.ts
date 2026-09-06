import { Route } from '@angular/router';
import { routes } from './app.routes';
import { LOCALES } from './core/locales';

const find = (path: string): Route | undefined => routes.find(r => r.path === path);
const childrenOf = (locale: string): string[] => (find(locale)?.children ?? []).map(c => c.path!);

describe('locale routes', () => {
  it('redirects / to the default locale', () => {
    const root = find('');
    expect(root?.redirectTo).toBe('/de');
    expect(root?.pathMatch).toBe('full');
  });

  it('has one branch per locale, enumerated rather than a :lang param', () => {
    for (const l of LOCALES) {
      expect(find(l)).toBeDefined();
    }
    // A :lang branch would also match /fr/... at the SERVER route layer and answer
    // 200 before the app could reject it — a soft 404. See app.routes.ts.
    expect(find(':lang')).toBeUndefined();
  });

  it('carries the locale in static data so the resolver can read it', () => {
    for (const l of LOCALES) {
      expect(find(l)!.data).toEqual({ locale: l });
      expect(find(l)!.resolve).toBeDefined();
    }
  });

  it('serves every page under every locale with English slugs', () => {
    for (const l of LOCALES) {
      const paths = childrenOf(l);
      for (const p of ['', 'services', 'services/:pillar', 'platform', 'configurator', 'quote', 'about', 'contact', 'impressum', 'privacy']) {
        expect(paths).toContain(p);
      }
    }
  });

  it('keeps impressum untranslated — a German legal term of art (§5 DDG)', () => {
    for (const l of LOCALES) {
      expect(childrenOf(l)).toContain('impressum');
      expect(childrenOf(l)).not.toContain('imprint');
    }
  });

  it('keeps no un-prefixed page routes — the site is pre-launch, old URLs may 404', () => {
    const paths = routes.map(r => r.path);
    for (const old of ['leistungen', 'plattform', 'konfigurator', 'angebot', 'ueber-uns', 'kontakt', 'datenschutz']) {
      expect(paths).not.toContain(old);
    }
  });

  it('re-points the retired /termin redirect at the localized contact page', () => {
    expect(find('termin')?.redirectTo).toBe('/de/contact');
  });

  it('still ends in a wildcard so unknown prefixes 404', () => {
    expect(routes[routes.length - 1].path).toBe('**');
  });
});
