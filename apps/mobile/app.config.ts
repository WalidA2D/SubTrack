import fs from "fs";
import path from "path";
import { ExpoConfig } from "expo/config";

type FirebaseExtraConfig = {
  apiKey: string;
  appId: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  authDomain: string;
};

function deriveAuthEmulatorUrl(apiBaseUrl: string): string | null {
  try {
    const url = new URL(apiBaseUrl);

    if (!isLocalApiHost(url.hostname)) {
      return null;
    }

    return `${url.protocol}//${url.hostname}:9099`;
  } catch {
    return null;
  }
}

function isLocalApiHost(hostname: string): boolean {
  const normalizedHost = hostname.trim().toLowerCase();

  if (
    normalizedHost === "localhost" ||
    normalizedHost === "127.0.0.1" ||
    normalizedHost === "10.0.2.2"
  ) {
    return true;
  }

  if (normalizedHost.endsWith(".local")) {
    return true;
  }

  if (normalizedHost.startsWith("192.168.") || normalizedHost.startsWith("10.")) {
    return true;
  }

  const private172Match = normalizedHost.match(/^172\.(\d{1,2})\./);

  if (!private172Match) {
    return false;
  }

  const secondOctet = Number(private172Match[1]);

  return secondOctet >= 16 && secondOctet <= 31;
}

function loadDefaultFirebaseProjectId(): string | null {
  const firebaseRcPath = path.join(__dirname, "..", "..", ".firebaserc");

  if (!fs.existsSync(firebaseRcPath)) {
    return null;
  }

  try {
    const firebaseRc = JSON.parse(fs.readFileSync(firebaseRcPath, "utf8")) as {
      projects?: {
        default?: string;
      };
    };

    return firebaseRc.projects?.default ?? null;
  } catch {
    return null;
  }
}

function loadFirebaseExtraConfig(): FirebaseExtraConfig | null {
  const googleServicesPath = path.join(__dirname, "google-services.json");
  const emulatorProjectId =
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ??
    (process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_URL
      ? loadDefaultFirebaseProjectId()
      : null);

  if (!fs.existsSync(googleServicesPath)) {
    if (!emulatorProjectId) {
      return null;
    }

    return {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? "subly-dev-api-key",
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? "1:000000000000:web:sublydev",
      projectId: emulatorProjectId,
      storageBucket:
        process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? `${emulatorProjectId}.appspot.com`,
      messagingSenderId:
        process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "000000000000",
      authDomain:
        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ??
        `${emulatorProjectId}.firebaseapp.com`
    };
  }

  const googleServices = JSON.parse(fs.readFileSync(googleServicesPath, "utf8")) as {
    project_info?: {
      project_number?: string;
      project_id?: string;
      storage_bucket?: string;
    };
    client?: Array<{
      client_info?: {
        mobilesdk_app_id?: string;
      };
      api_key?: Array<{
        current_key?: string;
      }>;
    }>;
  };

  const projectInfo = googleServices.project_info;
  const client = googleServices.client?.[0];

  if (!projectInfo?.project_id || !projectInfo.project_number || !client?.client_info?.mobilesdk_app_id) {
    return null;
  }

  const resolvedProjectId = emulatorProjectId ?? projectInfo.project_id;

  return {
    apiKey:
      process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? client.api_key?.[0]?.current_key ?? "",
    appId:
      process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? client.client_info.mobilesdk_app_id,
    projectId: resolvedProjectId,
    storageBucket:
      process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ??
      (emulatorProjectId
        ? `${resolvedProjectId}.appspot.com`
        : projectInfo.storage_bucket ?? ""),
    messagingSenderId:
      process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? projectInfo.project_number,
    authDomain:
      process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ??
      `${resolvedProjectId}.firebaseapp.com`
  };
}

const firebaseExtra = loadFirebaseExtraConfig();
const apiBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  "http://localhost:5001/subly-dev/europe-west1/api/api/v1";
const authMode = process.env.EXPO_PUBLIC_AUTH_MODE ?? "firebase";
const authEmulatorUrl =
  process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_URL ??
  deriveAuthEmulatorUrl(apiBaseUrl);

const config: ExpoConfig = {
  name: "Subly",
  slug: "subly",
  scheme: "subly",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "light",
  plugins: ["expo-notifications"],
  ios: {
    bundleIdentifier: "com.subly.app",
    googleServicesFile: "./GoogleService-Info.plist",
    supportsTablet: true
  },
  android: {
    package: "com.subly.app",
    googleServicesFile: "./google-services.json"
  },
  extra: {
    apiBaseUrl,
    authMode,
    authEmulatorUrl,
    firebase: firebaseExtra
  }
};

export default config;
