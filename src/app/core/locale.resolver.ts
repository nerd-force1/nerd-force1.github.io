import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { LocaleService } from './locale.service';
import { DEFAULT_LOCALE, isLocale, Locale } from './locales';

/**
 * Applies the locale on every activation of a locale branch.
 *
 * The app initializer (app.config.ts) covers the FIRST render — it has to, because
 * navbar and footer sit outside the router-outlet and render before any route
 * activates. This covers SPA navigation between locales, where the initializer does
 * not run again.
 *
 * Reads `data.locale`, not a `:lang` param: the routes enumerate the locales
 * (`de/...`, `en/...`) so that an unknown prefix matches only `**` and gets a real
 * 404 instead of a soft one. See app.routes.ts.
 *
 * Returns the load promise so the route waits: activating before the translations
 * land would paint raw i18n keys.
 */
export const localeResolver: ResolveFn<Locale> = async (route) => {
  const raw = route.data['locale'] as string | undefined;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const translate = inject(TranslateService);
  const localeService = inject(LocaleService);

  localeService.set(locale);
  // currentLang is a Signal in this ngx-translate version (not a plain string).
  if (translate.currentLang() !== locale) {
    await firstValueFrom(translate.use(locale)).catch(() => undefined);
  }
  return locale;
};
