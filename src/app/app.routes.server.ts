import { RenderMode, ServerRoute } from '@angular/ssr';
import { LOCALES } from './core/locales';
import { PILLARS } from './data/pillars.data';

/**
 * Static site (GitHub Pages): every page is prerendered at build time. There is no
 * server, so RenderMode.Server does not exist here — a route is either an HTML file
 * in dist/ or it is rendered in the browser.
 *
 * Locales are enumerated (`de/...`, `en/...`) rather than a `:lang` parameter so an
 * unknown prefix matches nothing but `**` — see app.routes.ts for the full reasoning.
 */
const forEachLocale = (path: string, params?: Record<string, string[]>): ServerRoute[] =>
  LOCALES.map((lang) => {
    const route: ServerRoute = {
      path: path ? `${lang}/${path}` : lang,
      renderMode: RenderMode.Prerender,
    };
    if (params) {
      return {
        ...route,
        renderMode: RenderMode.Prerender,
        getPrerenderParams: async () =>
          Object.entries(params).flatMap(([key, values]) => values.map((v) => ({ [key]: v }))),
      } as ServerRoute;
    }
    return route;
  });

export const serverRoutes: ServerRoute[] = [
  // `/` and `/termin` are router redirects; the static build emits a redirecting
  // index.html for them (public/index.html is not used — Angular owns that file).
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'termin', renderMode: RenderMode.Prerender },

  ...forEachLocale(''),
  ...forEachLocale('services'),
  ...forEachLocale('services/:pillar', { pillar: PILLARS.map((p) => p.slug) }),
  ...forEachLocale('platform'),
  ...forEachLocale('about'),
  ...forEachLocale('contact'),
  ...forEachLocale('configurator'),
  ...forEachLocale('quote'),
  ...forEachLocale('impressum'),
  ...forEachLocale('privacy'),

  // GitHub Pages serves 404.html for unknown URLs; the workflow copies the
  // not-found shell there. Client mode: nothing to prerender for a wildcard.
  { path: '**', renderMode: RenderMode.Client },
];
