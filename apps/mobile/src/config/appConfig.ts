import Constants from "expo-constants";
import { Platform } from "react-native";

type ExtraConfig = {
  apiBaseUrl?: string;
  authMode?: "mock" | "firebase";
  authEmulatorUrl?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as ExtraConfig;

function normalizeLocalUrl(value: string | undefined): string | undefined {
  if (!value) {
    return value;
  }

  try {
    const url = new URL(value);
    const hostname = url.hostname.trim().toLowerCase();
    const isLoopbackHost =
      hostname === "localhost" || hostname === "127.0.0.1";

    if (Platform.OS === "android" && isLoopbackHost) {
      url.hostname = "10.0.2.2";
      return url.toString();
    }

    if (Platform.OS === "ios" && hostname === "10.0.2.2") {
      url.hostname = "127.0.0.1";
      return url.toString();
    }

    return url.toString();
  } catch {
    return value;
  }
}

export const appConfig = {
  apiBaseUrl: normalizeLocalUrl(
    extra.apiBaseUrl ?? "http://localhost:5001/subly-dev/europe-west1/api/api/v1"
  ) ?? "http://localhost:5001/subly-dev/europe-west1/api/api/v1",
  authMode: extra.authMode ?? "firebase",
  authEmulatorUrl: normalizeLocalUrl(extra.authEmulatorUrl)
};
