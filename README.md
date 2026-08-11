# Ẽm

Ẽm is an Expo managed React Native MVP for cycle, ovulation, pregnancy, symptom, reminder, and reproductive health tracking.

## Stack

- Expo SDK 57, React Native 0.86, React 19.2.3, TypeScript.
- Expo Router for stack + bottom tabs.
- Zustand for local app state and TanStack Query for server state.
- Firebase Auth + Firestore service layer.
- NativeWind for styling, Day.js for date math, Expo SecureStore for sensitive local data.
- Expo Notifications and Expo Localization are configured.

## Run

```bash
cd /Users/tony/em
nvm use
npm install
npx expo start
```

SDK 57 requires Node `>=22.13.0`.

## Environment

Copy `.env.example` to `.env` and fill Firebase web app values:

```bash
cp .env.example .env
```

Enable Firebase Auth providers: email/password and anonymous auth. Add Apple/Google providers later after native credentials are configured.

The app can still boot without `.env`; cloud login/sync actions will show a controlled Firebase configuration error while local anonymous mode remains usable.

## Firebase

Firestore collections:

- `users`
- `cycles`
- `symptoms`
- `ovulation_logs`
- `pregnancy`
- `subscriptions`

Base rules are in `firebase/firestore.rules`. They allow users to read/write only their own `userId` scoped documents; subscription writes are backend-only.

## Architecture

```text
app/                      Expo Router routes
src/domain/entities/      typed domain models
src/services/firebase/    Firebase Auth and Firestore access
src/services/notifications/
src/services/storage/     SecureStore-backed anonymous/local data helpers
src/store/                Zustand state
src/hooks/                UI-facing feature hooks
src/utils/algorithms/     cycle, ovulation, and pregnancy calculations
src/components/           reusable UI and calendar primitives
```

## Current MVP Coverage

- Onboarding with privacy and goal selection.
- Email login/register/forgot password plus anonymous mode.
- Home calendar with logged period, predicted period, fertile window, and ovulation markers.
- Cycle detail modal for period flow, symptoms, severity, and notes.
- Fertility screen with ovulation/fertile-window estimates.
- Pregnancy mode activation and week summary.
- Reports summary and export entry points.
- Settings for goal, privacy, notifications, and account actions.

## Roadmap

1. Persist Zustand slices into SecureStore for anonymous mode and Firestore for signed-in users.
2. Add Apple/Google Sign-In with production credentials.
3. Implement PDF/CSV export and import restore.
4. Add notification preference UI and rescheduling after cycle edits.
5. Add Maestro smoke tests and Firebase emulator tests.
6. Gate AI assistant, doctor report, BBT charts, partner sharing, and premium content behind subscription state.
