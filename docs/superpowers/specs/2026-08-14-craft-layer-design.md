# Ẽm — Craft Layer Design

**Date:** 2026-08-14
**Status:** Approved, in implementation

## Why this work exists

Ẽm already has a coherent visual identity: warm-paper ground, Fraunces + Be
Vietnam Pro, a seven-phase earthy palette, warm elevation, a topographic
atmosphere. That work landed in the `redesign` merge and it is not the problem.

The problem is that the app is **statically well designed and dynamically
inert**. Nothing moves in response to being used. Screens cut rather than
transition, content appears rather than arrives, and roughly half the surfaces
that look tappable do nothing when tapped.

Perceived design investment tracks the *consistency* of feedback, not the
presence of effects. An app where 90% of touches respond and 10% do not reads
as unfinished, because the 10% is what the user notices. So the infrastructure
comes first and is mandatory, and per-screen work builds on it.

## Non-goals

- Changing colour, typography, or the phase palette. The visual language stays.
- Rewriting business logic, algorithms, storage, or i18n.
- Migrating styling away from `StyleSheet.create` + design tokens.
- Any refactor not needed to make a screen's design change safe.

## Constraints

Facts about this codebase, verified 2026-08-14:

- Expo SDK 57.0.12, RN 0.86.2, React 19.2.3, expo-router with typed routes.
- Styling stays `StyleSheet.create` + tokens. No `className`, no NativeWind.
- Path alias `@/* → src/*`.
- Baseline is green: `npm run typecheck` clean, `npm test` 49 tests / 6 suites.
  Both must stay green at every phase boundary.
- Existing visual toolkit: Reanimated 4.5.1, react-native-svg 15.15.4,
  react-native-gesture-handler 2.32, Ionicons, expo-haptics.

### Approved new dependencies

Compatibility checked against the installed versions, not assumed:

| Package | Version | Peer requirement | Status |
|---|---|---|---|
| `@gorhom/bottom-sheet` | 5.2.14 | gesture-handler `>=2.16.1`, reanimated `>=3.16 \|\| >=4.0` | satisfied by 2.32 / 4.5.1 |
| `expo-blur` | 57.0.2 | expo `*` | SDK 57 native |
| `expo-linear-gradient` | 57.0.1 | expo `*` | SDK 57 native |

No Skia, no Lottie, no Moti, no chart library. Charts stay hand-authored SVG.

`DESIGN_BRIEF.md` forbids `@gorhom/bottom-sheet`; that constraint is
deliberately superseded here by the project owner. `DESIGN_BRIEF.md` also
states the typecheck is failing and there are 7 tests — both stale, corrected
above.

## Accessibility contract

Every animation added under this spec must degrade rather than disappear when
`reduceMotion` is true. `useTheme().reduceMotion` already tracks the OS setting
live. The rule: **motion becomes instant, never absent** — a staggered list
renders complete, a drawn arc renders drawn, a press still changes state
without scaling. No feature may become unreachable because motion is off.

Touch targets stay at `layout.minTouchTarget` (48). Anything newly made
tappable gains a real `accessibilityRole` and label.

---

## Layer 1 — Infrastructure

Shared machinery. Every screen benefits, so this lands first even though it
produces the least visible change on its own.

### 1.1 Motion vocabulary

New: `src/design/motion.ts`, extending the `motion` object already in
`tokens.ts` (durations and springs stay where they are; this adds intent).

Named easing curves, so call sites express *why* rather than *what*:

- `enter` — content arriving. Decelerating.
- `exit` — content leaving. Accelerating.
- `settle` — a value changing in place. Spring, soft.
- `emphasis` — the one thing the user should notice. Slight overshoot.

Two primitives:

- `<Reveal delay index>` — entrance wrapper. Fade + 10px rise. Reads
  `reduceMotion` internally; callers never branch on it.
- `useStagger(index)` — returns the delay for item `index` in a sequence,
  capped so a long list does not take a second to appear.

**Why a component and a hook rather than one of each:** `<Reveal>` covers the
common case with zero thought; `useStagger` exists for the cases that need to
drive an existing animated value rather than wrap a subtree.

### 1.2 Screen transitions

