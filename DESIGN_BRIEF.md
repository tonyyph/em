# Ẽm — Design Brief

You are a senior product designer and React Native engineer. Redesign the visual and
interaction layer of **Ẽm**, an Expo/React Native app for menstrual cycle, ovulation, pregnancy
and symptom tracking. The repo is at `/Users/tony/em`. Read the code before you design; every
constraint below is a fact about this codebase, not a preference.

## 1. Product

Ẽm helps someone understand their cycle without being lied to. Its differentiator is
**epistemic honesty**: it shows confidence levels beside predictions, widens to a date range
when cycles are irregular, and says plainly that fertility estimates are not contraception.
The design must make that honesty feel like care and craft, not like disclaimers.

Primary user: a woman tracking her cycle, in Vietnam or internationally. The brand name is
Vietnamese. Tone: calm, adult, unpatronising. No infantilising pastels, no flower confetti, no
emoji-driven UI, no "bestie" copy.

## 2. Aesthetic direction — the one thing to get right

Blend the two directions below into a single coherent system. This is the core creative
instruction; do not pick one and drop the other.

**Keep from the existing editorial / warm-paper identity:**
- The warm paper ground (`#FBF6EF` family) and warm brown-black ink (`#251C1E`), never pure
  white on pure black.
- The oxblood action colour `#7E3F46` as the brand voice — restrained, used sparingly.
- Editorial hierarchy: uppercase tracked eyebrow → large title → quiet supporting line.
- Hairline discipline and the printed-paper feel of the topographic contour texture in
  `src/components/common/Screen.tsx`.
- The seven-phase colour language, which is muted and earthy rather than candy-bright.

**Adopt from modern soft-clinical health apps:**
- Real, soft, warm-tinted elevation instead of borders doing all the work. `elevation.raised`
  already exists and is unused — make cards actually sit on the page.
- Larger, more consistent corner radii and more generous breathing room between blocks.
- Big, immediately legible hero numbers — `typography.heroMetric` (48/54) exists and is unused.
  Every screen should have one unambiguous "what does this mean right now" answer.
- Calmer information density: fewer things per screen, each one clearer.
- Warm, humanist letterforms and gentle motion that reassures rather than performs.

**The synthesis to aim for:** a health app that reads like a beautifully printed almanac —
paper warmth, editorial typography and restraint, combined with the clarity, softness and
confident data display of a well-made clinical product. Warm, quiet, precise, expensive-feeling.

**Explicitly avoid:** the generic 2020s health-app look (pure white cards, `#FF6B9D` pink,
lavender gradients, 32px radii everywhere, glassmorphism, neon accents, heavy drop shadows,
purple-blue gradient CTAs). If a screen would be indistinguishable from Flo or Clue, redo it.

## 3. Hard technical constraints

- Expo SDK 57, RN 0.86, React 19, expo-router with `experiments.typedRoutes`. This is a native
  app; do not write web/DOM code or CSS files.
- **Styling: keep `StyleSheet.create` + design tokens. Do not introduce `className`.** NativeWind
  is installed and configured but has zero usages across the codebase; migrating would rewrite
  every file for no design gain. As part of this work, **remove NativeWind and Tailwind
  entirely** — dependencies, `babel.config.js` preset options, `metro.config.js` wrapper,
  `global.css`, `tailwind.config.js`, `nativewind-env.d.ts`, and the `nativewind/types` entry in
  `tsconfig.json`. If you judge removal too risky, say so and leave it fully intact; do not
  leave it half-configured.
- Available visual toolkit: **Reanimated 4.5.1, react-native-svg 15.15.4, Ionicons**. All custom
  visualisations are hand-authored SVG.
- You may add only these packages, and only if you use them: `expo-font` +
  `@expo-google-fonts/*` (required for typography), `expo-haptics`, `expo-linear-gradient`.
  Do not add a chart library, Skia, Lottie, Moti, or a bottom-sheet library.
- TypeScript is strict. `npm test` is green at baseline (7 tests, 3 suites) and must stay green.
  **`npm run typecheck` is already failing before you start** — `tsconfig.json:5` sets
  `baseUrl: "."`, which TypeScript 6.0.3 deprecates (`error TS5101`). Fix it first so you are
  working against a green baseline: delete the `baseUrl` line (TS 5+ resolves `paths` relative
  to the tsconfig, so the `@/*` alias keeps working), or add `"ignoreDeprecations": "6.0"`.
  Both must pass when you are done.
