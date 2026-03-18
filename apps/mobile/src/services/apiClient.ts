import { appConfig } from "../config/appConfig";
import { useAuthStore } from "../store/authStore";

async function getAuthHeaders(): Promise<Record<string, string>> {
  if (appConfig.authMode === "mock") {
    const session = useAuthStore.getState().session;

    return {
      "Content-Type": "application/json",
      "X-Subly-Mock-User": session?.uid ?? "mock-user-id",
      "X-Subly-Mock-Email": session?.email ?? "demo@subly.app",
      "X-Subly-Mock-Name": session?.displayName ?? "Utilisateur Subly"
    };
  }

  const { firebaseAuth } = await import("../config/firebase");
  const idToken = await firebaseAuth.currentUser?.getIdToken();

  return {
    "Content-Type": "application/json",
    ...(idToken ? { Authorization: `Bearer ${idToken}` } : {})
  };
}

function buildHeaders(
  baseHeaders: Record<string, string>,
  additionalHeaders?: HeadersInit
): Headers {
  const headers = new Headers(baseHeaders);

  if (additionalHeaders) {
    new Headers(additionalHeaders).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  return headers;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
    ...options,
    headers: buildHeaders(await getAuthHeaders(), options.headers)
  });

  if (!response.ok) {
    const errorText = await response.text();

    if (errorText) {
      try {
        const parsed = JSON.parse(errorText) as { message?: string };
        throw new Error(parsed.message || errorText);
      } catch {
        throw new Error(errorText);
      }
    }

    throw new Error("API request failed");
  }

  return response.json() as Promise<T>;
}
