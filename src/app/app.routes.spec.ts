import { routes } from './app.routes';
import { LOCALES } from './core/locales';

describe('routes', () => {
  it('exposes a branch per locale plus the redirects, not bare page paths', () => {
    const paths = routes.map(r => r.path);
    for (const p of ['', 'termin', ...LOCALES, '**']) {
      expect(paths).toContain(p);
    }
  });

  it('exposes every public page under each locale branch', () => {
    for (const lang of LOCALES) {
      const children = (routes.find(r => r.path === lang)?.children ?? []).map(c => c.path);
      for (const p of ['', 'services', 'platform', 'configurator', 'quote', 'about', 'contact', 'impressum', 'privacy']) {
        expect(children).toContain(p);
      }
    }
  });
});
