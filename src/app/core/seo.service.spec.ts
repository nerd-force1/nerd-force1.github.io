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
    expect(canonical?.getAttribute('href')).toBe('https://nerd-force1.de/en/services');
  });

  it('emits hreflang alternates for both locales plus x-default', () => {
    seo.update('/de/services');
    const alts = [...doc.head.querySelectorAll('link[rel="alternate"]')].map((l) => [
      l.getAttribute('hreflang'),
      l.getAttribute('href'),
    ]);
    expect(alts).toContainEqual(['de', 'https://nerd-force1.de/de/services']);
    expect(alts).toContainEqual(['en', 'https://nerd-force1.de/en/services']);
    expect(alts).toContainEqual(['x-default', 'https://nerd-force1.de/de/services']);
  });

  it('does not accumulate duplicate tags across navigations', () => {
    seo.update('/de/services');
    seo.update('/en/contact');
    seo.update('/de/about');
    expect(doc.head.querySelectorAll('link[rel="alternate"]').length).toBe(3);
    expect(doc.head.querySelectorAll('link[rel="canonical"]').length).toBe(1);
  });
});
