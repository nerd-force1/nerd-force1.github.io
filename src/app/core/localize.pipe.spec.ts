import { TestBed } from '@angular/core/testing';
import { LocaleService } from './locale.service';
import { LocalizePipe } from './localize.pipe';

describe('LocalizePipe', () => {
  function setup(lang: 'de' | 'en') {
    TestBed.configureTestingModule({ providers: [LocaleService, LocalizePipe] });
    TestBed.inject(LocaleService).set(lang);
    return TestBed.inject(LocalizePipe);
  }

  it('prefixes a path with the current locale', () => {
    expect(setup('de').transform('/contact')).toBe('/de/contact');
  });

  it('follows the locale when it changes', () => {
    TestBed.configureTestingModule({ providers: [LocaleService, LocalizePipe] });
    const svc = TestBed.inject(LocaleService);
    const pipe = TestBed.inject(LocalizePipe);
    svc.set('de');
    expect(pipe.transform('/contact')).toBe('/de/contact');
    svc.set('en');
    expect(pipe.transform('/contact')).toBe('/en/contact');
  });

  it('maps home to the bare locale', () => {
    expect(setup('en').transform('/')).toBe('/en');
  });

  it('is impure — a pure pipe would cache and never follow a locale change', () => {
    // ɵpipe is a compiler-generated static field; ngtsc doesn't surface it in the
    // .d.ts of a same-project class, so the type checker needs a cast here.
    const pipeDef = (LocalizePipe as unknown as { ɵpipe: { pure: boolean } }).ɵpipe;
    expect(pipeDef.pure).toBe(false);
  });
});
