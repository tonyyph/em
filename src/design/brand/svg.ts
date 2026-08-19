/**
 * Turning brand geometry into standalone SVG.
 *
 * The app renders the marks in `react-native-svg`; the App Store, the native
 * launch screen and design handoff want files. Rather than maintain a second
 * copy of the artwork in `assets/`, everything under `assets/brand`,
 * `assets/icon`, `assets/splash` and `assets/texture` is generated from
 * `marks.ts` through this module — see `scripts/build-brand-assets.ts`.
 *
 * Pure string work, no filesystem and no React, so the drift check in
 * `__tests__/design/brandAssets.test.ts` can regenerate every file in memory
 * and compare it against what is committed.
 */

import { darkColors, lightColors, type ThemeColors } from "../palettes";
import {
  FIELD_VIEWBOX,
  MARK_VIEWBOX,
  contourField,
  emMark,
  groundLines,
  type AtmosphereLine,
  type Stroke
} from "./marks";

export type Box = { minX: number; minY: number; maxX: number; maxY: number };

const NUMBER = /-?\d*\.?\d+(?:e[-+]?\d+)?/gi;

/**
 * Bounding box of a stroked path, taken from its control points.
 *
 * A bezier is always contained by the convex hull of its control points, so
 * this over-estimates rather than under-estimates — exactly the direction an
 * icon safe-area check needs to err in. Half the stroke width is added on every
 * side because a stroke straddles its path.
 *
 * Only `M`/`C` appear in this system's path data, and both take plain
 * coordinate pairs, so pulling the numbers out in order is sufficient. Anything
 * with arcs would need a real parser.
 */
export const strokeBounds = (strokes: Stroke[]): Box => {
  const box: Box = {
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity
  };

  for (const stroke of strokes) {
    if (/[^MC\s\d.,eE+-]/.test(stroke.d)) {
      throw new Error(`strokeBounds only understands M/C paths, got: ${stroke.d}`);
    }

    const numbers = (stroke.d.match(NUMBER) ?? []).map(Number);
    const half = stroke.width / 2;

    for (let index = 0; index + 1 < numbers.length; index += 2) {
      const x = numbers[index];
      const y = numbers[index + 1];
      box.minX = Math.min(box.minX, x - half);
      box.maxX = Math.max(box.maxX, x + half);
      box.minY = Math.min(box.minY, y - half);
      box.maxY = Math.max(box.maxY, y + half);
    }
  }

  return box;
};

/** The mark's own extent on the 1024 canvas, including its stroke. */
export const emMarkBounds = (): Box => strokeBounds(emMark);

/**
 * The tightest square that contains the mark.
 *
 * Used as a viewBox wherever the mark is drawn at a size the caller chose —
 * a square keeps it from stretching, and fitting the square to the mark's own
 * bounds rather than to the 1024 canvas means `size={28}` puts 28 points of
 * actual ink on screen instead of 28 points of mostly-empty box.
 */
export const emMarkSquare = () => {
  const box = emMarkBounds();
  const side = Math.max(box.maxX - box.minX, box.maxY - box.minY);
  const x = (box.minX + box.maxX) / 2 - side / 2;
  const y = (box.minY + box.maxY) / 2 - side / 2;
  return { x, y, side, viewBox: `${round(x)} ${round(y)} ${round(side)} ${round(side)}` };
};

/**
 * How much of the tile the mark's bounding box fills.
 *
 * Below Apple's ~0.8 safe area with room to spare: an icon whose glyph runs to
 * the edge of the grid loses its corners to the superellipse mask, and this
 * mark's tilde is the first thing that would go.
 */
export const ICON_COVERAGE = 0.62;

/**
 * Places the mark on a tile: scaled to `coverage` of the canvas and centred on
 * its own bounding box rather than on its path origin, so the tilde's weight
 * above the `e` is accounted for and the mark sits optically centred.
 */
export const emMarkTransform = (coverage = ICON_COVERAGE, canvas = MARK_VIEWBOX) => {
  const box = emMarkBounds();
  const scale = (canvas * coverage) / Math.max(box.maxX - box.minX, box.maxY - box.minY);
  const centreX = (box.minX + box.maxX) / 2;
  const centreY = (box.minY + box.maxY) / 2;

  return {
    scale,
    /** SVG transform placing the scaled mark at the centre of the canvas. */
    transform:
      `translate(${round(canvas / 2 - centreX * scale)} ${round(canvas / 2 - centreY * scale)}) ` +
      `scale(${round(scale)})`
  };
};

const round = (value: number) => Math.round(value * 1000) / 1000;

