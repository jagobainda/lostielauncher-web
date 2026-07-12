# TODO

## Pending

- [ ] Fill in `README.md` (still describes the bare template).

## Done

- [x] Landing page (single page, scroll): hero/download, dynamic theme-screenshot gallery,
      install steps — `src/components/pages/LandingPage.astro`.
- [x] i18n: `es` default at `/`, plus `/en/`, `/fr/`, `/pt/` (`src/pages/[lang]/index.astro`),
      browser-language auto-redirect on first visit (`src/scripts/lang.ts`), hreflang alternates.
      Copy lives in `src/content/pages/<locale>/index.json`; keep `src/lib/i18n.ts`,
      `src/scripts/lang.ts` and the `i18n` block in `astro.config.mjs` in sync if locales change.
- [x] 404 page.
- [x] `pages` collection schema (`title`/`description`/`noindex` + `landing`/`notFound` groups).
- [x] SEO helpers (`softwareApplicationSchema`) + sitemap + robots.
