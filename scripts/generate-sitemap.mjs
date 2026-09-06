#!/usr/bin/env node
// Emits public/sitemap.xml for both locales from the single source of truth in
// src/app/core/locales.ts. `--check` fails if the committed file is stale, so the
// sitemap cannot silently drift from the routes — a sitemap that lies about which
// URLs exist is worse than none.
import { readFileSync, writeFileSync } from 'node:fs';

const ORIGIN = 'https://nerd-force1.de';
const src = readFileSync(new URL('../src/app/core/locales.ts', import.meta.url), 'utf8');

const list = (name) => {
  const m = src.match(new RegExp(`export const ${name} = \\[([\\s\\S]*?)\\] as const`));
  if (!m) throw new Error(`could not parse ${name} out of locales.ts`);
  return [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
};

const locales = list('LOCALES');
const slugs = ['', ...list('PAGE_SLUGS')];

const urls = locales.flatMap((l) =>
  slugs.map((s) => {
    const path = s ? `/${l}/${s}` : `/${l}`;
    const alts = locales
      .map((a) => `    <xhtml:link rel="alternate" hreflang="${a}" href="${ORIGIN}${s ? `/${a}/${s}` : `/${a}`}"/>`)
      .join('\n');
    return `  <url>\n    <loc>${ORIGIN}${path}</loc>\n${alts}\n  </url>`;
  }),
);

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
  urls.join('\n') +
  `\n</urlset>\n`;

const out = new URL('../public/sitemap.xml', import.meta.url);

if (process.argv.includes('--check')) {
  let current = '';
  try { current = readFileSync(out, 'utf8'); } catch { /* missing counts as stale */ }
  if (current !== xml) {
    console.error('public/sitemap.xml is stale — run `npm run sitemap`');
    process.exit(1);
  }
  console.log(`sitemap OK — ${urls.length} URLs`);
} else {
  writeFileSync(out, xml);
  console.log(`wrote public/sitemap.xml — ${urls.length} URLs`);
}
