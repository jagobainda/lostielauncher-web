import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
    LAUNCHER_ANDROID,
    LAUNCHER_DESKTOP,
    launcherClientPlatform,
    normalizeOsLabel,
    parseDownloadStats,
    parseOs,
    shareOf,
    versionStats,
    splitByClient,
} from "../src/lib/downloads.ts";

const country = (name: string, count: number, percent: number) => ({ country: name, count, percent });

const currentResponse = {
    generatedAt: "2026-10-22T21:20:03.083082+00:00",
    byGame: {
        "pokemon-anil": {
            totalDownloads: 34114,
            byVersion: { "4.13.0": 17408, "4.14.0": 16706 },
            topCountries: [country("Spain", 16762, 49.14)],
            byOs: [
                { os: "Launcher Desktop", count: 34045, percent: 99.8 },
                { os: "Unknown", count: 55, percent: 0.16 },
                { os: "Launcher Android", count: 9, percent: 0.03 },
                { os: "Android", count: 4, percent: 0.01 },
                { os: "Windows", count: 1, percent: 0 },
            ],
        },
    },
    byLauncher: {
        totalDownloads: 50,
        byVersion: { setup: 40, "0.8.1": 10 },
        topCountries: [country("Spain", 30, 60)],
        byPlatform: {
            Desktop: { totalDownloads: 40, byVersion: { setup: 40 }, topCountries: [country("Spain", 25, 62.5)] },
            Android: { totalDownloads: 10, byVersion: { "0.8.1": 10 }, topCountries: [country("Mexico", 10, 100)] },
        },
    },
};

describe("parseDownloadStats", () => {
    it("keeps the combined launcher total instead of summing the platform subtotals", () => {
        const stats = parseDownloadStats({
            ...currentResponse,
            byLauncher: { ...currentResponse.byLauncher, totalDownloads: 55 },
        });
        assert.equal(stats?.byLauncher.totalDownloads, 55);
        assert.equal(stats?.byLauncher.byPlatform?.Desktop?.totalDownloads, 40);
        assert.equal(stats?.byLauncher.byPlatform?.Android?.totalDownloads, 10);
    });

    it("reads versions and countries for each platform from its own block", () => {
        const launcher = parseDownloadStats(currentResponse)?.byLauncher;
        assert.deepEqual(launcher?.byVersion, { setup: 40, "0.8.1": 10 });
        assert.deepEqual(launcher?.byPlatform?.Desktop?.byVersion, { setup: 40 });
        assert.deepEqual(launcher?.byPlatform?.Android?.byVersion, { "0.8.1": 10 });
        assert.deepEqual(launcher?.byPlatform?.Android?.topCountries, [country("Mexico", 10, 100)]);
    });

    it("keeps an Android platform that starts at zero", () => {
        const stats = parseDownloadStats({
            ...currentResponse,
            byLauncher: {
                ...currentResponse.byLauncher,
                byPlatform: {
                    ...currentResponse.byLauncher.byPlatform,
                    Android: { totalDownloads: 0, byVersion: {}, topCountries: [] },
                },
            },
        });
        assert.deepEqual(stats?.byLauncher.byPlatform?.Android, { totalDownloads: 0, byVersion: {}, topCountries: [] });
    });

    it("does not invent a platform split for responses without byPlatform", () => {
        const { byPlatform: _, ...legacyLauncher } = currentResponse.byLauncher;
        const stats = parseDownloadStats({ ...currentResponse, byLauncher: legacyLauncher });
        assert.equal(stats?.byLauncher.totalDownloads, 50);
        assert.equal(stats?.byLauncher.byPlatform, null);
    });

    it("only reports the platforms present in the response", () => {
        const stats = parseDownloadStats({
            ...currentResponse,
            byLauncher: {
                ...currentResponse.byLauncher,
                byPlatform: { Desktop: currentResponse.byLauncher.byPlatform.Desktop },
            },
        });
        assert.deepEqual(Object.keys(stats?.byLauncher.byPlatform ?? {}), ["Desktop"]);
    });

    it("treats an empty or malformed byPlatform as missing", () => {
        for (const byPlatform of [{}, [], "Desktop", { Desktop: { totalDownloads: "40" } }]) {
            const stats = parseDownloadStats({
                ...currentResponse,
                byLauncher: { ...currentResponse.byLauncher, byPlatform },
            });
            assert.equal(stats?.byLauncher.byPlatform, null);
        }
    });

    it("defaults missing byOs to an empty list on legacy game entries", () => {
        const stats = parseDownloadStats({
            ...currentResponse,
            byGame: { "pokemon-z": { totalDownloads: 3, byVersion: { "1.0": 3 }, topCountries: [] } },
        });
        assert.deepEqual(stats?.byGame["pokemon-z"]?.byOs, []);
    });

    it("drops malformed rows and games without a valid total", () => {
        const stats = parseDownloadStats({
            ...currentResponse,
            byGame: {
                ok: {
                    totalDownloads: 2,
                    byVersion: { "1.0": 2, broken: -1, text: "3" },
                    topCountries: [country("Spain", 2, 100), { country: "Peru" }],
                    byOs: [{ os: "Windows", count: 2, percent: 100 }, { os: 4 }],
                },
                broken: { byVersion: {} },
            },
        });
        assert.deepEqual(Object.keys(stats?.byGame ?? {}), ["ok"]);
        assert.deepEqual(stats?.byGame.ok?.byVersion, { "1.0": 2 });
        assert.deepEqual(stats?.byGame.ok?.topCountries, [country("Spain", 2, 100)]);
        assert.deepEqual(stats?.byGame.ok?.byOs, [{ os: "Windows", count: 2, percent: 100 }]);
    });

    it("rejects payloads without a launcher total", () => {
        assert.equal(parseDownloadStats(null), null);
        assert.equal(parseDownloadStats([]), null);
        assert.equal(parseDownloadStats({ byGame: {} }), null);
        assert.equal(parseDownloadStats({ byGame: {}, byLauncher: { totalDownloads: null } }), null);
    });

    it("tolerates a missing generatedAt", () => {
        const { generatedAt: _, ...rest } = currentResponse;
        assert.equal(parseDownloadStats(rest)?.generatedAt, null);
    });
});