const attrs = (values: Record<string, string | number | undefined>) =>
  Object.entries(values)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}="${value}"`)
    .join(" ");

const strokePath = (stroke: Stroke, color: string) =>
  `<path ${attrs({
    d: stroke.d,
    fill: "none",
    stroke: color,
    "stroke-width": stroke.width,
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    opacity: stroke.opacity
  })}/>`;

const fieldPath = (line: AtmosphereLine, colors: ThemeColors, isDark: boolean) => {
  const opacity = isDark ? line.darkOpacity : line.lightOpacity;
  if (opacity === 0) {
    return undefined;
  }
  return `<path ${attrs({
    d: line.d,
    fill: "none",
    stroke: colors.atmosphereLines[line.tone],
    "stroke-width": line.width,
    opacity: opacity === 1 ? undefined : opacity
  })}/>`;
};

const document = (
  viewBox: string,
  body: (string | undefined)[],
  extra?: Record<string, string>
) =>
  [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" ${attrs(extra ?? {})}>`,
    ...body.filter(Boolean).map((line) => `  ${line}`),
    "</svg>",
    ""
  ].join("\n");

/**
 * The master vector.
 *
 * Drawn in `currentColor` so a single file covers the oxblood, the dark-mode
 * rose and the monochrome cut — the brand mark stays one silhouette everywhere,
 * which is the whole argument for this direction over a coloured symbol.
 */
export const emMarkSvg = () =>
  document(
    emMarkSquare().viewBox,
    emMark.map((stroke) => strokePath(stroke, "currentColor")),
    { width: String(MARK_VIEWBOX), height: String(MARK_VIEWBOX), fill: "none" }
  );

export type IconVariant = "light" | "dark" | "tinted" | "adaptive";

/**
 * Android masks an adaptive icon down to roughly the centre 60% of the
 * foreground layer, and the shape of that mask is the launcher's choice, not
 * ours. The mark is drawn small enough that even a circular mask on a cramped
 * launcher never clips the tilde.
 */
const ADAPTIVE_COVERAGE = 0.42;

/**
 * A tile ready for rasterising.
 *
 * Only the light variant carries a ground. iOS composites its own backdrop
 * behind the dark and tinted appearances, and Android draws the adaptive
 * background layer from a colour, so a baked-in ground in any of those three
 * would either be thrown away or show as a seam a shade off the system's own.
 * The tinted cut is white because iOS re-colours it from the user's tint —
 * any hue in the file is discarded.
 */
export const iconSvg = (variant: IconVariant) => {
  const opaque = variant === "light";
  const colors = variant === "dark" ? darkColors : lightColors;
  const mark = variant === "tinted" ? "#FFFFFF" : colors.brandAction;
  const { transform } = emMarkTransform(
    variant === "adaptive" ? ADAPTIVE_COVERAGE : ICON_COVERAGE
  );

  return document(
    `0 0 ${MARK_VIEWBOX} ${MARK_VIEWBOX}`,
    [
      opaque
        ? `<rect width="${MARK_VIEWBOX}" height="${MARK_VIEWBOX}" fill="${colors.background}"/>`
        : undefined,
      opaque
        ? `<g>${groundLines
            .map((line) => strokePath(line, colors.atmosphereLines[0]))
            .join("")}</g>`
        : undefined,
      `<g transform="${transform}">`,
      ...emMark.map((stroke) => `  ${strokePath(stroke, mark)}`),
      "</g>"
    ],
    { width: String(MARK_VIEWBOX), height: String(MARK_VIEWBOX) }
  );
};

/**
 * The native launch mark: the glyph alone on transparency, because
 * `expo-splash-screen` paints the ground itself from `backgroundColor` and a
 * baked-in ground would show a seam wherever the two disagreed by a shade.
 */
export const splashMarkSvg = (variant: "light" | "dark") => {
  const colors = variant === "dark" ? darkColors : lightColors;
  const { transform } = emMarkTransform(0.78);

  return document(
    `0 0 ${MARK_VIEWBOX} ${MARK_VIEWBOX}`,
    [
      `<g transform="${transform}">`,
      ...emMark.map((stroke) => `  ${strokePath(stroke, colors.brandAction)}`),
      "</g>"
    ],
    { width: String(MARK_VIEWBOX), height: String(MARK_VIEWBOX) }
  );
};

/** The reusable contour texture, one file per theme. */
export const atmosphereFieldSvg = (variant: "light" | "dark") => {
  const isDark = variant === "dark";
  const colors = isDark ? darkColors : lightColors;

  return document(
    `0 0 ${FIELD_VIEWBOX.width} ${FIELD_VIEWBOX.height}`,
    contourField.map((line) => fieldPath(line, colors, isDark)),
    {
      width: String(FIELD_VIEWBOX.width),
      height: String(FIELD_VIEWBOX.height),
      preserveAspectRatio: "none"
    }
  );
};
