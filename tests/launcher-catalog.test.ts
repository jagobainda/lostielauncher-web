import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { localized, parseCatalog, parseHomeFeed } from "../src/lib/launcherCatalog.ts";

const game = {
    id: "6b49940d-5910-49e5-aab8-f933cd51c388",
    nombre: "Pokémon Añil",
    version: "v4.14.0",
    pesoGB: 0.5889,
    logo: "/public/imgs/4.png",
};

const entry = (extra: object) => ({
    id: "a",
    title: { es: "Hola", en: "Hello" },
    date: "2026-07-24T00:00:00",
    ...extra,
});

describe("parseCatalog", () => {
    it("maps the catalogue fields and resolves the logo against the CDN", () => {
        assert.deepEqual(parseCatalog([game]), [
            {
                id: game.id,
                name: game.nombre,
                version: game.version,
                sizeGb: game.pesoGB,
                logoUrl: "https://ericlostie-launcher.jagoba.dev/public/imgs/4.png",
            },
        ]);
    });

    it("drops malformed games and non-array payloads", () => {
        assert.deepEqual(parseCatalog([{ ...game, pesoGB: "1" }, { ...game, nombre: "" }, null]), []);
        assert.deepEqual(parseCatalog({ games: [game] }), []);
    });

    it("drops logos that are not rooted at the CDN", () => {
        for (const logo of ["@evil.com/a.png", ".evil.com/a.png", "//evil.com/a.png", "imgs/4.png"]) {
            assert.equal(parseCatalog([{ ...game, logo }])[0]?.logoUrl, null);
        }
    });
});

describe("localized", () => {
    it("falls back from the locale to Spanish, then English, then empty", () => {
        assert.equal(localized({ es: "Hola", en: "Hello" }, "en"), "Hello");
        assert.equal(localized({ es: "Hola", en: "Hello" }, "fr"), "Hola");
        assert.equal(localized({ en: "Hello" }, "fr"), "Hello");
        assert.equal(localized({ pt: "Olá" }, "fr"), "");
    });
});

describe("parseHomeFeed", () => {
    const now = new Date("2026-10-24T00:00:00");

    it("reads news and notifications with their own body and kind keys", () => {
        const feed = parseHomeFeed(
            {
                news: [entry({ description: { es: "Noticia" }, tag: "Release" })],
                notifications: [entry({ message: { es: "Aviso" }, type: "Info" })],
            },
            now,
        );
        assert.deepEqual(feed.news[0]?.body, { es: "Noticia" });
        assert.equal(feed.news[0]?.kind, "Release");
        assert.deepEqual(feed.notifications[0]?.body, { es: "Aviso" });
        assert.equal(feed.notifications[0]?.kind, "Info");
    });

    it("hides expired and incomplete entries", () => {
        const feed = parseHomeFeed(
            {
                news: [
                    entry({ description: { es: "Vieja" }, expires_at: "2026-10-21T00:00:00" }),
                    entry({ description: {} }),
                ],
                notifications: "nope",
            },
            now,
        );
        assert.deepEqual(feed, { news: [], notifications: [] });
    });
});
