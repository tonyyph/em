import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from "firebase/auth";
import { FirebaseConfigurationError, getFirebaseAuth, isFirebaseConfigured } from "./config";

const requireAuth = () => {
  if (!isFirebaseConfigured) {
    throw new FirebaseConfigurationError();
  }

  return getFirebaseAuth();
};

export const authService = {
  isConfigured: () => isFirebaseConfigured,
  loginWithEmail: async (email: string, password: string) => signInWithEmailAndPassword(requireAuth(), email, password),
  registerWithEmail: async (email: string, password: string, displayName?: string) => {
    const credential = await createUserWithEmailAndPassword(requireAuth(), email, password);
    if (displayName) {
      await updateProfile(credential.user, { displayName });
    }
    return credential;
  },
  forgotPassword: async (email: string) => sendPasswordResetEmail(requireAuth(), email),
  loginAnonymously: async () => signInAnonymously(requireAuth()),
  logout: async () => signOut(requireAuth())
};
