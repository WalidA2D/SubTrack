import Constants from "expo-constants";

type ExtraConfig = {
  apiBaseUrl?: string;
  authMode?: "mock" | "firebase";
  authEmulatorUrl?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as ExtraConfig;

export const appConfig = {
  apiBaseUrl:
    extra.apiBaseUrl ?? "http://localhost:5001/subly-dev/europe-west1/api/api/v1",
  authMode: extra.authMode ?? "firebase",
  authEmulatorUrl: extra.authEmulatorUrl
};
