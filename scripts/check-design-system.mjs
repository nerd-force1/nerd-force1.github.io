#!/usr/bin/env node
// Guards the design-system invariant: styles.css is the ONE source of colour,
// rhythm and typography. Components consume tokens and utilities, never literals.
// Run: npm run check:design
//
// Known blind spots — all currently unviolated, listed so a future reader knows the
// green is narrower than it looks, and so the first violation is recognised as new:
//   - isShell matches `max-w-<name>` and a literal `px-6`. The bracket form
//     (`max-w-[48rem]`) and responsive padding (`px-4 sm:px-6`) both evade it.
//   - Every check reads static class="…" only. Angular's [class], [ngClass],
//     [class.foo], and host: { class: '…' } are invisible to all of them.
//   - ARBITRARY_COLOUR keys off the utility prefix, not the value, so a non-colour
//     arbitrary value on a colour-ish prefix (text-[13px], from-[20%]) would be a
//     false positive. Nothing uses one today.
import { readFileSync, globSync } from 'node:fs';

const STYLES = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const sources = globSync('src/app/**/*.{ts,html}', { cwd: new URL('..', import.meta.url) });
const read = (f) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
const failures = [];

// An empty glob would make every check below pass trivially. Fail loudly instead.
if (!sources.length) {
  console.error('no component files matched — the glob is broken');
  process.exit(1);
}

const COLOUR = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)/g;
// Tailwind arbitrary values on colour-bearing utilities: bg-[#00d4ff], text-[rgb(...)],
// border-[red]. Deliberately not a colour regex — bg-[--brand] bypasses the tokens too.
const ARBITRARY_COLOUR =
  /\b(?:bg|text|border|ring|shadow|fill|stroke|from|via|to|outline|decoration|accent|caret|divide|placeholder)-\[[^\]]+\]/g;

const lineAt = (text, index) => text.slice(0, index).split('\n').length;
const hits = (text, re) =>
  [...text.matchAll(re)].map((m) => ({ line: lineAt(text, m.index), text: m[0] }));

// Index just past the block whose opening brace is at `open`, or -1 if unbalanced.
const endOfBlock = (css, open) => {
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}' && --depth === 0) return i + 1;
  }
  return -1;
};

