import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { ORGANIZATION_ID, ORIGIN, organizationNode, relatedNodes, WEBSITE_ID, websiteNode } from '../data/organization.data';
import { offerCatalog, serviceId, serviceNodes } from '../data/services.data';
import { isPillarSlug } from '../data/pillars.data';
import { DEFAULT_LOCALE, LOCALES, Locale, localeOfPath, swapLocale } from './locales';

const JSONLD_ID = 'nf-site-jsonld';

/**
 * Emits <html lang>, a per-locale canonical, hreflang alternates, and the site-wide
 * JSON-LD graph (Organization with its OfferCatalog, the five Services, WebSite, WebPage;
 * a service detail page's WebPage points at its Service via mainEntity).
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
    const locale: Locale = localeOfPath(path) ?? DEFAULT_LOCALE;

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

    this.setJsonLd(path, locale);
  }

  private setLink(rel: string, hreflang: string | null, href: string): void {
    const link = this.doc.createElement('link');
    link.setAttribute('rel', rel);
    if (hreflang) link.setAttribute('hreflang', hreflang);
    link.setAttribute('href', href);
    this.doc.head.appendChild(link);
  }

  private setJsonLd(path: string, locale: Locale): void {
    const pillar = path.match(/^\/(?:de|en)\/services\/([^/]+)$/)?.[1];
    const mainEntity = pillar && isPillarSlug(pillar) ? { mainEntity: { '@id': serviceId(pillar) } } : {};
    this.doc.getElementById(JSONLD_ID)?.remove();
    const script = this.doc.createElement('script');
    script.id = JSONLD_ID;
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        { ...organizationNode(), hasOfferCatalog: offerCatalog() },
        websiteNode(),
        ...serviceNodes(locale),
        {
          '@type': 'WebPage',
          '@id': `${ORIGIN}${path}`,
          url: `${ORIGIN}${path}`,
          inLanguage: locale,
          isPartOf: { '@id': WEBSITE_ID },
          about: { '@id': ORGANIZATION_ID },
          ...mainEntity,
        },
        ...relatedNodes(),
      ],
    });
    this.doc.head.appendChild(script);
  }
}
