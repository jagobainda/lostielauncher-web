// Palettes copied from the launcher themes (desktop Themes/*.xaml, Android ui/theme/Palettes.kt): both apps share them
export interface LauncherTheme {
    name: string;
    primaryBg: string;
    secondaryBg: string;
    tertiaryBg: string;
    primaryFg: string;
    primaryFgHover: string;
    primaryFgPressed: string;
    secondaryFg: string;
    secondaryFgDim: string;
    success: string;
    // Light themes darken their overlays instead of lightening them
    overlay: "#ffffff" | "#000000";
}

export const LAUNCHER_THEMES: LauncherTheme[] = [
    {
        name: "Volcarona",
        primaryBg: "#4d4949",
        secondaryBg: "#3a3737",
        tertiaryBg: "#2e2c2c",
        primaryFg: "#f08058",
        primaryFgHover: "#d06038",
        primaryFgPressed: "#b04020",
        secondaryFg: "#f3f7fa",
        secondaryFgDim: "#88f3f7fa",
        success: "#2e7d32",
        overlay: "#ffffff",
    },
    {
        name: "Zoroark",
        primaryBg: "#2c2933",
        secondaryBg: "#211e2a",
        tertiaryBg: "#181620",
        primaryFg: "#c42d3f",
        primaryFgHover: "#a82435",
        primaryFgPressed: "#8c1c2a",
        secondaryFg: "#f5ede0",
        secondaryFgDim: "#88f5ede0",
        success: "#2e7d32",
        overlay: "#ffffff",
    },
    {
        name: "Infernape",
        primaryBg: "#4a3535",
        secondaryBg: "#3a2828",
        tertiaryBg: "#2e1f1f",
        primaryFg: "#cf4f51",
        primaryFgHover: "#b83a3c",
        primaryFgPressed: "#f2d848",
        secondaryFg: "#f5e8d8",
        secondaryFgDim: "#99f5e8d8",
        success: "#2e7d32",
        overlay: "#ffffff",
    },
    {
        name: "Torterra",
        primaryBg: "#3a3020",
        secondaryBg: "#2c2418",
        tertiaryBg: "#221c12",
        primaryFg: "#5a9e42",
        primaryFgHover: "#447a30",
        primaryFgPressed: "#8bc34a",
        secondaryFg: "#e8dcc8",
        secondaryFgDim: "#99e8dcc8",
        success: "#2e7d32",
        overlay: "#ffffff",
    },
    {
        name: "Empoleon",
        primaryBg: "#252e38",
        secondaryBg: "#1c242d",
        tertiaryBg: "#141b22",
        primaryFg: "#3a82c4",
        primaryFgHover: "#2a68a0",
        primaryFgPressed: "#6ab0e8",
        secondaryFg: "#dce8f0",
        secondaryFgDim: "#99dce8f0",
        success: "#2e7d32",
        overlay: "#ffffff",
    },
    {
        name: "Mewtwo",
        primaryBg: "#342e4a",
        secondaryBg: "#272238",
        tertiaryBg: "#1e1a2c",
        primaryFg: "#c060f0",
        primaryFgHover: "#9040cc",
        primaryFgPressed: "#40e0d0",
        secondaryFg: "#ede8ff",
        secondaryFgDim: "#99ede8ff",
        success: "#2e7d32",
        overlay: "#ffffff",
    },
    {
        name: "Cefireon",
        primaryBg: "#ffefd3",
        secondaryBg: "#e8a772",
        tertiaryBg: "#ffefd3",
        primaryFg: "#3ecfcf",
        primaryFgHover: "#343434",
        primaryFgPressed: "#f5e653",
        secondaryFg: "#343434",
        secondaryFgDim: "#88343434",
        success: "#78c878",
        overlay: "#000000",
    },
    {
        name: "Sylveon",
        primaryBg: "#fde8f0",
        secondaryBg: "#f0b0cc",
        tertiaryBg: "#fde8f0",
        primaryFg: "#5aaad8",
        primaryFgHover: "#3888b8",
        primaryFgPressed: "#1868a0",
        secondaryFg: "#3a2030",
        secondaryFgDim: "#883a2030",
        success: "#3aaa6a",
        overlay: "#000000",
    },
    {
        name: "Astrem",
        primaryBg: "#eef3ff",
        secondaryBg: "#aec4ec",
        tertiaryBg: "#eef3ff",
        primaryFg: "#2255cc",
        primaryFgHover: "#1844aa",
        primaryFgPressed: "#0f3388",
        secondaryFg: "#141820",
        secondaryFgDim: "#88141820",
        success: "#3aaa6a",
        overlay: "#000000",
    },
    {
        name: "Auretoskos",
        primaryBg: "#3b3838",
        secondaryBg: "#2b2929",
        tertiaryBg: "#1e1c1c",
        primaryFg: "#f0b020",
        primaryFgHover: "#cc9010",
        primaryFgPressed: "#a87008",
        secondaryFg: "#f0eded",
        secondaryFgDim: "#88f0eded",
        success: "#2e7d32",
        overlay: "#ffffff",
    },
];

