import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { LangSwitcher } from './lang-switcher';

describe('LangSwitcher', () => {
  function setup(url: string) {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideTranslateService()],
    });
    const fixture = TestBed.createComponent(LangSwitcher);
    fixture.componentInstance['currentUrl'].set(url);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  it('offers the other locale, not the current one', () => {
    expect(setup('/de/services').target()).toBe('en');
  });

  it('keeps the page when switching — not back to the home page', () => {
    expect(setup('/de/services/core-platform').href()).toBe('/en/services/core-platform');
  });

  it('switches back the other way', () => {
    expect(setup('/en/contact').href()).toBe('/de/contact');
  });

  it('falls back to the target locale root when there is no locale in the URL', () => {
    expect(setup('/').href()).toBe('/en');
  });
});
