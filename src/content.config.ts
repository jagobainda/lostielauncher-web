import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Content Collections (Astro 5+): typed, Zod-validated content.
//
// Canonical pattern: per-route page-level copy (title, description, heading,
// noindex) lives in the `pages` collection, NOT in the route's frontmatter.
// One JSON per route at src/content/pages/<route>.json, schema-validated by
// Zod; the page reads it with getEntry("pages", "<route>") and passes the
// fields straight to BaseLayout. This is the i18n swap point: when locales
// land, only the loader / schema change — pages stay untouched.

const pages = defineCollection({
    loader: glob({ pattern: "**/*.json", base: "./src/content/pages" }),
    schema: z.object({
        // TODO: add the fields every page should carry. Common starters:
        // title: z.string(),
        // description: z.string(),
        // heading: z.string().optional(),
        // noindex: z.boolean().optional().default(false),
    }),
});

export const collections = { pages };