- Path alias is `@/* → src/*`. Follow the existing import ordering and file conventions.

## 4. Current design system — read before changing

`src/design/tokens.ts` (246 lines) is the real system; `tailwind.config.js` holds a contradictory
orphaned pink palette that must be deleted.

```
paper #FBF6EF · paperDeep #F1E5D8 · porcelain #FFFDF9 · vellum #F7EFE5
ink #251C1E · inkSoft #51464A · inkMuted #7B7074 · hairline #E2D7CD
action #7E3F46 · actionPressed #633139
menstrual #B94E56 · follicular #7BAE9A · fertile #2F8C8D · ovulation #C58B2A
luteal #7F6AAE · pregnancy #9A6B47 · wellness #5C7F99
success #2F7C57 · warning #A46719 · error #A33A3F · focus #1F6E73
surfaceWarm #F8EBDD · surfaceCool #EEF4F2 · separator rgba(37,28,30,0.1)
```

Typography (system font, 10 variants): `display` 34/40 · `heroMetric` 48/54 (unused) ·
`pageTitle` 28/34 · `sectionTitle` 18/24 · `cardTitle` 16/22 · `body` 16/24 · `supporting` 14/21
· `label` 13/18 · `caption` 12/16 · `numeric` 22/28 with `fontVariant: ["tabular-nums"]`.
All weights are 700 or 400; all `letterSpacing: 0`.

Spacing `4/8/12/16/20/24/32/40` · radius `6/8/12/18/26/999` · layout `gutter 20`,
`maxContentWidth 520`, `minTouchTarget 48`, `tabBarHeight 76`, `headerHeight 64` ·
motion `duration {140, 220, 340}`, `spring {damping 18, stiffness 170, mass 0.9}`,
`pressScale 0.975`.

Treat this as a strong foundation to evolve, not a blank slate. Where you change a value, know
why. Where you keep one, keep it deliberately.

## 5. Deliverables

Work in this order. Show your reasoning for the token and typography decisions before writing
screen code — those choices propagate everywhere.

### 5.1 Token layer

`src/design/tokens.ts` and new sibling files.

- **Typography with a real typeface.** Load fonts via `expo-font`. Pair an editorial
  display/serif with a humanist UI sans. **Non-negotiable: both faces must have complete
  Vietnamese diacritic coverage** — Vietnamese stacks two marks on one vowel (ế, ộ, ữ), and a
  face without proper coverage will render broken or fall back mid-word. Verify coverage;
  Be Vietnam Pro, Inter, Source Serif 4, Lora and Newsreader are known-safe starting points.
  Test the string `Ẽm · chu kỳ · rụng trứng · thai kỳ · Ngày dự kiến` at every size. Define
  numeric styles with tabular figures for all metrics.
- **Dark mode.** Warm dark, not black — an inked-paper night, with phase colours re-tuned for
  contrast on dark ground rather than reused verbatim. Note the architectural cost: `colors` is
  a flat static export consumed by direct import in 27 files. Introduce a `useTheme()` hook (or
  equivalent) backed by `useColorScheme()`, then migrate call sites mechanically. Do this before
  redesigning screens so screens are written theme-aware from the start.
- **Elevation.** Make `raised` real and use it, plus a `sunken`/`inset` level if the design needs
  one. Warm-tinted shadows (`#2B1F22`-family), never neutral grey. Reconcile shadow with the
  hairline borders so cards do not carry both at full strength.
- **Absorb the off-token colours** listed here into semantic tokens:
  `#F5E9DC`, `#E8D8C8`, `#E1D1C2`, `#EADFD5` (`Screen.tsx` atmosphere), `#E7B5B1`
  (predicted-period marker in `MonthCalendar.tsx`), `#F6E5C5` / `#F5D9D7` / `#DCEDE4`
  (`InfoBanner` tones), `#FFFDF9` inlined in `CycleAtlas.tsx`.
- **Delete the pink palette** from `tailwind.config.js` and update the `expo-notifications`
  colour in `app.json` (currently `#E95670`) to the real brand action colour.
