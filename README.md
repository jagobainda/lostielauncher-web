# lostielauncher-web

LostieLauncher website built with Astro.

## Stack

Astro (static + per-route SSR) · Tailwind CSS · TypeScript strict · astro-icon · animejs ·
Content Collections + Zod · `@astrojs/node` · `@astrojs/sitemap` · Prettier.

## Development

```bash
npm install
npm run dev       # http://localhost:4321
npm run build
npm test          # node:test, no extra dependencies
npm run format
```

## Conventions

Any change (pages, components, collections, scripts…) must follow the project-scoped skill:

```
/astro-implement
```

The landing switches between Windows and Android and includes interactive launcher replicas in four locales.
Replica copy lives in `src/content/launcher/`; catalogue, feed and release versions are fetched at build time.
Fonts are self-hosted through the Astro Fonts API; Android Roboto is not preloaded.

## Pending tasks

See `TODO.md`.
