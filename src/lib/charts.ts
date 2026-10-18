export const CHART_SERIES = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
    "var(--chart-6)",
] as const;

export const CHART_OTHER = "var(--chart-other)";

export interface DonutSlice {
    label: string;
    value: number;
    percent: number;
    color: string;
    // Union of 1×1 grid cells; empty when the slice is too thin to own a whole pixel
    cells: string;
}

const TAU = Math.PI * 2;

// Ring drawn on a coarse pixel grid: a cell belongs to the slice whose angular range holds its centre
export const buildDonutSlices = (
    entries: Record<string, number>,
    opts: { grid: number; rOuter: number; rInner: number; othersLabel: string },
): DonutSlice[] => {
    const sorted = Object.entries(entries)
        .filter(([, value]) => value > 0)
        .sort((a, b) => b[1] - a[1]);

    let parts: { label: string; value: number; color: string }[];
    if (sorted.length > CHART_SERIES.length) {
        const head = sorted.slice(0, CHART_SERIES.length - 1);
        const tail = sorted.slice(CHART_SERIES.length - 1);
        parts = [
            ...head.map(([label, value], i) => ({ label, value, color: CHART_SERIES[i] as string })),
            { label: opts.othersLabel, value: tail.reduce((sum, [, v]) => sum + v, 0), color: CHART_OTHER },
        ];
    } else {
        parts = sorted.map(([label, value], i) => ({ label, value, color: CHART_SERIES[i] as string }));
    }

    const total = parts.reduce((sum, p) => sum + p.value, 0);
    if (total <= 0) return [];

    let acc = 0;
    const ends = parts.map(part => (acc += (part.value / total) * TAU));
    const cells = parts.map(() => "");

    const centre = opts.grid / 2;
    for (let y = 0; y < opts.grid; y++) {
        for (let x = 0; x < opts.grid; x++) {
            const dx = x + 0.5 - centre;
            const dy = y + 0.5 - centre;
            const r = Math.hypot(dx, dy);
            if (r > opts.rOuter || r < opts.rInner) continue;

            // Clockwise from 12 o'clock, matching screen coordinates (y grows downwards)
            const angle = (Math.atan2(dy, dx) + Math.PI / 2 + TAU) % TAU;
            const index = ends.findIndex(end => angle < end);
            const slice = index === -1 ? parts.length - 1 : index;

            // Leave a one-pixel gap on each slice boundary so neighbouring colours stay readable
            if (parts.length > 1) {
                const start = slice === 0 ? 0 : ends[slice - 1]!;
                const nearest = Math.min(angle - start, ends[slice]! - angle);
                if (nearest * r < 0.5) continue;
            }
            cells[slice] += `M${x} ${y}h1v1h-1z`;
        }
    }

    return parts.map((part, i) => ({
        label: part.label,
        value: part.value,
        percent: (part.value / total) * 100,
        color: part.color,
        cells: cells[i]!,
    }));
};
