import { UpdateSettingsRequest } from "@subly/shared";

import { db } from "../config/firebaseAdmin";
import { ApiError } from "../utils/apiError";

const usersCollection = db.collection("users");

export const userService = {
  async getProfile(userId: string) {
    const snapshot = await usersCollection.doc(userId).get();

    if (!snapshot.exists) {
      throw new ApiError(404, "Profil utilisateur introuvable.");
    }

    return snapshot.data();
  },

  async updateSettings(userId: string, payload: UpdateSettingsRequest) {
    const snapshot = await usersCollection.doc(userId).get();

    if (!snapshot.exists) {
      throw new ApiError(404, "Profil utilisateur introuvable.");
    }

    const current = snapshot.data() as {
      notificationPreferences?: Record<string, unknown>;
    };

    const nextPreferences = payload.notificationPreferences
      ? {
          ...(current.notificationPreferences ?? {}),
          ...payload.notificationPreferences
        }
      : current.notificationPreferences;

    const nextProfile = {
      ...(payload.currency ? { currency: payload.currency } : {}),
      ...(nextPreferences ? { notificationPreferences: nextPreferences } : {}),
      updatedAt: new Date().toISOString()
    };

    await usersCollection.doc(userId).set(nextProfile, { merge: true });

    return {
      id: userId,
      ...snapshot.data(),
      ...nextProfile
    };
  },

  async provisionUserProfile(user: {
    uid: string;
    email?: string | null;
    displayName?: string | null;
    photoURL?: string | null;
  }) {
    const snapshot = await usersCollection.doc(user.uid).get();

    if (snapshot.exists) {
      return;
    }

    const createdAt = new Date().toISOString();

    await usersCollection.doc(user.uid).set({
      id: user.uid,
      email: user.email ?? "",
      displayName: user.displayName ?? "Utilisateur Subly",
      photoUrl: user.photoURL ?? null,
      planTier: "free",
      currency: "EUR",
      notificationPreferences: {
        paymentReminders: true,
        trialReminders: true,
        insightNotifications: true,
        defaultReminderDaysBefore: 3
      },
      activeSubscriptionCount: 0,
      fcmTokens: [],
      createdAt,
      updatedAt: createdAt
    });
  }
};
