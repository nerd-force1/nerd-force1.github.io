import { mergeApplicationConfig, ApplicationConfig, Injectable, TransferState, inject } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { i18nStateKey } from './core/i18n-transfer-loader';
import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Synchronously reads the translation JSON from disk on the server so the
 * FIRST server render (SSR and build-time prerender) has real text.
 *
 * The file lives at different locations depending on the execution context:
 *  - build-time prerender runs from `.angular/prerender-root/…` (a temp dir
 *    that does NOT contain the copied i18n assets), but cwd is the project
 *    root (`frontend/`), so `public/i18n/<lang>.json` is reachable;
 *  - the deployed server (`dist/frontend/server/server.mjs`) sits next to the
 *    browser build, so `../browser/i18n/<lang>.json` (relative to this module)
 *    is reachable.
 * We try each candidate in turn and use the first that reads successfully.
 */
// Cache the parsed JSON per language: Server-mode routes render once PER
// REQUEST, so an uncached blocking readFileSync would run on every request.
// Only the disk read/parse is cached — the per-request TransferState write
// still happens on every call below.
const fsCache = new Map<string, TranslationObject>();

function readTranslationJson(lang: string): TranslationObject | null {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    join(process.cwd(), 'public/i18n', `${lang}.json`),
    join(here, '../browser/i18n', `${lang}.json`),
    join(process.cwd(), 'dist/frontend/browser/i18n', `${lang}.json`),
  ];
  for (const file of candidates) {
    try {
      return JSON.parse(readFileSync(file, 'utf8')) as TranslationObject;
    } catch {
      // try the next candidate
    }
  }
  return null;
}

@Injectable()
class TranslateFsLoader implements TranslateLoader {
  private readonly transferState = inject(TransferState);

  getTranslation(lang: string): Observable<TranslationObject> {
    let data = fsCache.get(lang);
    if (data === undefined) {
      data = readTranslationJson(lang) ?? {};
      fsCache.set(lang, data);
    }
    // Stash for the browser so it reuses these translations via TransferState
    // instead of re-fetching /i18n/<lang>.json on the initial SSR page.
    // (Written on every request — only the disk read above is cached.)
    this.transferState.set(i18nStateKey(lang), data);
    return of(data);
  }
}

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    { provide: TranslateLoader, useClass: TranslateFsLoader },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
