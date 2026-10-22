export const STATS_URL = "https://ericlostie-launcher.jagoba.dev/stats/downloads.json";

export interface CountryStat {
    country: string;
    count: number;
    percent: number;
}

export interface OsStat {
    os: string;
    count: number;
    percent: number;
}

export interface VersionStat {
    version: string;
    count: number;
    percent: number;
}

export interface DownloadBreakdown {
    totalDownloads: number;
    byVersion: Record<string, number>;
    topCountries: CountryStat[];
}

export interface GameDownloads extends DownloadBreakdown {
    byOs: OsStat[];
}

// The platform is the kind of file downloaded (Windows installers vs APK), not the downloader's OS
export const LAUNCHER_PLATFORMS = ["Desktop", "Android"] as const;
export type LauncherPlatform = (typeof LAUNCHER_PLATFORMS)[number];

export interface LauncherDownloads extends DownloadBreakdown {
    // null on responses that predate the split: the aggregate is never broken down by guesswork
    byPlatform: Partial<Record<LauncherPlatform, DownloadBreakdown>> | null;
}

export interface DownloadStats {
    byGame: Record<string, GameDownloads>;
    byLauncher: LauncherDownloads;
    generatedAt: string | null;
}

export const LAUNCHER_DESKTOP = "Launcher Desktop";
export const LAUNCHER_ANDROID = "Launcher Android";

// Launcher clients, by the label the stats use for them. "Android" alone is a browser download, not the launcher.
const LAUNCHER_CLIENTS = new Map<string, LauncherPlatform>([
    [LAUNCHER_DESKTOP, "Desktop"],
    [LAUNCHER_ANDROID, "Android"],
]);

// Before Android existed, the Windows launcher was reported as plain "Launcher"
const LEGACY_OS_LABELS = new Map([["Launcher", LAUNCHER_DESKTOP]]);

export const normalizeOsLabel = (os: string): string => {
    const label = os.trim();
    return LEGACY_OS_LABELS.get(label) ?? label;
};

export const launcherClientPlatform = (os: string): LauncherPlatform | null => LAUNCHER_CLIENTS.get(os) ?? null;

export const splitByClient = (byOs: OsStat[]): { launcher: OsStat[]; browser: OsStat[] } => ({
    launcher: byOs.filter(row => launcherClientPlatform(row.os) !== null),
    browser: byOs.filter(row => launcherClientPlatform(row.os) === null),
});

export const shareOf = (part: number, total: number): number => (total > 0 ? (part / total) * 100 : 0);

export const versionStats = (breakdown: DownloadBreakdown): VersionStat[] =>
    Object.entries(breakdown.byVersion)
        .filter(([, count]) => count > 0)
        .sort(([, a], [, b]) => b - a)
        .map(([version, count]) => ({ version, count, percent: shareOf(count, breakdown.totalDownloads) }));

type JsonObject = Record<string, unknown>;

export const isObject = (value: unknown): value is JsonObject =>
    typeof value === "object" && value !== null && !Array.isArray(value);

const isCount = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value) && value >= 0;

const roundPercent = (value: number): number => Math.round(value * 100) / 100;

const parseVersions = (raw: unknown): Record<string, number> =>
    isObject(raw)
        ? Object.fromEntries(Object.entries(raw).filter((entry): entry is [string, number] => isCount(entry[1])))
        : {};

const parseCountries = (raw: unknown): CountryStat[] =>
    Array.isArray(raw)
        ? raw.flatMap(item =>
              isObject(item) && typeof item.country === "string" && isCount(item.count) && isCount(item.percent)
                  ? [{ country: item.country, count: item.count, percent: item.percent }]
                  : [],
          )
        : [];

export const parseOs = (raw: unknown): OsStat[] => {
    if (!Array.isArray(raw)) return [];
    const merged = new Map<string, OsStat>();
    for (const item of raw) {
        if (!isObject(item) || typeof item.os !== "string" || !isCount(item.count) || !isCount(item.percent)) continue;
        const os = normalizeOsLabel(item.os);
        const prev = merged.get(os);
        merged.set(os, {
            os,
            count: (prev?.count ?? 0) + item.count,
            percent: roundPercent((prev?.percent ?? 0) + item.percent),
        });
    }
    return [...merged.values()].sort((a, b) => b.count - a.count);
};

const parseBreakdown = (raw: unknown): DownloadBreakdown | null =>
    isObject(raw) && isCount(raw.totalDownloads)
        ? {
              totalDownloads: raw.totalDownloads,
              byVersion: parseVersions(raw.byVersion),
              topCountries: parseCountries(raw.topCountries),
          }
        : null;

const parseByPlatform = (raw: unknown): LauncherDownloads["byPlatform"] => {
    if (!isObject(raw)) return null;
    const entries = LAUNCHER_PLATFORMS.flatMap(platform => {
        const breakdown = parseBreakdown(raw[platform]);
        return breakdown ? [[platform, breakdown] as const] : [];
    });
    return entries.length > 0 ? Object.fromEntries(entries) : null;
};

export const parseDownloadStats = (raw: unknown): DownloadStats | null => {
    if (!isObject(raw)) return null;
    const launcher = parseBreakdown(raw.byLauncher);
    if (!launcher) return null;

    const byGame = isObject(raw.byGame)
        ? Object.fromEntries(
              Object.entries(raw.byGame).flatMap(([slug, game]) => {
                  const breakdown = parseBreakdown(game);
                  return breakdown && isObject(game) ? [[slug, { ...breakdown, byOs: parseOs(game.byOs) }]] : [];
              }),
          )
        : {};

    return {
        byGame,
        byLauncher: {
            ...launcher,
            byPlatform: parseByPlatform(isObject(raw.byLauncher) ? raw.byLauncher.byPlatform : null),
        },
        generatedAt: typeof raw.generatedAt === "string" ? raw.generatedAt : null,
    };
};

export const getDownloadStats = async (): Promise<DownloadStats | null> => {
    try {
        const res = await fetch(STATS_URL, { headers: { Accept: "application/json" } });
        if (!res.ok) return null;
        return parseDownloadStats(await res.json());
    } catch {
        return null;
    }
};
