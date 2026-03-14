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

    const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);

    useAuthStore.getState().setSession({
      uid: credential.user.uid,
      email: credential.user.email ?? email,
      displayName: credential.user.displayName ?? email.split("@")[0] ?? "Utilisateur Subly"
    });

    return credential;
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

    const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    await updateProfile(credential.user, { displayName });
    await credential.user.reload();

    useAuthStore.getState().setSession({
      uid: credential.user.uid,
      email: credential.user.email ?? email,
      displayName
    });

    return credential;
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

    return sendPasswordResetEmail(firebaseAuth, email);
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
