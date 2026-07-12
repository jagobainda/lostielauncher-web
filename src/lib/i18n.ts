export const LOCALES = ["es", "en", "fr", "pt"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "es";
export const SECONDARY_LOCALES = LOCALES.filter(l => l !== DEFAULT_LOCALE);

export const LOCALE_LABELS: Record<Locale, string> = {
    es: "Español",
    en: "English",
    fr: "Français",
    pt: "Português",
};

export function localeHref(locale: Locale): string {
    return locale === DEFAULT_LOCALE ? "/" : `/${locale}/`;
}

export function localeFromPath(pathname: string): Locale {
    const segment = pathname.split("/").filter(Boolean)[0];
    return (LOCALES as readonly string[]).includes(segment ?? "") ? (segment as Locale) : DEFAULT_LOCALE;
}

export function landingAlternates(): { hreflang: string; href: string }[] {
    return [
        ...LOCALES.map(locale => ({ hreflang: locale, href: localeHref(locale) })),
        { hreflang: "x-default", href: localeHref(DEFAULT_LOCALE) },
    ];
}
