import { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Subly",
  slug: "subly",
  scheme: "subly",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "light",
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
    apiBaseUrl:
      process.env.EXPO_PUBLIC_API_BASE_URL ??
      "http://localhost:5001/subly-dev/europe-west1/api/api/v1"
  }
};

export default config;
