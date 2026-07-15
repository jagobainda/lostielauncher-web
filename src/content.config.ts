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
        installCta: z.string(),
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
        downloadCta: z.string(),
    }),
    footer: z.object({
        tagline: z.string(),
        sourceCode: z.string(),
        disclaimer: z.string(),
    }),
});

const dashboardSchema = z.object({
    heading: z.string(),
    subtitle: z.string(),
    updatedPrefix: z.string(),
    backHome: z.string(),
    kpis: z.object({
        gamesTotal: z.string(),
        gamesCount: z.string(),
        launcherTotal: z.string(),
    }),
    games: z.object({
        heading: z.string(),
        versionsLabel: z.string(),
        countriesLabel: z.string(),
        downloadsLabel: z.string(),
        othersLabel: z.string(),
    }),
    launcher: z.object({
        heading: z.string(),
        subheading: z.string(),
        totalLabel: z.string(),
        countriesLabel: z.string(),
    }),
    error: z.object({
        heading: z.string(),
        message: z.string(),
        retry: z.string(),
    }),
});

const pages = defineCollection({
    loader: glob({ pattern: "**/*.json", base: "./src/content/pages" }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        noindex: z.boolean().optional().default(false),
        landing: landingSchema.optional(),
        dashboard: dashboardSchema.optional(),
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
