export const GITHUB_URL = "https://github.com/jagobainda/LostieLauncher";
export const INSTALLER_URL = "https://ericlostie-launcher.jagoba.dev/public/installer/LostieLauncher-win-Setup.exe";
export const RELEASES_URL = `${GITHUB_URL}/releases/latest`;

let latestVersion: Promise<string | null> | undefined;

export function getLatestVersion(): Promise<string | null> {
    latestVersion ??= fetchLatestVersion();
    return latestVersion;
}

async function fetchLatestVersion(): Promise<string | null> {
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
}