- **Motion.** Define entering/exiting transitions, list stagger, press feedback and a shared
  easing set. Actually consume `motion.duration`, which is currently referenced nowhere. Wire
  `getReduceMotion()` from `src/design/a11y.ts` — it is exported and never imported — so all
  motion degrades to opacity-only when reduce-motion is on.

### 5.2 Primitives

`src/components/common/`, `forms/`, `feedback/` — 15 components: `AppText`, `Button`, `Chip`,
`Screen`, `AppHeader`, `Section`, `MetricCard`, `InfoBanner`, `SegmentedControl`, `TextField`,
`EmptyState`, plus the data components below.

Rebuild each against the new tokens. Specific known weaknesses: `SegmentedControl` swaps
background instantly and needs an animated thumb; `Button` has a misindented style entry;
`MetricCard` is the app's workhorse and deserves a real information hierarchy; `InfoBanner` tone
colours are hardcoded hexes; the `Atmosphere` texture in `Screen.tsx` is three hand-tuned bezier
paths that should become a deliberate, reusable, theme-aware element rather than a one-off.

### 5.3 Signature visualisations

These carry the product's identity. Give them disproportionate attention.

- **`src/components/cycle/CycleAtlas.tsx`** — the 208px SVG cycle ring on Today (four phase arcs
  at r=76, a 12-tick ring, a progress marker, day number in the core). This is the app's hero
  object. Make it beautiful and animate it meaningfully on mount and on data change.
- **`src/components/calendar/MonthCalendar.tsx`** (344 lines, largest file) — fixed 42-cell grid
  with layered markers: a 16×3 bar for period, a 45°-rotated square for ovulation, an outlined
  dot for symptoms. The marker language works; refine its legibility, the selected/today states,
  the month transition, and the legend.
- **`src/components/data/MiniTrendChart.tsx`** — currently a 58-line hand-rolled sparkline and
  the only chart in the app. Design a small chart system: cycle-length history, period-length,
  symptom frequency by cycle day. Hand-authored SVG, tabular-figure labels, honest empty and
  low-data states.
- **`src/components/data/PhaseTimeline.tsx`** and **`InsightBlock.tsx`** — the phase strip and
  the insight list item.

### 5.4 Screens — all of them

