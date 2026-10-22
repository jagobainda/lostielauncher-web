import { animate, stagger, steps } from "animejs";

// Pixel-art motion never interpolates: step counts are chosen so each frame moves exactly 4px.
const FADE_IN = {
    pixel: { duration: 480, ease: steps(6) },
    smooth: { duration: 700, ease: "outCubic" },
};

const STAGGER_IN = {
    pixel: { duration: 400, ease: steps(5) },
    smooth: { duration: 600, ease: "outCubic" },
};

type Motion = keyof typeof FADE_IN;

const OBSERVER_OPTIONS: IntersectionObserverInit = { threshold: 0, rootMargin: "0px 0px -10% 0px" };

export const motionOK = (): boolean => window.matchMedia("(prefers-reduced-motion: no-preference)").matches;

const hide = (els: HTMLElement[]): void => els.forEach(el => (el.style.opacity = "0"));

const reveal = (els: HTMLElement[]): void => els.forEach(el => el.style.removeProperty("opacity"));

const scrolledPast = (entry: IntersectionObserverEntry): boolean => entry.boundingClientRect.bottom < 0;

const onEachInView = (els: HTMLElement[], enter: (el: HTMLElement) => void, skip: (el: HTMLElement) => void): void => {
    const io = new IntersectionObserver(entries => {
        for (const entry of entries) {
            const el = entry.target as HTMLElement;
            if (entry.isIntersecting) {
                io.unobserve(el);
                enter(el);
            } else if (scrolledPast(entry)) {
                io.unobserve(el);
                skip(el);
            }
        }
    }, OBSERVER_OPTIONS);
    els.forEach(el => io.observe(el));
};

export const fadeInOnScroll = (selector: string, motion: Motion = "pixel"): void => {
    if (!motionOK()) return;
    const els = [...document.querySelectorAll<HTMLElement>(selector)];
    if (!els.length) return;

    hide(els);
    onEachInView(
        els,
        el => animate(el, { opacity: [0, 1], translateY: [24, 0], ...FADE_IN[motion] }),
        el => reveal([el]),
    );
};

export const staggerInOnScroll = (containerSelector: string, itemSelector: string, motion: Motion = "pixel"): void => {
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
                delay: stagger(90),
                ...STAGGER_IN[motion],
            });
        } else if (entries.every(scrolledPast)) {
            io.disconnect();
            reveal(items);
        }
    }, OBSERVER_OPTIONS);
    io.observe(container);
};

export const countUpOnScroll = (selector: string, format: (value: number) => string): void => {
    if (!motionOK()) return;
    const els = [...document.querySelectorAll<HTMLElement>(selector)];
    if (!els.length) return;

    const target = (el: HTMLElement): number => Number(el.dataset.countUp ?? "0");
    const show = (el: HTMLElement, value: number): void => {
        el.textContent = format(value);
    };

    els.forEach(el => show(el, 0));
    onEachInView(
        els,
        el => {
            const state = { value: 0 };
            animate(state, {
                value: target(el),
                duration: 900,
                ease: "outCubic",
                onUpdate: () => show(el, Math.round(state.value)),
            });
        },
        el => show(el, target(el)),
    );
};
