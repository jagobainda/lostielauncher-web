import { GITHUB_URL, INSTALLER_URL } from "./launcher";

export const SITE_URL = "https://lostielauncher.jagoba.dev";

export function softwareApplicationSchema(opts: {
    description: string;
    inLanguage: string;
    version: string | null;
}): object {
    return {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "LostieLauncher",
        description: opts.description,
        inLanguage: opts.inLanguage,
        operatingSystem: "Windows",
        applicationCategory: "GameApplication",
        downloadUrl: INSTALLER_URL,
        url: SITE_URL,
        sameAs: [GITHUB_URL],
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        ...(opts.version ? { softwareVersion: opts.version.replace(/^v/, "") } : {}),
    };
}
