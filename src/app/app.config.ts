import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideAppInitializer, inject } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { provideRouter, withViewTransitions, withInMemoryScrolling, withComponentInputBinding } from '@angular/router';
import { provideClientHydration, withEventReplay, withIncrementalHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideTranslateService, provideTranslateLoader, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { routes } from './app.routes';
import { TranslateBrowserLoader } from './core/i18n-transfer-loader';
import { LocaleService } from './core/locale.service';
import { DEFAULT_LOCALE, localeOfPath } from './core/locales';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
    ),
    provideHttpClient(withFetch()),
    provideClientHydration(
      withEventReplay(),
      withIncrementalHydration(),
    ),
    provideTranslateService({
      lang: DEFAULT_LOCALE,
      fallbackLang: DEFAULT_LOCALE,
      // Browser loader: reuse server translations from TransferState, else HTTP.
      // (On the server this token is overridden by TranslateFsLoader.)
      // Use the explicit provider form so ngx-translate doesn't console.warn
      // about auto-wrapping a bare class on every bootstrap.
      loader: provideTranslateLoader(TranslateBrowserLoader),
    }),
    // Apply the URL's locale before bootstrap, on both server and browser.
    // PlatformLocation works on both: @angular/platform-server populates pathname
    // from the request URL.
    //
    // This used to hardcode 'de' — the original #58 bug — so the server always
    // emitted German and only the browser switched, after hydration.
    //
    // What this is and is NOT responsible for, measured rather than assumed:
    //
    //   NOT the server HTML. core/locale.resolver.ts already applies the locale on
    //   every activation, and Angular blocks SSR serialization until the initial
    //   navigation's resolvers finish — so the resolver alone makes the server HTML
    //   correct. Verified: deleting this initializer entirely leaves all of
    //   `npm run check:ssr` green, /en included. An earlier comment here claimed a
    //   resolver alone would paint raw keys in the navbar/footer (they render outside
    //   the router-outlet). That is wrong, and the test proves it.
    //
    //   IS the browser's first paint. provideTranslateService above starts
    //   ngx-translate at DEFAULT_LOCALE, so on an /en page, without this, hydration
    //   could flash German before the resolver's async use('en') resolves. This
    //   settles the language before anything renders. check:ssr cannot see that — it
    //   only reads pre-hydration server HTML — so this part is reasoned, not measured.
    //
    // A load failure must NOT block bootstrap: resolve instead of rejecting so the
    // app still renders (missing translations degrade to keys) rather than failing.
    provideAppInitializer(() => {
      const translate = inject(TranslateService);
      const localeService = inject(LocaleService);
      const pathname = inject(PlatformLocation).pathname;
      const locale = localeOfPath(pathname) ?? DEFAULT_LOCALE;
      localeService.set(locale);
      return firstValueFrom(translate.use(locale)).catch(() => undefined);
    }),
  ],
};
