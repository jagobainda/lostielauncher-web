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

    path: string | null;
}

export function buildDonutSlices(
    entries: Record<string, number>,
    opts: { cx: number; cy: number; rOuter: number; rInner: number; othersLabel: string },
): DonutSlice[] {
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

    if (parts.length === 1) {
        const only = parts[0]!;
        return [{ label: only.label, value: only.value, percent: 100, color: only.color, path: null }];
    }

    const rMid = (opts.rOuter + opts.rInner) / 2;
    const padAngle = 2 / rMid;

    const slices: DonutSlice[] = [];
    let angle = -Math.PI / 2;
    for (const part of parts) {
        const sweep = (part.value / total) * Math.PI * 2;
        const start = angle + padAngle / 2;
        const end = angle + sweep - padAngle / 2;
        angle += sweep;
        slices.push({
            label: part.label,
            value: part.value,
            percent: (part.value / total) * 100,
            color: part.color,
            path: end > start ? annularSectorPath(opts.cx, opts.cy, opts.rOuter, opts.rInner, start, end) : "",
        });
    }
    return slices;
}

function annularSectorPath(cx: number, cy: number, rO: number, rI: number, start: number, end: number): string {
    const largeArc = end - start > Math.PI ? 1 : 0;
    const p = (r: number, a: number) => `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
    return [
        `M ${p(rO, start)}`,
        `A ${rO} ${rO} 0 ${largeArc} 1 ${p(rO, end)}`,
        `L ${p(rI, end)}`,
        `A ${rI} ${rI} 0 ${largeArc} 0 ${p(rI, start)}`,
        "Z",
    ].join(" ");
}
