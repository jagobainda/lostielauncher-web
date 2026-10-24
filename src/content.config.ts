import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { androidCopySchema } from "./lib/launcherAndroidCopy";
import { desktopCopySchema } from "./lib/launcherDesktopCopy";

const iconItem = z.object({
    icon: z.string(),
    text: z.string(),
});

const perPlatform = <T extends z.ZodType>(schema: T) => z.object({ Desktop: schema, Android: schema });

const landingSchema = z.object({
    hero: z.object({
        tagline: z.string(),
        subtitle: perPlatform(z.string()),
        installCta: perPlatform(z.string()),
        platformLabel: z.string(),
        downloadNote: z.string(),
        githubCta: z.string(),
        versionPrefix: z.string(),
        features: z.array(iconItem).min(1),
    }),
    screenshots: z.object({
        heading: z.string(),
        label: perPlatform(z.string()),
        hint: z.string(),
    }),
    install: z.object({
        heading: z.string(),
        subheading: z.string(),
        steps: perPlatform(
            z
                .array(
                    z.object({
                        icon: z.string(),
                        title: z.string(),
                        description: z.string(),
                    }),
                )
                .min(1),
        ),
        note: perPlatform(z.string()),
        downloadCta: perPlatform(z.string()),
    }),
    footer: z.object({
        sourceCode: z.string(),
        disclaimer: z.string(),
    }),
});

const launcherPlatformCopy = z.object({
    label: z.string(),
    hint: z.string(),
    empty: z.string(),
});

const dashboardSchema = z.object({
    heading: z.string(),
    subtitle: z.string(),
    updatedPrefix: z.string(),
    backHome: z.string(),
    kpis: z.object({
        gamesTotal: z.string(),
        uniqueUsers: z.string(),
        launcherTotal: z.string(),
    }),
    games: z.object({
        heading: z.string(),
        versionsLabel: z.string(),
        osLabel: z.string(),
        countriesLabel: z.string(),
        launcherClientsLabel: z.string(),
        browsersLabel: z.string(),
        downloadsLabel: z.string(),
        othersLabel: z.string(),
    }),
    launcher: z.object({
        heading: z.string(),
        subtitle: z.string(),
        totalLabel: z.string(),
        combinedHint: z.string(),
        shareLabel: z.string(),
        filterLabel: z.string(),
        allLabel: z.string(),
        versionsLabel: z.string(),
        countriesLabel: z.string(),
        platforms: perPlatform(launcherPlatformCopy),
    }),
    downloadsNote: z.string(),
    uniqueUsers: z.object({
        heading: z.string(),
        subtitle: z.string(),
        latestLabel: z.string(),
        averageLabel: z.string(),
        peakLabel: z.string(),
        chartLabel: z.string(),
        usersLabel: z.string(),
        filterLabel: z.string(),
        allLabel: z.string(),
        platformsNote: z.string(),
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

// UI strings of the launcher replicas, one JSON per locale and platform
const launcherDesktop = defineCollection({
    loader: glob({ pattern: "*.json", base: "./src/content/launcher/desktop" }),
    schema: desktopCopySchema,
});

const launcherAndroid = defineCollection({
    loader: glob({ pattern: "*.json", base: "./src/content/launcher/android" }),
    schema: androidCopySchema,
});

export const collections = { pages, launcherDesktop, launcherAndroid };
