import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { getApp, getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth, initializeAuth } from "firebase/auth";

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

type ReactNativeAuthModule = {
  getReactNativePersistence?: (storage: typeof AsyncStorage) => unknown;
};

if (!firebaseConfig?.apiKey || !firebaseConfig.appId || !firebaseConfig.projectId) {
  throw new Error(
    "Firebase config is missing. Add google-services.json or define EXPO_PUBLIC_FIREBASE_* variables."
  );
}

export const firebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const reactNativeAuthModule = (() => {
  try {
    // Firebase ships an RN-specific auth bundle, but this package version does not
    // expose it through the top-level `firebase/auth/*` exports.
    return require("../../../../node_modules/firebase/node_modules/@firebase/auth/dist/rn/index.js") as ReactNativeAuthModule;
  } catch {
    return null;
  }
})();

export const firebaseAuth = (() => {
  const auth = (() => {
    try {
      const persistence = reactNativeAuthModule?.getReactNativePersistence?.(AsyncStorage);

      if (!persistence) {
        return getAuth(firebaseApp);
      }

      return initializeAuth(firebaseApp, {
        persistence: persistence as never
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
