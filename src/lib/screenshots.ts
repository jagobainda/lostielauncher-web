export interface Screenshot {
    theme: string;
    src: string;
}

const THEMES = [
    "Volcarona",
    "Zoroark",
    "Infernape",
    "Torterra",
    "Empoleon",
    "Mewtwo",
    "Cefireon",
    "Sylveon",
    "Astrem",
    "Auretoskos",
] as const;

export const SCREENSHOTS: Screenshot[] = THEMES.map(theme => ({
    theme,
    src: `/imgs/screenshots/${theme}.png`,
}));
