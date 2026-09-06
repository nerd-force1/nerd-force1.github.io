import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { SeoService } from './seo.service';

describe('SeoService', () => {
  let doc: Document;
  let seo: SeoService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [SeoService] });
    doc = TestBed.inject(DOCUMENT);
    seo = TestBed.inject(SeoService);
    doc.head.querySelectorAll('link[rel="alternate"],link[rel="canonical"]').forEach((n) => n.remove());
    doc.getElementById('nf-site-jsonld')?.remove();
  });

  it('sets <html lang> to the active locale', () => {
    seo.update('/de/services');
    expect(doc.documentElement.lang).toBe('de');
    seo.update('/en/services');
    expect(doc.documentElement.lang).toBe('en');
  });

  it('emits a canonical pointing at the page own locale URL', () => {
    seo.update('/en/services');
    const canonical = doc.head.querySelector('link[rel="canonical"]');
    expect(canonical?.getAttribute('href')).toBe('https://nerd-force1.com/en/services');
  });

  it('emits hreflang alternates for both locales plus x-default', () => {
    seo.update('/de/services');
    const alts = [...doc.head.querySelectorAll('link[rel="alternate"]')].map((l) => [
      l.getAttribute('hreflang'),
      l.getAttribute('href'),
    ]);
    expect(alts).toContainEqual(['de', 'https://nerd-force1.com/de/services']);
    expect(alts).toContainEqual(['en', 'https://nerd-force1.com/en/services']);
    expect(alts).toContainEqual(['x-default', 'https://nerd-force1.com/de/services']);
  });

  it('does not accumulate duplicate tags across navigations', () => {
    seo.update('/de/services');
    seo.update('/en/contact');
    seo.update('/de/about');
    expect(doc.head.querySelectorAll('link[rel="alternate"]').length).toBe(3);
    expect(doc.head.querySelectorAll('link[rel="canonical"]').length).toBe(1);
  });

  it('emits one site-wide JSON-LD graph whose WebPage matches the canonical', () => {
    seo.update('/de/services');
    seo.update('/en/about');
    const scripts = doc.head.querySelectorAll('script#nf-site-jsonld');
    expect(scripts.length).toBe(1);
    const graph = JSON.parse(scripts[0].textContent ?? '{}')['@graph'] as Array<Record<string, unknown>>;
    const page = graph.find((n) => n['@type'] === 'WebPage');
    expect(page?.['@id']).toBe('https://nerd-force1.com/en/about');
    expect(page?.['inLanguage']).toBe('en');
    expect(graph.find((n) => n['@type'] === 'Organization')?.['@id']).toBe('https://www.nerd-force1.de/#organization');
  });
});
