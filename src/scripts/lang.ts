const STORAGE_KEY = "lostie-lang";
const SUPPORTED = ["es", "en", "fr", "pt"];
const DEFAULT_LOCALE = "es";

const storedLocale = (): string | null => {
    try {
        return localStorage.getItem(STORAGE_KEY);
    } catch {
        return null;
    }
};

export const rememberLocale = (locale: string): void => {
    if (!SUPPORTED.includes(locale)) return;
    try {
        localStorage.setItem(STORAGE_KEY, locale);
    } catch {}
};

export const redirectToPreferredLocale = (currentLocale: string): void => {
    if (storedLocale()) return;
    const detected = (navigator.languages ?? [navigator.language])
        .map(l => l.slice(0, 2).toLowerCase())
        .find(l => SUPPORTED.includes(l));
    if (!detected || detected === currentLocale) return;
    window.location.replace(detected === DEFAULT_LOCALE ? "/" : `/${detected}/`);
};
