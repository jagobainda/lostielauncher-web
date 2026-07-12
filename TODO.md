# TODO

Pending setup tasks for this fresh template. Delete each line once done.

## Configuration

- [ ] Set the real production URL in `astro.config.mjs` (`site`) and in `src/lib/seo.ts` (`SITE_URL`).
- [ ] Update the `Sitemap:` line in `public/robots.txt` with the production domain.
- [ ] Fill in `README.md`.
- [ ] Extend the `pages` collection schema in `src/content.config.ts` with the fields every page should
      carry (e.g. `title`, `description`, `heading`, `noindex`), then fill in the TODO values in
      `src/content/pages/index.json` and `src/content/pages/404.json`. This is the i18n swap point.

## Code

- [ ] Implement the home page (`src/pages/index.astro` reads from the `pages` collection — build its
      component under `src/components/pages/IndexPage.astro`).
- [ ] Implement the 404 page (same pattern as the home page, with `noindex: true`).
- [ ] Flesh out the SEO helpers (`src/lib/seo.ts`).

## Client scripts (when you need them)

There is **no `src/scripts/main.ts` catch-all**. Create a domain module per need
(`src/scripts/animations.ts`, `src/scripts/forms.ts`, ...) and import it from
the component's own `<script>`. See `/astro-implement` for details.

## Icons (when you need them)

`astro-icon` is installed but ships no icon data. For each Iconify set you use,
install its package, e.g. `npm i @iconify-json/bi`, then `<Icon name="bi:github" />`.
Alternatively drop local SVGs into `src/icons/` and use `<Icon name="my-icon" />`.
