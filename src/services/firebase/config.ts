import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAuth, initializeAuth, type Auth, type Persistence } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

export class FirebaseConfigurationError extends Error {
  constructor(message = "Firebase is not configured. Fill .env from .env.example to enable cloud sync.") {
    super(message);
    this.name = "FirebaseConfigurationError";
  }
}

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

const requiredConfigValues = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.appId
];

export const isFirebaseConfigured = requiredConfigValues.every(
  (value) => typeof value === "string" && value.trim().length > 0
);

let firebaseApp: FirebaseApp | undefined;
let firebaseAuth: Auth | undefined;
let firestoreDb: Firestore | undefined;

const toConfigurationError = (error: unknown) => {
  const detail = error instanceof Error ? error.message : String(error);
  return new FirebaseConfigurationError(`Firebase could not initialize: ${detail}`);
};

const getReactNativeAuthPersistence = (): Persistence | undefined => {
  // Firebase exposes the React Native persistence helper through the React Native resolver condition.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const authModule = require("firebase/auth") as {
    getReactNativePersistence?: (storage: typeof AsyncStorage) => Persistence;
  };
  const getReactNativePersistence = authModule.getReactNativePersistence;

  return getReactNativePersistence?.(AsyncStorage);
};

export const getFirebaseApp = () => {
  if (!isFirebaseConfigured) {
    throw new FirebaseConfigurationError();
  }

  try {
    firebaseApp = firebaseApp ?? (getApps().length > 0 ? getApp() : initializeApp(firebaseConfig));
    return firebaseApp;
  } catch (error) {
    throw toConfigurationError(error);
  }
};

export const getFirebaseAuth = () => {
  const app = getFirebaseApp();
  if (firebaseAuth) {
    return firebaseAuth;
  }

  try {
    const persistence = getReactNativeAuthPersistence();
    firebaseAuth = persistence ? initializeAuth(app, { persistence }) : initializeAuth(app);
    return firebaseAuth;
  } catch (error) {
    try {
      firebaseAuth = getAuth(app);
      return firebaseAuth;
    } catch {
      throw toConfigurationError(error);
    }
  }
};

export const getFirestoreDb = () => {
  const app = getFirebaseApp();
  firestoreDb = firestoreDb ?? getFirestore(app);
  return firestoreDb;
};
