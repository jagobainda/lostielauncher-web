import { isObject, type LauncherPlatform } from "./downloads.ts";
import { fetchJson } from "./launcherCatalog.ts";

export const GITHUB_URL = "https://github.com/jagobainda/LostieLauncher";
export const INSTALLER_URL = "https://ericlostie-launcher.jagoba.dev/public/installer/LostieLauncher-win-Setup.exe";
export const RELEASES_URL = `${GITHUB_URL}/releases/latest`;
export const ANDROID_RELEASE_URL = "https://ericlostie-launcher.jagoba.dev/public/android/latest.json";

export interface AndroidRelease {
    versionName: string;
    downloadUrl: string;
}

export interface LauncherRelease {
    version: string | null;
    downloadUrl: string;
}

export type LauncherReleases = Record<LauncherPlatform, LauncherRelease>;

let latestVersion: Promise<string | null> | undefined;
let latestAndroidRelease: Promise<AndroidRelease | null> | undefined;

const fetchLatestVersion = async (): Promise<string | null> => {
    try {
        const res = await fetch("https://api.github.com/repos/jagobainda/LostieLauncher/releases/latest", {
            headers: { Accept: "application/vnd.github+json" },
        });
        if (!res.ok) return null;
        const data = (await res.json()) as { tag_name?: string };
        return data.tag_name ?? null;
    } catch {
        return null;
    }
};

export const getLatestVersion = (): Promise<string | null> => {
    latestVersion ??= fetchLatestVersion();
    return latestVersion;
};

export const parseAndroidRelease = (raw: unknown): AndroidRelease | null =>
    isObject(raw) &&
    typeof raw.versionName === "string" &&
    raw.versionName.trim() !== "" &&
    typeof raw.downloadUrl === "string" &&
    raw.downloadUrl.startsWith("https://")
        ? { versionName: raw.versionName.trim(), downloadUrl: raw.downloadUrl }
        : null;

export const getLatestAndroidRelease = (): Promise<AndroidRelease | null> => {
    latestAndroidRelease ??= fetchJson(ANDROID_RELEASE_URL).then(parseAndroidRelease);
    return latestAndroidRelease;
};

export const getLauncherReleases = async (): Promise<LauncherReleases> => {
    const [desktopVersion, android] = await Promise.all([getLatestVersion(), getLatestAndroidRelease()]);
    return {
        Desktop: { version: desktopVersion, downloadUrl: INSTALLER_URL },
        Android: { version: android?.versionName ?? null, downloadUrl: android?.downloadUrl ?? GITHUB_URL },
    };
};

export const formatDisplayVersion = (version: string | null): string => {
    const normalized = version?.trim().replace(/^[vV]+/, "");
    return normalized ? `v${normalized}` : "unknown";
};
