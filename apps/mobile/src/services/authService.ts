import auth from "@react-native-firebase/auth";

export const authService = {
  async signIn(email: string, password: string) {
    return auth().signInWithEmailAndPassword(email, password);
  },

  async register(email: string, password: string, displayName: string) {
    const credential = await auth().createUserWithEmailAndPassword(email, password);
    await credential.user.updateProfile({ displayName });
    return credential;
  },

  async sendPasswordReset(email: string) {
    return auth().sendPasswordResetEmail(email);
  },

  async signOut() {
    return auth().signOut();
  }
};
