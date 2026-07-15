export const STATS_URL = "https://ericlostie-launcher.jagoba.dev/stats/downloads.json";

export interface CountryStat {
    country: string;
    count: number;
    percent: number;
}

export interface DownloadTarget {
    totalDownloads: number;
    byVersion: Record<string, number>;
    topCountries: CountryStat[];
}

export interface DownloadStats {
    byGame: Record<string, DownloadTarget>;
    byLauncher: DownloadTarget;
    generatedAt: string;
}

export async function getDownloadStats(): Promise<DownloadStats | null> {
    try {
        const res = await fetch(STATS_URL, { headers: { Accept: "application/json" } });
        if (!res.ok) return null;
        return (await res.json()) as DownloadStats;
    } catch {
        return null;
    }
}

const GAME_NAME_OVERRIDES: Record<string, string> = {
    "pokemon-z": "Pokémon Z",
    "pokemon-z-en": "Pokémon Z (EN)",
    "pokemon-z-fr": "Pokémon Z (FR)",
    "pokemon-z-especial": "Pokémon Z Especial",
    "pokemon-anil": "Pokémon Añil",
    "pokemon-iberia": "Pokémon Iberia",
    "pokemon-opalo": "Pokémon Ópalo",
    "pokemon-titan": "Pokémon Titán",
};

export function formatGameName(slug: string): string {
    const override = GAME_NAME_OVERRIDES[slug];
    if (override) return override;
    return slug
        .split("-")
        .map(part => {
            if (part === "pokemon") return "Pokémon";
            if (part.length <= 2) return part.toUpperCase();
            return part.charAt(0).toUpperCase() + part.slice(1);
        })
        .join(" ");
}

const COUNTRY_CODES: Record<string, string> = {
    Afghanistan: "af",
    Albania: "al",
    Algeria: "dz",
    Andorra: "ad",
    Angola: "ao",
    Argentina: "ar",
    Armenia: "am",
    Australia: "au",
    Austria: "at",
    Azerbaijan: "az",
    Bahrain: "bh",
    Bangladesh: "bd",
    Belarus: "by",
    Belgium: "be",
    Bolivia: "bo",
    "Bosnia and Herzegovina": "ba",
    Brazil: "br",
    Bulgaria: "bg",
    Cambodia: "kh",
    Cameroon: "cm",
    Canada: "ca",
    Chile: "cl",
    China: "cn",
    Colombia: "co",
    "Costa Rica": "cr",
    Croatia: "hr",
    Cuba: "cu",
    Cyprus: "cy",
    Czechia: "cz",
    "Czech Republic": "cz",
    Denmark: "dk",
    "Dominican Republic": "do",
    Ecuador: "ec",
    Egypt: "eg",
    "El Salvador": "sv",
    Estonia: "ee",
    Finland: "fi",
    France: "fr",
    Georgia: "ge",
    Germany: "de",
    Greece: "gr",
    Guatemala: "gt",
    Honduras: "hn",
    "Hong Kong": "hk",
    Hungary: "hu",
    Iceland: "is",
    India: "in",
    Indonesia: "id",
    Iran: "ir",
    Iraq: "iq",
    Ireland: "ie",
    Israel: "il",
    Italy: "it",
    Japan: "jp",
    Jordan: "jo",
    Kazakhstan: "kz",
    Kenya: "ke",
    Kuwait: "kw",
    Latvia: "lv",
    Lebanon: "lb",
    Lithuania: "lt",
    Luxembourg: "lu",
    Malaysia: "my",
    Malta: "mt",
    Mexico: "mx",
    Moldova: "md",
    Monaco: "mc",
    Mongolia: "mn",
    Montenegro: "me",
    Morocco: "ma",
    "The Netherlands": "nl",
    Netherlands: "nl",
    "New Zealand": "nz",
    Nicaragua: "ni",
    Nigeria: "ng",
    "North Macedonia": "mk",
    Norway: "no",
    Oman: "om",
    Pakistan: "pk",
    Panama: "pa",
    Paraguay: "py",
    Peru: "pe",
    Philippines: "ph",
    Poland: "pl",
    Portugal: "pt",
    Qatar: "qa",
    Romania: "ro",
    Russia: "ru",
    "Saudi Arabia": "sa",
    Serbia: "rs",
    Singapore: "sg",
    Slovakia: "sk",
    Slovenia: "si",
    "South Africa": "za",
    "South Korea": "kr",
    Spain: "es",
    "Sri Lanka": "lk",
    Sweden: "se",
    Switzerland: "ch",
    Taiwan: "tw",
    Thailand: "th",
    Tunisia: "tn",
    Turkey: "tr",
    Türkiye: "tr",
    Ukraine: "ua",
    "United Arab Emirates": "ae",
    "United Kingdom": "gb",
    "United States": "us",
    Uruguay: "uy",
    Uzbekistan: "uz",
    Venezuela: "ve",
    Vietnam: "vn",
};

export function countryCode(country: string): string | null {
    return COUNTRY_CODES[country.trim()] ?? null;
}

const numberFormat = new Intl.NumberFormat("es-ES");

export function formatNumber(value: number): string {
    return numberFormat.format(value);
}

export function formatGeneratedAt(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return new Intl.DateTimeFormat("es-ES", {
        dateStyle: "long",
        timeStyle: "short",
        timeZone: "Europe/Madrid",
    }).format(date);
}
