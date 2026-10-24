import { LAUNCHER_PLATFORMS, type LauncherPlatform } from "../lib/downloads";

export const PLATFORM_STORAGE_KEY = "lostie-platform";

export const currentPlatform = (): LauncherPlatform =>
    document.documentElement.dataset.platform === "Android" ? "Android" : "Desktop";

export const choosePlatform = (value: string | undefined): void => {
    const platform = LAUNCHER_PLATFORMS.find(p => p === value);
    if (!platform) return;
    document.documentElement.dataset.platform = platform;
    try {
        localStorage.setItem(PLATFORM_STORAGE_KEY, platform);
    } catch {}
};