describe("game OS categories", () => {
    it("maps the legacy Launcher label to Launcher Desktop", () => {
        assert.equal(normalizeOsLabel("Launcher"), LAUNCHER_DESKTOP);
        assert.equal(normalizeOsLabel(" Launcher "), LAUNCHER_DESKTOP);
        assert.equal(normalizeOsLabel("Launcher Android"), LAUNCHER_ANDROID);
    });

    it("merges legacy and current launcher rows and keeps them sorted by count", () => {
        const rows = parseOs([
            { os: "Windows", count: 5, percent: 5 },
            { os: "Launcher", count: 20, percent: 20.1 },
            { os: "Launcher Desktop", count: 70, percent: 69.9 },
        ]);
        assert.deepEqual(rows, [
            { os: LAUNCHER_DESKTOP, count: 90, percent: 90 },
            { os: "Windows", count: 5, percent: 5 },
        ]);
    });

    it("never mixes the Android browser with the Android launcher", () => {
        const rows = parseOs([
            { os: "Android", count: 23, percent: 50 },
            { os: "Launcher Android", count: 23, percent: 50 },
        ]);
        assert.equal(rows.length, 2);
        assert.equal(launcherClientPlatform("Android"), null);
        assert.equal(launcherClientPlatform(LAUNCHER_ANDROID), "Android");
        assert.equal(launcherClientPlatform(LAUNCHER_DESKTOP), "Desktop");
    });

    it("ignores keys inherited from Object.prototype", () => {
        assert.equal(launcherClientPlatform("constructor"), null);
        assert.equal(normalizeOsLabel("toString"), "toString");
    });

    it("splits launcher clients from browser downloads", () => {
        const byOs = parseDownloadStats(currentResponse)?.byGame["pokemon-anil"]?.byOs ?? [];
        const { launcher, browser } = splitByClient(byOs);
        assert.deepEqual(
            launcher.map(row => row.os),
            [LAUNCHER_DESKTOP, LAUNCHER_ANDROID],
        );
        assert.deepEqual(
            browser.map(row => row.os),
            ["Unknown", "Android", "Windows"],
        );
    });
});

describe("shareOf", () => {
    it("computes the share of the combined total", () => {
        assert.equal(shareOf(40, 50), 80);
        assert.equal(shareOf(0, 50), 0);
    });

    it("returns zero instead of NaN when there are no downloads", () => {
        assert.equal(shareOf(0, 0), 0);
    });
});

describe("versionStats", () => {
    it("sorts versions by count and computes the share of the platform total", () => {
        const versions = versionStats({
            totalDownloads: 50,
            byVersion: { "0.9.1-delta": 10, setup: 40 },
            topCountries: [],
        });
        assert.deepEqual(versions, [
            { version: "setup", count: 40, percent: 80 },
            { version: "0.9.1-delta", count: 10, percent: 20 },
        ]);
    });

    it("leaves out versions without downloads", () => {
        assert.deepEqual(versionStats({ totalDownloads: 0, byVersion: { setup: 0 }, topCountries: [] }), []);
    });
});