// Blanks each @theme block, preserving newlines so reported line numbers stay honest.
// Tolerates `@theme inline {` / `@theme static {` and an indented closing brace: brace
// counting rather than a `\n}` anchor, which would silently no-op on indentation and
// then report every token INSIDE @theme as a literal outside it.
const stripThemeBlocks = (css) => {
  const open = /@theme\b[^{]*\{/g;
  let out = '';
  let cursor = 0;
  let m;
  while ((m = open.exec(css))) {
    const end = endOfBlock(css, m.index + m[0].length - 1);
    if (end === -1) {
      console.error(`unbalanced @theme block at styles.css:${lineAt(css, m.index)} — cannot verify`);
      process.exit(1);
    }
    out += css.slice(cursor, m.index) + css.slice(m.index, end).replace(/[^\n]/g, ' ');
    cursor = end;
    open.lastIndex = end;
  }
  return out + css.slice(cursor);
};

// The `&:focus-visible { … }` body of a named @utility, whitespace-normalised so that
// reformatting one of them is not reported as drift.
const focusRingOf = (name) => {
  const m = new RegExp(`@utility\\s+${name}\\s*\\{`).exec(STYLES);
  if (!m) return { line: null, ring: null, why: `@utility ${name} not found` };
  const end = endOfBlock(STYLES, m.index + m[0].length - 1);
  if (end === -1) return { line: lineAt(STYLES, m.index), ring: null, why: `@utility ${name} unbalanced` };
  const body = STYLES.slice(m.index, end);
  const f = /&:focus-visible\s*\{/.exec(body);
  if (!f) return { line: lineAt(STYLES, m.index), ring: null, why: `no &:focus-visible in @utility ${name}` };
  const fEnd = endOfBlock(body, f.index + f[0].length - 1);
  if (fEnd === -1) return { line: lineAt(STYLES, m.index + f.index), ring: null, why: `unbalanced ring in ${name}` };
  const ring = body
    .slice(f.index + f[0].length, fEnd - 1)
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/;$/, '');
  return { line: lineAt(STYLES, m.index + f.index), ring, why: null };
};

// 1. Colour literals belong in @theme and nowhere else — neither elsewhere in styles.css
//    nor in components (CLAUDE.md: "no component-level color values").
const literals = hits(stripThemeBlocks(STYLES), COLOUR).map((h) => `styles.css:${h.line} ${h.text}`);
for (const f of sources) {
  const src = read(f);
  for (const h of [...hits(src, COLOUR), ...hits(src, ARBITRARY_COLOUR)]) {
    literals.push(`${f}:${h.line} ${h.text}`);
  }
}
if (literals.length) failures.push(`colour literals outside @theme:\n    ${literals.join('\n    ')}`);

// 2. No ad-hoc section shells — use .section (+ .section-narrow / .section-top).
//    Matches the tokens independently within one class attribute rather than as a fixed
//    sequence, because `mx-auto grid max-w-7xl gap-8 px-6` is the same shell reordered.
//    Reports file:line, so migrating one shell cannot hide its siblings in the same file.
//    Exempt: a footer and a navbar are not page sections — footer's tighter py-12 and
//    navbar's py-4 are deliberate, not drift.
const EXEMPT_SHELL = ['footer.html', 'navbar.html'];
const isShell = (cls) =>
  /\bmx-auto\b/.test(cls) && /\bmax-w-[0-9a-z]+\b/.test(cls) && /\bpx-6\b/.test(cls);
const shells = [];
for (const f of sources) {
  if (EXEMPT_SHELL.some((e) => f.endsWith(e))) continue;
  const src = read(f);
  for (const m of src.matchAll(/class="([^"]*)"/g)) {
    if (isShell(m[1])) shells.push(`${f}:${lineAt(src, m.index)}`);
  }
}
if (shells.length) failures.push(`ad-hoc section shells:\n    ${shells.join('\n    ')}`);

// 3. No hand-rolled surface chains. Same token-independent matching as check 2.
//    The fix is .surface-card; on an <input>/<textarea>/<select> it is .field-input.
//    (.field-input carries width:100% and a focus ring, so it is wrong for a badge span.)
const isSurface = (cls) =>
  /\brounded-card\b/.test(cls) && /\bborder-hairline\b/.test(cls) && /\bbg-bg-surface\b/.test(cls);
const surfaces = [];
for (const f of sources) {
  const src = read(f);
  for (const m of src.matchAll(/class="([^"]*)"/g)) {
    if (isSurface(m[1])) surfaces.push(`${f}:${lineAt(src, m.index)}`);
  }
}
if (surfaces.length) {
  failures.push(
    `duplicated surface chains (use .surface-card; .field-input on inputs):\n    ${surfaces.join('\n    ')}`,
  );
}

