import Constants from "expo-constants";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  connectAuthEmulator,
  getAuth,
  inMemoryPersistence,
  initializeAuth
} from "firebase/auth";

type FirebaseRuntimeConfig = {
  apiKey: string;
  appId: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  authDomain: string;
};

type FirebaseExtraConfig = {
  firebase?: FirebaseRuntimeConfig | null;
  authEmulatorUrl?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as FirebaseExtraConfig;
const firebaseConfig = (extra.firebase ?? null) as
  | FirebaseRuntimeConfig
  | null;

if (!firebaseConfig?.apiKey || !firebaseConfig.appId || !firebaseConfig.projectId) {
  throw new Error(
    "Firebase config is missing. Add google-services.json or define EXPO_PUBLIC_FIREBASE_* variables."
  );
}

export const firebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const firebaseAuth = (() => {
  const auth = (() => {
    try {
      return initializeAuth(firebaseApp, {
        persistence: inMemoryPersistence
      });
    } catch {
      return getAuth(firebaseApp);
    }
  })();

  try {
    if (extra.authEmulatorUrl) {
      connectAuthEmulator(auth, extra.authEmulatorUrl, {
        disableWarnings: true
      });
    }
  } catch {
    // Ignore re-connect attempts during Fast Refresh.
  }

  return auth;
})();
