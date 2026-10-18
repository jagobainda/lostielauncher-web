// Each character of a sprite map is a palette key; "." is a transparent pixel.
export interface Sprite {
    map: string;
    palette: Record<string, string>;
}

export interface SpriteLayer {
    fill: string;
    d: string;
}

export const spriteLayers = ({ map, palette }: Sprite): { width: number; height: number; layers: SpriteLayer[] } => {
    const rows = map
        .trim()
        .split("\n")
        .map(row => row.trim());
    const paths = new Map<string, string>();
    rows.forEach((row, y) =>
        [...row].forEach((key, x) => {
            const fill = palette[key];
            if (key === "." || !fill) return;
            paths.set(fill, `${paths.get(fill) ?? ""}M${x} ${y}h1v1h-1z`);
        }),
    );
    return {
        width: Math.max(...rows.map(row => row.length)),
        height: rows.length,
        layers: [...paths].map(([fill, d]) => ({ fill, d })),
    };
};

export const SPARK: Sprite = {
    map: `
        ..A..
        .....
        A.A.A
        .....
        ..A..`,
    palette: { A: "var(--accent)" },
};

export const CLOUD: Sprite = {
    map: `
        ......CCCC.........
        ....CCCCCCCC.......
        ...CCCCCCCCCC.CCC..
        .CCCCCCCCCCCCCCCCC.
        CCCCCCCCCCCCCCCCCCC
        .CCCCCCCCCCCCCCCCC.`,
    palette: { C: "var(--overlay-subtle)" },
};
