import { Route, Routes } from '@angular/router';
import { localeResolver } from './core/locale.resolver';
import { LOCALES } from './core/locales';

/** The pages, identical under every locale. See core/locales.ts for why the slugs are
 *  English in both (and why `impressum` is not). */
const pages: Route[] = [
  { path: '', loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage) },
  { path: 'services', loadComponent: () => import('./pages/leistungen/leistungen.page').then(m => m.LeistungenPage) },
  { path: 'services/:pillar', loadComponent: () => import('./pages/leistungen-detail/leistungen-detail.page').then(m => m.LeistungenDetailPage) },
  { path: 'platform', loadComponent: () => import('./pages/plattform/plattform.page').then(m => m.PlattformPage) },
  { path: 'configurator', loadComponent: () => import('./pages/konfigurator/konfigurator.page').then(m => m.KonfiguratorPage) },
  { path: 'quote', loadComponent: () => import('./pages/angebot/angebot.page').then(m => m.AngebotPage) },
  { path: 'about', loadComponent: () => import('./pages/ueber-uns/ueber-uns.page').then(m => m.UeberUnsPage) },
  { path: 'contact', loadComponent: () => import('./pages/kontakt/kontakt.page').then(m => m.KontaktPage) },
  { path: 'impressum', loadComponent: () => import('./pages/legal/impressum.page').then(m => m.ImpressumPage) },
  { path: 'privacy', loadComponent: () => import('./pages/legal/datenschutz.page').then(m => m.DatenschutzPage) },
];

/**
 * One branch per locale — `de/...`, `en/...` — rather than a single `:lang` branch.
 *
 * This looks like duplication and is not. Server routes are matched by PATTERN and
 * validated LITERALLY against this config, so a `:lang` router branch forces `:lang`
 * server routes too, and `:lang/services` also matches `/fr/services` (:lang='fr') —
 * handing back that route's metadata, HTTP 200, before the router's guard ever runs.
 * The guard then rejects it and renders the not-found page, but at 200: a soft 404.
 * Google treats a 200 as a real page, so that invites indexing an unbounded space of
 * URLs that do not exist, in the wrong language — the exact confusion #58 removes.
 *
 * Enumerating the locales means an unknown prefix matches nothing but `**`, which
 * carries a real 404, and the canMatch guard becomes unnecessary: route matching
 * alone does the job.
 *
 * Order matters: '' and 'termin' come first so they are not swallowed by a locale
 * branch.
 */
export const routes: Routes = [
  // 302 to the default locale. Angular's SSR emits a real redirect response for a
  // router redirectTo, defaulting to 302 — deliberately not 301: the default locale
  // is a policy decision, and a cached 301 is painful to undo.
  { path: '', redirectTo: '/de', pathMatch: 'full' },

  // Retired with the booking flow (#57); re-pointed here now that routes are localized.
  { path: 'termin', redirectTo: '/de/contact', pathMatch: 'full' },

  ...LOCALES.map<Route>((lang) => ({
    path: lang,
    // Static, not a :lang param — the resolver reads it from data.
    data: { locale: lang },
    resolve: { locale: localeResolver },
    children: pages,
  })),

  { path: '**', loadComponent: () => import('./pages/not-found/not-found.page').then(m => m.NotFoundPage) },
];
