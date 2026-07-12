import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const iconItem = z.object({
    icon: z.string(),
    text: z.string(),
});

const landingSchema = z.object({
    hero: z.object({
        tagline: z.string(),
        subtitle: z.string(),
        downloadCta: z.string(),
        downloadNote: z.string(),
        githubCta: z.string(),
        versionPrefix: z.string(),
        features: z.array(iconItem).min(1),
    }),
    screenshots: z.object({
        heading: z.string(),
        screenshotAlt: z.string(),
    }),
    install: z.object({
        heading: z.string(),
        subheading: z.string(),
        steps: z
            .array(
                z.object({
                    icon: z.string(),
                    title: z.string(),
                    description: z.string(),
                }),
            )
            .min(1),
        smartScreenNote: z.string(),
    }),
    footer: z.object({
        tagline: z.string(),
        sourceCode: z.string(),
        disclaimer: z.string(),
    }),
});

const pages = defineCollection({
    loader: glob({ pattern: "**/*.json", base: "./src/content/pages" }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        noindex: z.boolean().optional().default(false),
        landing: landingSchema.optional(),
        notFound: z
            .object({
                title: z.string(),
                description: z.string(),
                heading: z.string(),
                message: z.string(),
                backHome: z.string(),
            })
            .optional(),
    }),
});

export const collections = { pages };
