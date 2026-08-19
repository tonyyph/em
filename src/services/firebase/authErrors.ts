import { FirebaseConfigurationError } from "./config";

/** Firebase throws plain errors carrying an `auth/...` code. */
const codeOf = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error
    ? String((error as { code: unknown }).code)
    : undefined;

const MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "That email or password did not match an account.",
  "auth/wrong-password": "That email or password did not match an account.",
  "auth/user-not-found": "That email or password did not match an account.",
  "auth/invalid-email": "That is not a valid email address.",
  "auth/email-already-in-use": "That email already has an account. Try signing in instead.",
  "auth/weak-password": "Choose a password of at least 6 characters.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/network-request-failed": "No connection. Check your network and try again.",
  "auth/too-many-requests": "Too many attempts. Wait a moment before trying again."
};

/**
 * What to show someone when an auth call fails.
 *
 * Every auth screen used to answer every failure with "Firebase is not
 * configured", which is true only for the one case the developer was testing.
 * For a configured app it told a user with a mistyped password to go and edit
 * an env file — an instruction they cannot follow, about a problem they do not
 * have, in place of the one thing that would have fixed it.
 */
export const describeAuthError = (error: unknown) => {
  if (error instanceof FirebaseConfigurationError) {
    return "Cloud sync is not configured on this build. Anonymous local mode still works.";
  }

  const code = codeOf(error);
  return (
    (code ? MESSAGES[code] : undefined) ??
    "That could not be completed. Please try again."
  );
};
