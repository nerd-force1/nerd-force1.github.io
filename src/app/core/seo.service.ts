import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { DEFAULT_LOCALE, LOCALES, localeOfPath, swapLocale } from './locales';

/** Absolute origin for canonical/alternate URLs. Must match the deployed host. */
const ORIGIN = 'https://nerd-force1.de';

/**
 * Emits <html lang>, a per-locale canonical, and hreflang alternates.
 *
 * Without hreflang, /de/services and /en/services read to Google as duplicates
 * rather than translations — which is the exact failure #58 exists to avoid, so
 * this is load-bearing rather than decoration.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly doc = inject(DOCUMENT);

  update(url: string): void {
    const path = url.split('?')[0].split('#')[0];
    const locale = localeOfPath(path) ?? DEFAULT_LOCALE;

    this.doc.documentElement.lang = locale;

    // Replace rather than append: navigating three times must not leave three
    // canonicals behind, which would make the signal meaningless.
    this.doc.head
      .querySelectorAll('link[rel="alternate"],link[rel="canonical"]')
      .forEach((n) => n.remove());

    this.setLink('canonical', null, `${ORIGIN}${path}`);
    for (const l of LOCALES) {
      this.setLink('alternate', l, `${ORIGIN}${swapLocale(path, l)}`);
    }
    this.setLink('alternate', 'x-default', `${ORIGIN}${swapLocale(path, DEFAULT_LOCALE)}`);
  }

  private setLink(rel: string, hreflang: string | null, href: string): void {
    const link = this.doc.createElement('link');
    link.setAttribute('rel', rel);
    if (hreflang) link.setAttribute('hreflang', hreflang);
    link.setAttribute('href', href);
    this.doc.head.appendChild(link);
  }
}