Currently every navigation is a hard cut. This is the single largest
contributor to the app feeling cheap.

- **Tab switch:** cross-fade plus a 12px rise, ~220ms. Configured on the Tabs
  navigator, not per screen.
- **Push to `/cycle/[date]`:** the tapped surface expands rather than sliding
  in from the right.
- **Sheets:** handled by the bottom-sheet system below, not by the router.

### 1.3 Touch system

New: `src/components/common/Tappable.tsx`.

One wrapper that standardises press scale (`motion.pressScale`, already a
token), haptic weight, and pressed-state ground. Every tappable surface routes
through it.

Surfaces that currently *look* interactive and are not — these get wired up:

- `MetricCard` — opens the relevant detail
- `InsightBlock` — expands
- `ConfidenceBadge` — explains what the confidence level means
- `Section` headers where a "see all" affordance is implied

**Why this matters most:** a user who taps a card and gets nothing has been
told the app is a mock-up. This is cheaper to fix than anything else here and
has a larger effect.

### 1.4 Depth rules

Three elevation tiers exist in `theme.tsx`; only `raised` is used. Codify:

- `raised` — a card at rest on the page
- `lifted` — a card under interaction, or a screen's hero surface
- `sheet` — anything overlaying the page, plus the tab bar

Enforced by a design-system test that asserts each tier is used somewhere, so
the rule does not quietly rot back to one tier.

### 1.5 Loading, empty, and error states

Every screen gets all three. Skeletons shimmer in warm tones drawn from
`surfaceMuted`/`backgroundSunken` — a grey shimmer on warm paper reads as dirt,
the same reason the shadows are warm.

`EmptyState` already exists and is extended rather than replaced.

### 1.6 Bottom sheet system

`@gorhom/bottom-sheet`, wrapped in a themed `AppSheet` so no screen touches the
library directly. Used for: day detail, symptom pickers, confirmations, and
the "what does this mean" explainers that the touch system now demands.

Wrapping rather than using directly keeps the library swappable and keeps
theming in one place.

---

## Layer 2 — Per-screen

All ten surfaces, each at depth. Ordered by user impact.

| Surface | Work |
|---|---|
| **Onboarding** | First impression. The most heavily choreographed sequence in the app. |
| **Today** | `CycleAtlas`: arcs draw in, phase gradient, marker glow, per-day tap. Post-log moment. |
| **Calendar** | `MonthCalendar` split up; day-detail sheet; swipe between months. |
| **Track** | Real logging feedback; chip motion; a confirmation moment after save. |
| **Insights** | Charts draw in; `InsightBlock` expansion. |
| **Reports** | `MiniTrendChart` upgrade; animated figures. |
| **Ovulation** | Hero metric (`typography.heroMetric` is defined and unused). |
| **Pregnancy** | Week hero; timeline. |
| **Settings** | Grouping, row press states, themed sheet pickers. |
| **Auth** | Field focus states, error motion, submit feedback. |

## Architecture work

Two files are too large to change safely and are split as part of this work,
not as separate refactoring:

- `src/components/calendar/MonthCalendar.tsx` — 427 lines
- `app/(tabs)/settings.tsx` — 336 lines

Both are the files this spec most needs to modify. Splitting them is a
precondition for the design change, which is why it is in scope; no other file
gets restructured.

## Phasing

Four phases, each ending at a green baseline and a review checkpoint. The
owner reviews visually on a simulator between phases — code review cannot
judge whether something looks expensive.

1. **Infrastructure** (1.1–1.6). Little visible change; everything depends on it.
2. **Onboarding + Today**
3. **Calendar + Track**
4. **Insights, Reports, Ovulation, Pregnancy, Settings, Auth**

## Verification

At every phase boundary:

- `npm run typecheck` clean
- `npm test` green, ≥49 tests
- New design-system assertions in `__tests__/design/designSystem.test.ts` for
  the elevation-tier and motion-token rules
- Owner reviews the phase on a simulator

Automated tests cannot verify that an animation looks right. They verify that
tokens exist, that tiers are used, and that reduce-motion paths render. The
visual judgement stays with the owner, at the phase checkpoints.
