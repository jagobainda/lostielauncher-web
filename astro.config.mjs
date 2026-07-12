import { defineConfig } from "astro/config";
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
    adapter: node({
        mode: "standalone",
    }),
    integrations: [
        icon(),
        sitemap({
            filter: page => !page.endsWith("/404/"),
        }),
    ],
    vite: {
        plugins: [tailwindcss()],
    },
});
