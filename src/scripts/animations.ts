import { animate, stagger } from "animejs";

const OBSERVER_OPTIONS: IntersectionObserverInit = { threshold: 0, rootMargin: "0px 0px -10% 0px" };

export const motionOK = (): boolean => window.matchMedia("(prefers-reduced-motion: no-preference)").matches;

const hide = (els: HTMLElement[]): void => els.forEach(el => (el.style.opacity = "0"));

const reveal = (els: HTMLElement[]): void => els.forEach(el => el.style.removeProperty("opacity"));

const scrolledPast = (entry: IntersectionObserverEntry): boolean => entry.boundingClientRect.bottom < 0;

export const fadeInOnScroll = (selector: string): void => {
    if (!motionOK()) return;
    const els = [...document.querySelectorAll<HTMLElement>(selector)];
    if (!els.length) return;

    hide(els);
    const io = new IntersectionObserver(entries => {
        for (const entry of entries) {
            const el = entry.target as HTMLElement;
            if (entry.isIntersecting) {
                io.unobserve(el);
                animate(el, { opacity: [0, 1], translateY: [24, 0], duration: 700, ease: "outCubic" });
            } else if (scrolledPast(entry)) {
                io.unobserve(el);
                reveal([el]);
            }
        }
    }, OBSERVER_OPTIONS);
    els.forEach(el => io.observe(el));
};

export const staggerInOnScroll = (containerSelector: string, itemSelector: string): void => {
    if (!motionOK()) return;
    const container = document.querySelector<HTMLElement>(containerSelector);
    if (!container) return;
    const items = [...container.querySelectorAll<HTMLElement>(itemSelector)];
    if (!items.length) return;

    hide(items);
    const io = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) {
            io.disconnect();
            animate(items, {
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 600,
                delay: stagger(90),
                ease: "outCubic",
            });
        } else if (entries.every(scrolledPast)) {
            io.disconnect();
            reveal(items);
        }
    }, OBSERVER_OPTIONS);
    io.observe(container);
};