`app/(tabs)/`: **Today** (`index.tsx`), **Calendar**, **Log** (`track.tsx`), **Insights**,
**Care** (`settings.tsx`), plus the three routes hidden behind `href: null` — `ovulation.tsx`,
`pregnancy.tsx`, `reports.tsx` (currently a redirect to Insights).
`app/`: `onboarding.tsx` (3 slides, goal grid), `cycle/[date].tsx` (the daily-log modal and the
app's only real write path), `auth/login.tsx`, `auth/register.tsx`, `auth/forgot-password.tsx`.

Also redesign the **tab bar** in `app/(tabs)/_layout.tsx`: five tabs at 76px with no custom
treatment for the central **Log** tab, despite it using an `add-circle-outline` icon and being
the primary action of the whole app.

For each screen, decide what the single most important thing on it is, give that the hero
treatment, and demote the rest. Today currently opens with a ring, a button row, two metric
cards, a phase strip, an insight and a warning banner — all at roughly equal weight.

### 5.5 Consistency, accessibility, and copy

- **Contrast:** every text/background pair meets WCAG AA (4.5:1 body, 3:1 large), in both
  themes. The muted greys `#7B7074` and the phase colours on warm grounds are the risky pairs —
  check them, do not assume.
- **Touch targets:** 48pt minimum, already a token (`layout.minTouchTarget`).
- **Dynamic type:** `AppText` sets `allowFontScaling` with `maxFontSizeMultiplier: 1.35`. Layouts
  must survive that multiplier without clipping or overlap.
- **Vietnamese text expansion:** Vietnamese runs 20–30% longer than the English currently
  hardcoded in `phaseMeta` descriptions, `MetricCard` labels and button text. Design for the
  longer string; never rely on a label fitting on one line.
- **Screen reader:** `MonthCalendar` cells, `CycleAtlas` and every chart need meaningful
  `accessibilityLabel`s conveying the data, not the shape.

## 6. Make the design honest

The product's promise is that it never fakes precision. Several places currently break it. Fix
the wiring so the redesign is truthful, and design the states these create:

1. **`prediction.nextPeriodRange`** is computed whenever `irregularityDays >= 5` and rendered
   nowhere. Design and ship the "range instead of a single date" presentation on Today and
   Calendar — this is the feature the onboarding copy explicitly promises.
2. **`PhaseTimeline` on Today receives a hardcoded phase** (`confidence === "low" ? "wellness" :
   "luteal"`) instead of `getCurrentPhase()` from `src/design/phase.ts`. Wire it to real data.
3. **`MiniTrendChart` on Insights is fed hardcoded `[28, 29, 27, averageCycleLength]`.** Derive
   real values via `getCycleLengths()` in `src/utils/algorithms/cyclePrediction.ts`, and design a
   genuine low-data state for when there is not enough history.
4. **Confidence is exposed raw.** Insights renders the literal string `"medium"`;
   `getConfidenceLabel()` already maps to "Strong signal" / "Moderate signal" / "Needs more
   history". Design a confidence indicator used consistently everywhere a prediction appears.
5. **The Log modal saves one symptom and writes a bogus 1-day cycle** (`startDate === endDate`,
   id `local-cycle-${date}`) on every save, corrupting cycle history. Design multi-select symptom
   logging and separate "log a symptom" from "log a period start/end".
6. **The Mood segment is nearly empty.** `SymptomType` includes `happy`, `sad`, `libido`,
   `diarrhea`, `constipation`, `contraception`, but `symptomCatalog` omits all six, so Mood
   offers only Stress / Anxiety / Irritable and there is no mood scale. Extend the catalog and
   design a proper mood input.
7. **Care shows dead controls:** three permanently disabled `Switch`es (Anonymous Mode, Biometric
   lock, Cycle reminders), and Export JSON / Delete data buttons with no handlers. Either design
   them as honest "not built yet" states or wire them — do not ship controls that look live and
   do nothing.
8. **`HealthGoal` is stored and ignored.** No screen branches on it, and `menopause` is
   selectable in Care but absent from onboarding. Decide whether the goal shapes the experience;
   if it does, design the variants; if it does not, stop asking for it.

## 7. Internationalisation

`src/i18n/index.ts` contains exactly three keys and `t()` is never called — every string in the
app is hardcoded English, in a Vietnamese-branded product whose `UserSettings.locale` is typed
`"vi" | "en"`. As you rewrite screens, extract copy into the dictionary and author Vietnamese
alongside English. Vietnamese copy must be written for a Vietnamese reader, not translated word
for word — especially the medical and consent language in onboarding, the fertility warnings,
and the phase descriptions in `phaseMeta`.

## 8. Working method

1. Read the codebase first. Start with `src/design/tokens.ts`, `src/components/common/Screen.tsx`,
   `app/(tabs)/index.tsx`, `src/components/cycle/CycleAtlas.tsx` and
   `src/components/calendar/MonthCalendar.tsx` — those five files define the current visual language.
2. Present the direction before building: the typeface pairing with Vietnamese samples, the
   light and dark palettes with contrast ratios, the elevation and motion system, and a
   description of the Today screen. Get agreement on this before touching screen code.
3. Then build in the order of §5 — tokens, theming, primitives, signature visualisations,
   screens, polish. Do not redesign screens before theming lands, or you will write every
   screen twice.
4. Run `npm run typecheck` and `npm test` as you go. Fix the pre-existing `baseUrl` typecheck
   failure described in §3 first. Keep the existing tests in `__tests__/` green — 7 tests
   across 3 suites, covering the prediction and pregnancy algorithms.
5. Note that this repo has **zero commits** — every file is staged as new. Commit the baseline
   before you start so the redesign is reviewable as a diff.

## 9. Definition of done

- One coherent visual system, one palette, light and dark, with no orphaned or hardcoded colours.
- A real typeface with verified Vietnamese coverage, applied consistently.
- All 13 routes redesigned, plus the tab bar.
- Every prediction shown with its confidence; ranges shown when the data warrants a range.
- No control that looks interactive but does nothing.
- AA contrast in both themes; layouts survive 1.35× dynamic type; motion honours reduce-motion.
- `npm run typecheck` and `npm test` pass.
- The result could not be mistaken for a generic health-app template.
