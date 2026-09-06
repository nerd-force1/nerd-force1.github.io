#!/usr/bin/env node
// Every internal routerLink must be locale-prefixed (#58). A bare routerLink="/contact"
// resolves outside the /:lang branch and 404s — and no unit test catches it, because
// the template compiles fine.
import { readFileSync, globSync } from 'node:fs';

const files = globSync('src/app/**/*.{ts,html}', { cwd: new URL('..', import.meta.url) });
const read = (f) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
const offenders = [];

for (const f of files) {
  read(f).split('\n').forEach((line, i) => {
    // Unpiped absolute routerLink: routerLink="/x" or [routerLink]="'/x'" without | loc
    if (/routerLink="\/[^"]*"/.test(line)) offenders.push(`${f}:${i + 1}  ${line.trim()}`);
    if (/\[routerLink\]="'\/[^"]*'"/.test(line) && !line.includes('| loc')) {
      offenders.push(`${f}:${i + 1}  ${line.trim()}`);
    }
  });
}

if (offenders.length) {
  console.error('Un-localized internal links (use `| loc`):\n  ' + offenders.join('\n  '));
  process.exit(1);
}
console.log(`checked ${files.length} files — all internal links localized`);
