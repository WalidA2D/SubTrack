import { appConfig } from "../config/appConfig";
import { useAuthStore } from "../store/authStore";

export const authService = {
  async signIn(email: string, password: string) {
    if (appConfig.authMode === "mock") {
      useAuthStore.getState().setSession({
        uid: "mock-user-id",
        email,
        displayName: email.split("@")[0] || "Utilisateur Subly"
      });

      return {
        user: {
          uid: "mock-user-id",
          email,
          displayName: email.split("@")[0] || "Utilisateur Subly"
        }
      };
    }

    const [{ signInWithEmailAndPassword }, { firebaseAuth }] = await Promise.all([
      import("firebase/auth"),
      import("../config/firebase")
    ]);

    try {
      const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);

      useAuthStore.getState().setSession({
        uid: credential.user.uid,
        email: credential.user.email ?? email,
        displayName: credential.user.displayName ?? email.split("@")[0] ?? "Utilisateur Subly"
      });

      return credential;
    } catch (error) {
      throw normalizeAuthError(error);
    }
  },

  async register(email: string, password: string, displayName: string) {
    if (appConfig.authMode === "mock") {
      useAuthStore.getState().setSession({
        uid: "mock-user-id",
        email,
        displayName
      });

      return {
        user: {
          uid: "mock-user-id",
          email,
          displayName
        }
      };
    }

    const [{ createUserWithEmailAndPassword, updateProfile }, { firebaseAuth }] =
      await Promise.all([import("firebase/auth"), import("../config/firebase")]);

    try {
      const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      await updateProfile(credential.user, { displayName });
      await credential.user.reload();

      useAuthStore.getState().setSession({
        uid: credential.user.uid,
        email: credential.user.email ?? email,
        displayName
      });

      return credential;
    } catch (error) {
      throw normalizeAuthError(error);
    }
  },

  async sendPasswordReset(email: string) {
    if (appConfig.authMode === "mock") {
      return Promise.resolve({
        email
      });
    }

    const [{ sendPasswordResetEmail }, { firebaseAuth }] = await Promise.all([
      import("firebase/auth"),
      import("../config/firebase")
    ]);

    try {
      return await sendPasswordResetEmail(firebaseAuth, email);
    } catch (error) {
      throw normalizeAuthError(error);
    }
  },

  async changePassword(currentPassword: string, nextPassword: string) {
    if (appConfig.authMode === "mock") {
      return Promise.resolve();
    }

    const [
      {
        EmailAuthProvider,
        reauthenticateWithCredential,
        updatePassword
      },
      { firebaseAuth }
    ] = await Promise.all([import("firebase/auth"), import("../config/firebase")]);

    const currentUser = firebaseAuth.currentUser;

    if (!currentUser?.email) {
      throw new Error("Impossible de retrouver ton compte actuel.");
    }

    const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
    try {
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, nextPassword);
    } catch (error) {
      throw normalizeAuthError(error);
    }
  },

  async signOut() {
    if (appConfig.authMode === "mock") {
      useAuthStore.getState().signOutLocally();
      return;
    }

    const [{ signOut }, { firebaseAuth }] = await Promise.all([
      import("firebase/auth"),
      import("../config/firebase")
    ]);

    await signOut(firebaseAuth);
    useAuthStore.getState().signOutLocally();
  }
};

function normalizeAuthError(error: unknown) {
  const code =
    error && typeof error === "object" && "code" in error ? String(error.code) : "";
  const message =
    error instanceof Error ? error.message : "Impossible de contacter Firebase.";

  if (code === "auth/operation-not-allowed") {
    return new Error(
      appConfig.authEmulatorUrl
        ? `L'authentification email/mot de passe n'est pas active sur la cible actuelle, ou l'app n'atteint pas le bon Auth Emulator (${appConfig.authEmulatorUrl}). Redemarre Expo et verifie que l'emulateur Auth tourne bien.`
        : "L'authentification email/mot de passe n'est pas active dans Firebase."
    );
  }

  if (code === "auth/network-request-failed") {
    return new Error(
      appConfig.authEmulatorUrl
        ? `Connexion impossible vers l'Auth Emulator (${appConfig.authEmulatorUrl}). Verifie l'host utilise par le mobile.`
        : "Connexion reseau impossible vers Firebase."
    );
  }

  return error instanceof Error ? error : new Error(message);
}
