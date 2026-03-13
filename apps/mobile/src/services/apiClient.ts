import auth from "@react-native-firebase/auth";

import { appConfig } from "../config/appConfig";

async function getAuthHeaders() {
  const idToken = await auth().currentUser?.getIdToken();

  return {
    "Content-Type": "application/json",
    ...(idToken ? { Authorization: `Bearer ${idToken}` } : {})
  };
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
    ...options,
    headers: {
      ...(await getAuthHeaders()),
      ...(options.headers ?? {})
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "API request failed");
  }

  return response.json() as Promise<T>;
}
