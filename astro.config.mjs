import { defineConfig, fontProviders } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";

export default defineConfig({
    site: "https://lostielauncher.jagoba.dev",
    output: "static",
    i18n: {
        defaultLocale: "es",
        locales: ["es", "en", "fr", "pt"],
        routing: {
            prefixDefaultLocale: false,
        },
    },
    fonts: [
        {
            provider: fontProviders.google(),
            name: "Silkscreen",
            cssVariable: "--font-silkscreen",
            weights: [400, 700],
            styles: ["normal"],
            fallbacks: ["monospace"],
        },
        {
            provider: fontProviders.google(),
            name: "Pixelify Sans",
            cssVariable: "--font-pixelify",
            weights: ["400 700"],
            styles: ["normal"],
            fallbacks: ["monospace"],
        },
    ],
    adapter: node({
        mode: "standalone",
    }),
    integrations: [
        icon(),
        sitemap({
            filter: page => !page.endsWith("/404/") && !page.endsWith("/dashboard/"),
        }),
    ],
    vite: {
        plugins: [tailwindcss()],
    },
});
