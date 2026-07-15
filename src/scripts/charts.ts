let tooltip: HTMLDivElement | null = null;

function getTooltip(): HTMLDivElement {
    if (tooltip) return tooltip;
    tooltip = document.createElement("div");
    tooltip.setAttribute("role", "status");
    Object.assign(tooltip.style, {
        position: "fixed",
        zIndex: "60",
        pointerEvents: "none",
        display: "none",
        padding: "0.4rem 0.6rem",
        borderRadius: "0.375rem",
        background: "var(--bg-tertiary)",
        border: "1px solid var(--overlay-light)",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
        font: "0.8rem/1.35 var(--font-sans, sans-serif)",
        color: "var(--text-color)",
        whiteSpace: "nowrap",
    });
    document.body.appendChild(tooltip);
    return tooltip;
}

function showTooltip(seg: Element, x: number, y: number): void {
    const el = getTooltip();

    el.replaceChildren();
    const value = document.createElement("strong");
    value.textContent = `${seg.getAttribute("data-value") ?? ""} · ${seg.getAttribute("data-percent") ?? ""}%`;
    const label = document.createElement("span");
    label.textContent = ` ${seg.getAttribute("data-label") ?? ""}`;
    label.style.color = "var(--text-dim)";
    el.append(value, label);

    el.style.display = "block";
    const rect = el.getBoundingClientRect();
    const left = Math.min(Math.max(x + 14, 8), window.innerWidth - rect.width - 8);
    const top = Math.min(Math.max(y - rect.height - 10, 8), window.innerHeight - rect.height - 8);
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
}

function hideTooltip(): void {
    if (tooltip) tooltip.style.display = "none";
}

function initRoot(root: HTMLElement): void {
    const segs = Array.from(root.querySelectorAll<SVGGraphicsElement>("[data-seg]"));
    const rows = Array.from(root.querySelectorAll<HTMLElement>("[data-legend-row]"));

    const setActive = (index: string | null): void => {
        for (const seg of segs) seg.classList.toggle("donut-dim", index !== null && seg.dataset.index !== index);
        for (const row of rows) row.classList.toggle("legend-active", index !== null && row.dataset.index === index);
    };

    for (const seg of segs) {
        const index = seg.dataset.index ?? null;
        seg.addEventListener("pointerenter", () => setActive(index));
        seg.addEventListener("pointermove", e => showTooltip(seg, e.clientX, e.clientY));
        seg.addEventListener("pointerleave", () => {
            setActive(null);
            hideTooltip();
        });
        seg.addEventListener("focus", () => {
            setActive(index);
            const box = seg.getBoundingClientRect();
            showTooltip(seg, box.left + box.width / 2, box.top);
        });
        seg.addEventListener("blur", () => {
            setActive(null);
            hideTooltip();
        });
    }

    for (const row of rows) {
        const index = row.dataset.index ?? null;
        row.addEventListener("pointerenter", () => setActive(index));
        row.addEventListener("pointerleave", () => setActive(null));
    }
}

export function initDonutCharts(): void {
    document.querySelectorAll<HTMLElement>("[data-donut-root]").forEach(initRoot);
}