// 4. Typography lives in styles.css. A raw font-heading + text-<size> chain in a component
//    re-derives the type scale by hand; the fix is .heading-hero / .heading-1 … .heading-4.
//    Same token-independent matching as checks 2 and 3, so order within the attribute is
//    irrelevant, and a variant prefix (sm:text-4xl) still counts as re-deriving the scale.
//    Matches the SIZE scale only — text-text-primary / text-accent are colours, not sizes.
//    Exempt by explicit path, each for a reason that is about meaning, not convenience:
//      stat-tile.ts — its value is an accent-coloured NUMBER, not a heading. No .heading-*
//                     carries accent, and it must not inherit heading colour.
//    navbar.html and footer.html were exempt here until #76, because each hand-set the
//    wordmark as text ("NERD<span>FORCE1</span>") and that is brand, not hierarchy. Both
//    now render the real logo as an <img>, so the chains — and the reason to allow them —
//    are gone. The exemptions were removed rather than left as dead allowances: kept, they
//    would silently permit a genuine raw heading chain in either file later.
//    termin.page.ts is deliberately NOT exempt: it stays a visible offender until Task 11
//    deletes it, exactly as checks 2 and 3 already treat it.
const EXEMPT_HEADING = {
  'stat-tile.ts': 'accent-coloured number, not a heading',
};
const TEXT_SIZE = /\btext-(?:xs|sm|base|lg|xl|[2-9]xl)\b/;
const isHeadingChain = (cls) => /\bfont-heading\b/.test(cls) && TEXT_SIZE.test(cls);
const headings = [];
for (const f of sources) {
  if (Object.keys(EXEMPT_HEADING).some((e) => f.endsWith(e))) continue;
  const src = read(f);
  for (const m of src.matchAll(/class="([^"]*)"/g)) {
    if (isHeadingChain(m[1])) headings.push(`${f}:${lineAt(src, m.index)}`);
  }
}
if (headings.length) {
  failures.push(
    `raw heading chains (use .heading-hero / .heading-1 … .heading-4):\n    ${headings.join('\n    ')}`,
  );
}

// 5. focus-ring and field-input must define the SAME focus ring. @utility cannot share a
//    selector list, so the composition that used to enforce this is gone; this check
//    replaces it. Without it, changing one ring silently leaves inputs on the old one.
const rings = ['focus-ring', 'field-input'].map((name) => ({ name, ...focusRingOf(name) }));
const ringless = rings.filter((r) => r.ring === null);
if (ringless.length) {
  failures.push(
    `focus ring unreadable — check 5 cannot verify:\n    ${ringless.map((r) => r.why).join('\n    ')}`,
  );
} else if (rings[0].ring !== rings[1].ring) {
  failures.push(
    'focus rings have drifted — @utility focus-ring and @utility field-input must define ' +
      'the same ring:\n' +
      rings.map((r) => `    styles.css:${r.line} ${r.name}: ${r.ring}`).join('\n'),
  );
}

// 6. Colour literals in scene (Three.js) form. Check 1 already reads every .ts here, so
//    this is NOT a blind spot about which files are scanned — it is about sigils. Check 1's
//    COLOUR regex is anchored on `#`, and Three.js's idiomatic colour forms carry no `#`:
//      new THREE.Color(0xa78bfa)   missed      new THREE.Color('#a78bfa')  caught
//      color.setHex(0x339ad5)      missed
//    i.e. check 1 catches the one form nobody writes and misses the two everybody does.
//    Scene hues must be read from --color-pillar-* on :root at runtime, so that recolouring
//    a pillar in styles.css moves the rack too. See
//    docs/superpowers/specs/2026-07-15-homepage-journey-design.md.
//    Scoped to SIX hex digits: that is the RGB form. Three.js bitmasks and layer flags are
//    short (0xff, 0x01), so they do not trip this. A 6-digit 0x literal in src/app is a colour.
//    setRGB is matched only with a NUMERIC first argument — setRGB(r, g, b) from variables is
//    a legitimate computed colour and must stay allowed.
const HEX_0X = /\b0x[0-9a-fA-F]{6}\b/g;
const SET_RGB_LITERAL = /\.setRGB\s*\(\s*[\d.]+\s*,/g;
const sceneColours = [];
for (const f of sources) {
  const src = read(f);
  for (const h of [...hits(src, HEX_0X), ...hits(src, SET_RGB_LITERAL)]) {
    sceneColours.push(`${f}:${h.line} ${h.text}`);
  }
}
if (sceneColours.length) {
  failures.push(
    'colour literals in scene code (read --color-pillar-* off :root instead):\n    ' +
      sceneColours.join('\n    '),
  );
}

console.log(`checked ${sources.length} component files`);
if (failures.length) {
  console.error('DESIGN SYSTEM VIOLATIONS:\n  ' + failures.join('\n  '));
  process.exit(1);
}
console.log('design system OK');
