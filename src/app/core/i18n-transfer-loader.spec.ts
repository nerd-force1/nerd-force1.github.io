import { TestBed } from '@angular/core/testing';
import { TransferState } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateBrowserLoader, i18nStateKey } from './i18n-transfer-loader';

describe('TranslateBrowserLoader', () => {
  let loader: TranslateBrowserLoader;
  let ts: TransferState;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TranslateBrowserLoader, provideHttpClient(), provideHttpClientTesting()],
    });
    loader = TestBed.inject(TranslateBrowserLoader);
    ts = TestBed.inject(TransferState);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('uses TransferState when present and removes the key', () => {
    ts.set(i18nStateKey('de'), { a: '1' } as never);
    let result: unknown;
    loader.getTranslation('de').subscribe((r) => (result = r));
    expect(result).toEqual({ a: '1' });
    expect(ts.hasKey(i18nStateKey('de'))).toBe(false);
    http.expectNone('/i18n/de.json');
  });

  it('falls back to HTTP on a miss', () => {
    loader.getTranslation('en').subscribe();
    http.expectOne('/i18n/en.json').flush({});
  });
});
