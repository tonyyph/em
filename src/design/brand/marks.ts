/**
 * Brand geometry — the shapes, and nothing else.
 *
 * Every mark, texture and icon in the app is drawn from this file. It holds
 * only path data and the widths those paths are stroked at: no colour, no
 * React, no `react-native-svg`. That separation is what lets the same geometry
 * be rendered three ways without ever drifting — as a live component inside the
 * app, as a standalone `.svg` handed to design, and as the `.png` the App Store
 * and the native launch screen demand.
 *
 * Colour is deliberately absent. A phase stratum knows it is *the luteal
 * stratum*, not that it is `#6A5598`, so the same drawing comes out correct in
 * both themes by reading the active palette at render time.
 *
 * Keeping it free of `react-native` imports also keeps it inside reach of the
 * design-system tests, which run on `testEnvironment: "node"`.
 */

import type { PhaseName } from "../palettes";

/** Every mark is drawn on a square this size, so strokes stay comparable. */
export const MARK_VIEWBOX = 1024;

export type Stroke = {
  d: string;
  width: number;
  /** Defaults to 1 — only the supporting textures step below full strength. */
  opacity?: number;
};

/**
 * The mark: a contour ẽ.
 *
 * One stroke opens into an `e` whose counter is the protected inner space, and
 * a tilde floats above it drawn in the same bezier language as the atmosphere
 * that runs behind every screen. Two heavy strokes and one line is the entire
 * mark, which is why it survives being 20px tall in a notification.
 *
 * The tilde is narrower than the `e` and clears its bowl by a full stroke
 * width. That gap is the mark: sitting where a tilde naturally falls, the two
 * shapes fuse into a blob at icon sizes and the letter stops being a letter, so
 * the accent is lifted until it reads as a separate floating stroke at 40px —
 * the smallest size iOS ever draws an icon at outside a notification.
 */
export const emMark: Stroke[] = [
  {
    d: "M 652 588 C 560 578, 452 578, 372 590 C 352 470, 422 402, 512 402 C 608 402, 668 478, 664 562 C 660 652, 594 710, 498 708",
    width: 54
  },
  {
    d: "M 390.4 287.8 C 433.6 252.6, 475.2 263.8, 512 287.8 C 550.4 313.4, 587.2 321.4, 630.4 286.2",
    width: 38
  }
];

/**
 * The supporting texture: contours nesting upward into a bowl around a seed.
 *
 * This is the same object as the cycle dial on Today, which is the point — the
 * icon's texture and the app's hero are visibly one drawing. Rings are ellipses
 * rather than circles, and each is offset a little higher than the last, so the
 * nest reads as terrain seen from above rather than as a bullseye.
 */
export type ContourRing = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  width: number;
  opacity: number;
};

export const contourNest: ContourRing[] = [
  { cx: 512, cy: 528, rx: 338, ry: 314, width: 8, opacity: 0.28 },
  { cx: 512, cy: 512, rx: 256, ry: 234, width: 13, opacity: 0.5 },
  { cx: 512, cy: 494, rx: 176, ry: 158, width: 20, opacity: 0.86 }
];

/** The protected centre the nest is built around. */
export const contourSeed = { cx: 512, cy: 482, r: 56 };

/**
 * The seven phases as terrain.
 *
 * Ordered by the arc of a cycle rather than by the phase enum: menstrual at the
 * top, then the two modes that sit outside the cycle proper (pregnancy,
 * wellness) folded in where their colour belongs tonally. The order is a
 * drawing decision, so it lives here and not in `tokens.ts`.
 */
export const strataOrder: PhaseName[] = [
  "menstrual",
  "pregnancy",
  "ovulation",
  "follicular",
  "fertile",
  "wellness",
  "luteal"
];

export const STRATA_STROKE = 22;

export const phaseStrata: { phase: PhaseName; d: string }[] = [
  { phase: "menstrual", d: "M 178 402 C 320 376, 430 428, 560 402 C 684 378, 760 420, 846 402" },
  { phase: "pregnancy", d: "M 178 450 C 316 476, 436 424, 560 450 C 690 478, 762 428, 846 450" },
  { phase: "ovulation", d: "M 178 498 C 322 472, 428 524, 560 498 C 686 474, 758 516, 846 498" },
  { phase: "follicular", d: "M 178 546 C 318 572, 438 520, 560 546 C 688 572, 760 524, 846 546" },
  { phase: "fertile", d: "M 178 594 C 322 568, 430 620, 560 594 C 684 570, 762 612, 846 594" },
  { phase: "wellness", d: "M 178 642 C 318 668, 436 616, 560 642 C 690 668, 760 620, 846 642" },
  { phase: "luteal", d: "M 178 690 C 322 664, 428 716, 560 690 C 686 666, 758 708, 846 690" }
];

