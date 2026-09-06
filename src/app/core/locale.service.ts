import { Injectable, signal } from '@angular/core';
import { DEFAULT_LOCALE, Locale, localizePath } from './locales';

/**
 * The active locale, as read from the URL. The URL is the single source of
 * truth — there is no localStorage and no browser sniffing (#58), which also
 * keeps this clear of the consent question entirely.
 */
@Injectable({ providedIn: 'root' })
export class LocaleService {
  private readonly current = signal<Locale>(DEFAULT_LOCALE);

  readonly lang = this.current.asReadonly();

  set(locale: Locale): void {
    this.current.set(locale);
  }

  localize(path: string): string {
    return localizePath(this.current(), path);
  }
}
