import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import de from '../../../../public/i18n/de.json';
import en from '../../../../public/i18n/en.json';
import { LegalContent } from './legal-content';

type Section = { title: string; body: string };

const nonEmptySections = (v: unknown): v is Section[] =>
  Array.isArray(v) && v.length > 0 && v.every(s => typeof s.title === 'string' && typeof s.body === 'string');

describe('legal i18n content', () => {
  it('de.json impressum/datenschutz have non-empty sections arrays', () => {
    expect(nonEmptySections(de.impressum.sections)).toBe(true);
    expect(nonEmptySections(de.datenschutz.sections)).toBe(true);
  });

  it('en.json mirrors the same section counts', () => {
    expect(en.impressum.sections).toHaveLength(de.impressum.sections.length);
    expect(en.datenschutz.sections).toHaveLength(de.datenschutz.sections.length);
  });

  it('impressum carries the real company data, not placeholders', () => {
    const impressumText = de.impressum.sections.map(s => s.body).join('\n');
    expect(impressumText).not.toContain('[PLATZHALTER:');
    expect(impressumText).toContain('nerd_force1 UG');
    expect(impressumText).toContain('HRB 16979');
    expect(impressumText).toContain('DE815744003');
  });
});

@Component({
  imports: [LegalContent],
  template: `<nf-legal-content key="impressum" />`,
})
class Host {}

describe('LegalContent rendering', () => {
  it('renders sections and re-renders on language change', () => {
    TestBed.configureTestingModule({
      imports: [Host],
      providers: [provideTranslateService()],
    });
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('de', de);
    translate.setTranslation('en', en);
    translate.use('de');

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    let text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Angaben gemäß § 5 DDG');
    expect(text).toContain('nerd_force1 UG');

    translate.use('en');
    fixture.detectChanges();
    text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Information pursuant to § 5 DDG');
    expect(text).toContain('legally binding');
  });
});
