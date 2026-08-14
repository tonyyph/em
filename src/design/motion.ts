/**
 * Motion vocabulary.
 *
 * `tokens.ts` owns the raw quantities — how long, how springy. This file owns
 * the *intent*: which curve a movement should use and why, so a call site reads
 * as "this content is arriving" rather than "this content is cubic-bezier(0.33,
 * 1, 0.68, 1)".
 *
 * Curves are stored as bezier control points rather than as Reanimated `Easing`
 * objects on purpose. Jest here runs on `testEnvironment: "node"` without the
 * Expo preset, so a `react-native-reanimated` import in the design layer would
 * put the whole token system out of reach of the design-system tests. Callers
 * build the easing themselves with `Easing.bezier(...curves.enter)`.
 */

export type BezierCurve = readonly [number, number, number, number];

export const curves = {
  /** Content arriving. Decelerates into place — fast first, settled last. */
  enter: [0.33, 1, 0.68, 1],
  /** Content leaving. Accelerates away; nobody needs to watch an exit finish. */
  exit: [0.32, 0, 0.67, 0],
  /** A value changing in place. Symmetric, unhurried, no drama. */
  settle: [0.45, 0, 0.55, 1],
  /**
   * The one thing on screen the user should notice. Overshoots slightly past
   * its target before resolving — the y2 above 1 is the overshoot, and it is
   * deliberately small: a bouncy health app reads as a toy.
   */
  emphasis: [0.34, 1.3, 0.64, 1]
} as const satisfies Record<string, BezierCurve>;

export type CurveName = keyof typeof curves;

/**
 * Staggered entrance.
 *
 * Each item in a sequence waits `STAGGER_STEP` longer than the one before it,
 * which is what makes a screen read as unfolding rather than appearing. The cap
 * is the important part: uncapped, a twenty-item symptom list would take 1.1
 * seconds to finish arriving, and the last few items would feel broken rather
 * than choreographed. After `STAGGER_CAP` items everything lands together.
 */
export const STAGGER_STEP = 55;
export const STAGGER_CAP = 6;

export const staggerDelay = (index: number) =>
  Math.max(0, Math.min(index, STAGGER_CAP)) * STAGGER_STEP;

/** Distance a revealed element rises through, in px. Small enough to read as settling, not sliding. */
export const REVEAL_RISE = 10;
