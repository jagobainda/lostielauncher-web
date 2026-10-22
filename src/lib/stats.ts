import { isObject, LAUNCHER_PLATFORMS, type LauncherPlatform } from "./downloads.ts";

export const MONTHLY_USERS_URL = "https://cdn.jagoba.dev/ericlostie-launcher/monthly-users.json";

export interface MonthlyUsersPoint {
    month: string;
    label: string;
    monthLabel: string;
    yearLabel: string;
    users: number;
}

export interface MonthlyUsersStats {
    points: MonthlyUsersPoint[];
    latest: MonthlyUsersPoint;
    peak: MonthlyUsersPoint;
    average: number;
    averageYear: string;
    // Only months measured per platform; the total is not their sum, since an IP can use both
    byPlatform: Partial<Record<LauncherPlatform, MonthlyUsersPoint[]>>;
}

const MONTH_KEY = /^\d{4}-(0[1-9]|1[0-2])$/;

const monthNameFormat = new Intl.DateTimeFormat("es-ES", { month: "short", timeZone: "UTC" });

const capitalize = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1);

const buildPoint = (month: string, users: number): MonthlyUsersPoint => {
    const [year = month, monthNumber = "1"] = month.split("-");
    const date = new Date(Date.UTC(Number(year), Number(monthNumber) - 1, 1));
    const monthLabel = capitalize(monthNameFormat.format(date).replace(".", ""));
    return { month, label: `${monthLabel} ${year}`, monthLabel, yearLabel: year, users };
};

const toPoints = (raw: unknown): MonthlyUsersPoint[] =>
    isObject(raw)
        ? Object.entries(raw)
              .filter(
                  (entry): entry is [string, number] =>
                      MONTH_KEY.test(entry[0]) && typeof entry[1] === "number" && Number.isFinite(entry[1]),
              )
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([month, users]) => buildPoint(month, users))
        : [];

export const parseMonthlyUsers = (raw: unknown): MonthlyUsersStats | null => {
    const points = toPoints(raw);
    const latest = points.at(-1);
    if (!isObject(raw) || !latest) return null;

    const peak = points.reduce((best, point) => (point.users > best.users ? point : best), latest);

    const currentYear = points.filter(point => point.yearLabel === latest.yearLabel);
    const average = Math.round(currentYear.reduce((sum, point) => sum + point.users, 0) / currentYear.length);

    const platforms = isObject(raw.byPlatform) ? raw.byPlatform : {};
    const byPlatform = Object.fromEntries(
        LAUNCHER_PLATFORMS.flatMap(platform => {
            const series = toPoints(platforms[platform]);
            return series.length > 0 ? [[platform, series] as const] : [];
        }),
    );

    return { points, latest, peak, average, averageYear: latest.yearLabel, byPlatform };
};

export const getMonthlyUsers = async (): Promise<MonthlyUsersStats | null> => {
    try {
        const res = await fetch(MONTHLY_USERS_URL, { headers: { Accept: "application/json" } });
        if (!res.ok) return null;
        return parseMonthlyUsers(await res.json());
    } catch {
        return null;
    }
};

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

export const formatGameName = (slug: string): string => {
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
};

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
    "Equatorial Guinea": "gq",
    Estonia: "ee",
    Finland: "fi",
    France: "fr",
    Georgia: "ge",
    Germany: "de",
    Greece: "gr",
    Guinea: "gn",
    "Guinea-Bissau": "gw",
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
    "Papua New Guinea": "pg",
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

export const countryCode = (country: string): string | null => COUNTRY_CODES[country.trim()] ?? null;

const OS_ICONS: Record<string, string> = {
    "launcher desktop": "pixelarticons:monitor",
    "launcher android": "pixelarticons:smartphone",
    windows: "pixelarticons:app-windows",
    chromeos: "pixelarticons:google-chrome",
    linux: "pixelarticons:linux",
    mac: "pixelarticons:apple",
    macos: "pixelarticons:apple",
    ios: "pixelarticons:apple",
    ipados: "pixelarticons:apple",
    android: "pixelarticons:android",
};

export const osIcon = (os: string): string => OS_ICONS[os.trim().toLowerCase()] ?? "pixelarticons:circle-question";

const numberFormat = new Intl.NumberFormat("es-ES");

export const formatNumber = (value: number): string => numberFormat.format(value);

export const formatGeneratedAt = (iso: string): string => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return new Intl.DateTimeFormat("es-ES", {
        dateStyle: "long",
        timeStyle: "short",
        timeZone: "Europe/Madrid",
    }).format(date);
};
