const firebaseEnvKeys = [
  "EXPO_PUBLIC_FIREBASE_API_KEY",
  "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "EXPO_PUBLIC_FIREBASE_PROJECT_ID",
  "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "EXPO_PUBLIC_FIREBASE_APP_ID"
];

describe("Firebase configuration", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    firebaseEnvKeys.forEach((key) => {
      delete process.env[key];
    });
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("does not crash when auth service is imported without Firebase env", async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    expect(() => require("@/services/firebase/authService")).not.toThrow();
  });

  it("returns a controlled configuration error when cloud auth is used without Firebase env", async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { authService } = require("@/services/firebase/authService") as typeof import("@/services/firebase/authService");

    await expect(authService.loginWithEmail("test@example.com", "password")).rejects.toThrow(
      "Firebase is not configured"
    );
  });
});
