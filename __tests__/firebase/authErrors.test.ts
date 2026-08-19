import { describeAuthError } from "@/services/firebase/authErrors";
import { FirebaseConfigurationError } from "@/services/firebase/config";

const firebaseError = (code: string) => Object.assign(new Error(code), { code });

describe("describeAuthError", () => {
  it("names configuration as the problem only when it actually is", () => {
    expect(describeAuthError(new FirebaseConfigurationError())).toMatch(/not configured/i);
  });

  it("tells someone their credentials were rejected rather than blaming setup", () => {
    // Blaming configuration for a wrong password leaves the one person who can
    // fix it — the user, by retyping it — with nothing to act on.
    for (const code of ["auth/invalid-credential", "auth/wrong-password", "auth/user-not-found"]) {
      const message = describeAuthError(firebaseError(code));
      expect(message).toMatch(/email or password/i);
      expect(message).not.toMatch(/configur/i);
    }
  });

  it("distinguishes the sign-up failures a user can act on", () => {
    expect(describeAuthError(firebaseError("auth/email-already-in-use"))).toMatch(
      /already has an account/i
    );
    expect(describeAuthError(firebaseError("auth/weak-password"))).toMatch(/6 characters/i);
    expect(describeAuthError(firebaseError("auth/invalid-email"))).toMatch(/not a valid email/i);
  });

  it("separates a network failure from a rejection", () => {
    expect(describeAuthError(firebaseError("auth/network-request-failed"))).toMatch(
      /connection|network/i
    );
    expect(describeAuthError(firebaseError("auth/too-many-requests"))).toMatch(/too many/i);
  });

  it("falls back to something honest for a code it does not know", () => {
    const message = describeAuthError(firebaseError("auth/some-future-code"));

    expect(message).toMatch(/could not be completed/i);
    expect(message).not.toMatch(/configur/i);
  });
});
