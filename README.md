# Nerd-Force1 Website

Static company website for [Nerd-Force1](https://nerd-force1.com), served from GitHub Pages.

Derived from the frontend of `AI-Gruppe/nf1_website_sw` (Angular 22 SSR + FastAPI). Here
the site is **prerendered at build time** — no server, no database.

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 22 (`outputMode: static`), Tailwind CSS v4, ngx-translate |
| Hosting | GitHub Pages, deployed by `.github/workflows/pages.yml` on every push to `main` |

## What changed against the SSR original

- Every route is `RenderMode.Prerender` (`src/app/app.routes.server.ts`); `/` and `/termin`
  become meta-refresh redirects; `404.html` is the client shell so unknown URLs still render
  the not-found page.
- The service catalog is a static file, `public/api/catalog.json`, exported from the backend's
  `app/catalog/data.py`. Update it there and re-export when prices change.
- **The quote and callback forms have no backend here.** `EngagementService` still posts to
  `/api/quotes` and `/api/callbacks`, which do not exist on Pages. Wire them to an external
  endpoint or a `mailto:` before relying on them.

## Development

```bash
npm ci
npm start          # http://localhost:4200
npm run build      # dist/frontend/browser — what Pages serves
npm test
```

Checks that CI runs: `check:design`, `check:links`, `check:sitemap` (see `scripts/`).
