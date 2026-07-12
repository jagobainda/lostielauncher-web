import { animate, stagger } from "animejs";

export function motionOK(): boolean {
    return window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
}

export function fadeInOnScroll(selector: string): void {
    if (!motionOK()) return;
    const els = document.querySelectorAll<HTMLElement>(selector);
    if (!els.length) return;

    els.forEach(el => (el.style.opacity = "0"));
    const io = new IntersectionObserver(
        entries => {
            for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                io.unobserve(entry.target);
                animate(entry.target, { opacity: [0, 1], translateY: [24, 0], duration: 700, ease: "outCubic" });
            }
        },
        { threshold: 0.15 },
    );
    els.forEach(el => io.observe(el));
}

export function staggerInOnScroll(containerSelector: string, itemSelector: string): void {
    if (!motionOK()) return;
    const container = document.querySelector<HTMLElement>(containerSelector);
    if (!container) return;
    const items = container.querySelectorAll<HTMLElement>(itemSelector);
    if (!items.length) return;

    items.forEach(el => (el.style.opacity = "0"));
    const io = new IntersectionObserver(
        entries => {
            if (!entries.some(e => e.isIntersecting)) return;
            io.disconnect();
            animate(items, {
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 600,
                delay: stagger(90),
                ease: "outCubic",
            });
        },
        { threshold: 0.15 },
    );
    io.observe(container);
}