/** Where the seven strata gather — one warm point of light above the terrain. */
export const strataSeed = { cx: 512, cy: 286, r: 34 };

/**
 * Two lines that give the icon tile a horizon without asking to be noticed.
 * They run off both edges on purpose: terrain continues past the frame.
 */
export const groundLines: Stroke[] = [
  { d: "M -20 720 C 220 640, 360 800, 560 720 C 760 640, 880 760, 1044 690", width: 6, opacity: 0.14 },
  { d: "M -20 800 C 220 720, 360 880, 560 800 C 760 720, 880 840, 1044 770", width: 6, opacity: 0.1 }
];

/**
 * The atmosphere that runs behind every screen.
 *
 * Three contours and a wash that fades out of the top. Each line carries its
 * own opacity per theme: the texture that reads as "warm paper" by day reads as
 * "smudge" by night, so dark mode gets the same drawing at roughly half
 * strength rather than a different drawing.
 */
export const ATMOSPHERE_VIEWBOX = { width: 390, height: 280 };

export type AtmosphereLine = {
  d: string;
  width: number;
  /** Index into `colors.atmosphereLines`. */
  tone: 0 | 1 | 2;
  lightOpacity: number;
  darkOpacity: number;
};

export const atmosphereContours: AtmosphereLine[] = [
  {
    d: "M-10 62 C70 18 122 102 206 52 C280 8 335 46 402 14",
    width: 1.2,
    tone: 0,
    lightOpacity: 0.8,
    darkOpacity: 0.5
  },
  {
    d: "M-12 122 C62 86 116 148 194 112 C274 74 326 104 406 70",
    width: 0.9,
    tone: 1,
    lightOpacity: 0.65,
    darkOpacity: 0.4
  },
  {
    d: "M-8 188 C72 140 136 216 218 164 C296 114 340 158 404 124",
    width: 1,
    tone: 2,
    lightOpacity: 0.5,
    darkOpacity: 0.3
  }
];

/**
 * The tileable contour field — the atmosphere released from the top of a screen
 * so it can sit behind a full-bleed surface and be parallaxed. Drawn on a wide,
 * short viewBox and stretched, since a contour has no correct aspect ratio.
 */
export const FIELD_VIEWBOX = { width: 300, height: 150 };

export const contourField: AtmosphereLine[] = [
  {
    d: "M-6 30 C60 12 110 44 160 26 C220 6 260 30 306 12",
    width: 1.3,
    tone: 0,
    lightOpacity: 1,
    darkOpacity: 0.9
  },
  {
    d: "M-6 58 C60 40 110 72 160 54 C220 34 260 58 306 40",
    width: 1,
    tone: 1,
    lightOpacity: 1,
    darkOpacity: 0.9
  },
  {
    d: "M-6 92 C60 74 110 106 160 88 C220 68 260 92 306 74",
    width: 1.1,
    tone: 2,
    lightOpacity: 1,
    darkOpacity: 0.9
  },
  {
    d: "M-6 124 C60 106 110 138 160 120 C220 100 260 124 306 106",
    width: 0.9,
    tone: 0,
    lightOpacity: 0.85,
    darkOpacity: 0
  }
];

/**
 * The splash field — the same contours at phone scale, spaced so the mark at
 * the centre of the screen sits in the gap between the upper and lower bands.
 * The fourth line is light-only: in dark mode a fourth near-black stroke is
 * noise rather than atmosphere.
 */
export const SPLASH_VIEWBOX = { width: 390, height: 844 };

export const splashContours: AtmosphereLine[] = [
  {
    d: "M-10 250 C90 200 150 300 244 250 C330 205 360 250 402 220",
    width: 1.3,
    tone: 0,
    lightOpacity: 1,
    darkOpacity: 0.9
  },
  {
    d: "M-12 320 C80 275 150 360 236 315 C320 272 356 300 406 268",
    width: 1,
    tone: 1,
    lightOpacity: 1,
    darkOpacity: 0.9
  },
  {
    d: "M-8 600 C90 552 160 636 250 588 C330 546 360 580 404 552",
    width: 1.1,
    tone: 2,
    lightOpacity: 1,
    darkOpacity: 0.9
  },
  {
    d: "M-8 680 C90 632 160 716 250 668 C330 626 360 660 404 632",
    width: 1,
    tone: 2,
    lightOpacity: 0.7,
    darkOpacity: 0
  }
];

/**
 * A corner ornament for cards and empty states — the nest, cropped by the frame
 * so only the top-right quadrant of the rings shows.
 */
export const cornerContour: ContourRing[] = [
  { cx: 255, cy: 20, rx: 70, ry: 44, width: 1.4, opacity: 1 },
  { cx: 255, cy: 20, rx: 46, ry: 28, width: 1.4, opacity: 1 },
  { cx: 255, cy: 20, rx: 24, ry: 14, width: 1.4, opacity: 1 }
];