export const DEFAULT_THEME = LAUNCHER_THEMES[0]!;

export const LAUNCHER_SOCIALS = [
    { icon: "simple-icons:twitch", label: "Twitch", href: "https://www.twitch.tv/ericlostie" },
    { icon: "simple-icons:youtube", label: "YouTube", href: "https://www.youtube.com/@EricLostie" },
    { icon: "simple-icons:x", label: "Twitter / X", href: "https://x.com/Eric_Lostie" },
];

// XAML and Compose write alpha first (#AARRGGBB); CSS expects it last
const cssColor = (hex: string): string => (hex.length === 9 ? `#${hex.slice(3)}${hex.slice(1, 3)}` : hex);

const OVERLAY_ALPHAS = { subtle: "1a", light: "22", muted: "33", medium: "55", strong: "88" };

// Fixed colours both apps hard-code outside their themes (Android ui/theme/Tokens.kt)
const FIXED_COLORS = {
    "notification-info": "#4caf50",
    "notification-warning": "#ffc107",
    "notification-exclamation": "#f44336",
    "window-close": "#e81123",
    "popup-shadow": "#0000004d",
};

export const themeStyle = (theme: LauncherTheme): string =>
    [
        ...[
            ["primary-bg", theme.primaryBg],
            ["secondary-bg", theme.secondaryBg],
            ["tertiary-bg", theme.tertiaryBg],
            ["primary-fg", theme.primaryFg],
            ["primary-fg-hover", theme.primaryFgHover],
            ["primary-fg-pressed", theme.primaryFgPressed],
            ["secondary-fg", theme.secondaryFg],
            ["secondary-fg-dim", theme.secondaryFgDim],
            ["success", theme.success],
        ].map(([name, value]) => [name, cssColor(value ?? "")]),
        ...Object.entries(OVERLAY_ALPHAS).map(([level, alpha]) => [`overlay-${level}`, `${theme.overlay}${alpha}`]),
        ...Object.entries(FIXED_COLORS),
    ]
        .map(([name, value]) => `--lt-${name}:${value}`)
        .join(";");

export const formatGameSize = (sizeGb: number): string =>
    sizeGb >= 1 ? `${Number(sizeGb.toFixed(1))} GB` : `${Math.round(sizeGb * 1024)} MB`;

export const formatFeedDate = (date: string, locale: string, year = false): string => {
    const value = new Date(date);
    return `${String(value.getDate()).padStart(2, "0")} ${value.toLocaleString(locale, { month: "short" })}${year ? ` ${value.getFullYear()}` : ""}`;
};

export const replicaLinkSegments = (text: string): { text: string; href?: string }[] => {
    const expression =
        /https:\/\/\S+|(?<![\w@./-])(?:www\.[\w-]+(?:\.[\w-]+)+|(?:[\w-]+\.)+(?:com|net|org|es|eu|io|gg|dev|app|me|co|tv|info)\b)(?:\/\S*)?/gi;
    const segments: { text: string; href?: string }[] = [];
    let offset = 0;
    for (const match of text.matchAll(expression)) {
        const candidate = match[0].replace(/[.,;:!?)\]"']+$/, "");
        if (!candidate) continue;
        const href = candidate.toLowerCase().startsWith("https://") ? candidate : `https://${candidate}`;
        try {
            const url = new URL(href);
            if (url.protocol !== "https:" || url.username || url.password) continue;
            if (match.index > offset) segments.push({ text: text.slice(offset, match.index) });
            segments.push({ text: candidate, href: url.href });
            offset = match.index + candidate.length;
        } catch {
            continue;
        }
    }
    if (offset < text.length) segments.push({ text: text.slice(offset) });
    return segments;
};
