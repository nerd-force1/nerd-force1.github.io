import { inject, Injectable, TransferState, makeStateKey } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

/** State key under which the server stashes a language's translations. */
export const i18nStateKey = (lang: string) => makeStateKey<TranslationObject>(`i18n.${lang}`);

/**
 * Browser TranslateLoader: reuse the translations the server serialized into
 * TransferState (no re-fetch, no hydration mismatch on the initial SSR page);
 * fall back to HTTP for languages the server did not transfer (e.g. a runtime
 * language switch to a not-yet-loaded locale).
 */
@Injectable()
export class TranslateBrowserLoader implements TranslateLoader {
  private readonly transferState = inject(TransferState);
  private readonly http = inject(HttpClient);

  getTranslation(lang: string): Observable<TranslationObject> {
    const key = i18nStateKey(lang);
    if (this.transferState.hasKey(key)) {
      const data = this.transferState.get(key, {} as TranslationObject);
      // Consume once so a later reload goes to the network, not stale state.
      this.transferState.remove(key);
      return of(data);
    }
    return this.http.get<TranslationObject>(`/i18n/${lang}.json`);
  }
}
