import { isObject } from "./downloads.ts";

const CDN_URL = "https://ericlostie-launcher.jagoba.dev";
export const CATALOG_URL = `${CDN_URL}/games/listado.json`;
export const HOME_FEED_URL = "https://cdn.jagoba.dev/ericlostie-launcher/homepage-notifications.json";
export const LAUNCHER_LOGO_URL = `${CDN_URL}/public/imgs/logo-launcher.png`;

export interface LauncherGame {
    id: string;
    name: string;
    version: string;
    sizeGb: number;
    logoUrl: string | null;
}

export type LocalizedText = Record<string, string>;

export interface HomeEntry {
    id: string;
    title: LocalizedText;
    body: LocalizedText;
    // News tag ("Release"...) or notification type ("Info"...), as the launcher receives it
    kind: string;
    date: string;
}

export interface HomeFeed {
    news: HomeEntry[];
    notifications: HomeEntry[];
}

// Games the replica pretends are installed, by catalogue id, with the version on disk: an older one shows an update
export const REPLICA_INSTALLED: Record<string, string> = {
    "6b49940d-5910-49e5-aab8-f933cd51c388": "v4.14.0",
    "8fb208ee-cab1-43d0-b9a0-8f4781af8cd0": "v2.10.0",
};

const isText = (value: unknown): value is string => typeof value === "string" && value.trim() !== "";

const parseLocalized = (raw: unknown): LocalizedText | null => {
    if (!isObject(raw)) return null;
    const entries = Object.entries(raw).filter((entry): entry is [string, string] => isText(entry[1]));
    return entries.length > 0 ? Object.fromEntries(entries) : null;
};

export const localized = (text: LocalizedText, locale: string): string => text[locale] ?? text.es ?? text.en ?? "";

export const parseCatalog = (raw: unknown): LauncherGame[] =>
    Array.isArray(raw)
        ? raw.flatMap(item =>
              isObject(item) &&
              isText(item.id) &&
              isText(item.nombre) &&
              isText(item.version) &&
              typeof item.pesoGB === "number"
                  ? [
                        {
                            id: item.id,
                            name: item.nombre,
                            version: item.version,
                            sizeGb: item.pesoGB,
                            // Only CDN-rooted paths: "@host" or ".host" would change the URL's host
                            logoUrl:
                                isText(item.logo) && item.logo.startsWith("/") && !item.logo.startsWith("//")
                                    ? `${CDN_URL}${item.logo}`
                                    : null,
                        },
                    ]
                  : [],
          )
        : [];

// The launcher hides entries past their expires_at, so the replica does the same as of the build date
const parseEntries = (raw: unknown, bodyKey: string, kindKey: string, now: Date): HomeEntry[] =>
    Array.isArray(raw)
        ? raw.flatMap(item => {
              if (!isObject(item) || !isText(item.id) || !isText(item.date)) return [];
              const title = parseLocalized(item.title);
              const body = parseLocalized(item[bodyKey]);
              const expired = isText(item.expires_at) && new Date(item.expires_at) < now;
              return title && body && !expired
                  ? [{ id: item.id, title, body, kind: isText(item[kindKey]) ? item[kindKey] : "", date: item.date }]
                  : [];
          })
        : [];

export const parseHomeFeed = (raw: unknown, now = new Date()): HomeFeed => ({
    news: isObject(raw) ? parseEntries(raw.news, "description", "tag", now) : [],
    notifications: isObject(raw) ? parseEntries(raw.notifications, "message", "type", now) : [],
});

export const fetchJson = async (url: string): Promise<unknown> => {
    try {
        const res = await fetch(url, { headers: { Accept: "application/json" } });
        return res.ok ? await res.json() : null;
    } catch {
        return null;
    }
};

let catalog: Promise<LauncherGame[]> | undefined;
let homeFeed: Promise<HomeFeed> | undefined;

export const getCatalog = (): Promise<LauncherGame[]> => {
    catalog ??= fetchJson(CATALOG_URL).then(parseCatalog);
    return catalog;
};

export const getHomeFeed = (): Promise<HomeFeed> => {
    homeFeed ??= fetchJson(HOME_FEED_URL).then(raw => parseHomeFeed(raw));
    return homeFeed;
};
