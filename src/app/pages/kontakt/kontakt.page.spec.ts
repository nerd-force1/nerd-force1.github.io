import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { KontaktPage } from './kontakt.page';

describe('KontaktPage', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting(), provideTranslateService()],
  }));

  const form = () => TestBed.createComponent(KontaktPage).componentInstance['form'];

  it('requires only an email', () => {
    const f = form();
    expect(f.valid).toBe(false);
    f.patchValue({ email: 'kunde@example.com' });
    expect(f.valid).toBe(true);
  });

  it('rejects a malformed email', () => {
    const f = form();
    f.patchValue({ email: 'not-an-email' });
    expect(f.valid).toBe(false);
  });

  it('treats name, preferred_time and message as optional', () => {
    const f = form();
    f.patchValue({ email: 'kunde@example.com' });
    expect(f.get('name')!.hasError('required')).toBe(false);
    expect(f.get('preferred_time')!.hasError('required')).toBe(false);
    expect(f.get('message')!.hasError('required')).toBe(false);
  });

  it('keeps the honeypot field', () => {
    expect(form().get('company_website')).toBeTruthy();
  });
});
