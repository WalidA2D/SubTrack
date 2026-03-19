import {
  ACCOUNT_DELETION_RETENTION_DAYS,
  DEFAULT_LANGUAGE,
  UpdateSettingsRequest
} from "@subly/shared";

import { adminAuth, db } from "../config/firebaseAdmin";
import { ApiError } from "../utils/apiError";
import { syncPremiumPlanStatus } from "./premiumMembershipService";

const usersCollection = db.collection("users");
const categoriesCollection = db.collection("categories");
const subscriptionsCollection = db.collection("subscriptions");
const paymentsCollection = db.collection("payments");
const notificationsCollection = db.collection("notifications");

function buildNotificationPreferences(
  preferences?: Record<string, unknown>
) {
  return {
    notificationsEnabled:
      typeof preferences?.notificationsEnabled === "boolean"
        ? preferences.notificationsEnabled
        : true,
    paymentReminders:
      typeof preferences?.paymentReminders === "boolean"
        ? preferences.paymentReminders
        : true,
    trialReminders:
      typeof preferences?.trialReminders === "boolean"
        ? preferences.trialReminders
        : true,
    insightNotifications:
      typeof preferences?.insightNotifications === "boolean"
        ? preferences.insightNotifications
        : true,
    defaultReminderDaysBefore:
      typeof preferences?.defaultReminderDaysBefore === "number"
        ? preferences.defaultReminderDaysBefore
        : 3
  };
}

function buildFcmTokens(tokens?: unknown) {
  if (!Array.isArray(tokens)) {
    return [];
  }

  return Array.from(
    new Set(
      tokens
        .filter((token): token is string => typeof token === "string")
        .map((token) => token.trim())
        .filter((token) => token.length > 0)
    )
  ).slice(-20);
}

function buildDeletionSchedule(referenceDate = new Date()) {
  const deletionRequestedAt = referenceDate.toISOString();
  const deletionScheduledForDate = new Date(referenceDate);
  deletionScheduledForDate.setUTCDate(
    deletionScheduledForDate.getUTCDate() + ACCOUNT_DELETION_RETENTION_DAYS
  );

  return {
    deletionRequestedAt,
    deletionScheduledFor: deletionScheduledForDate.toISOString()
  };
}

async function deleteDocumentsByUserId(
  collection: FirebaseFirestore.CollectionReference,
  userId: string
) {
  const snapshot = await collection.where("userId", "==", userId).get();

  if (snapshot.empty) {
    return;
  }

  for (let index = 0; index < snapshot.docs.length; index += 400) {
    const batch = db.batch();

    snapshot.docs.slice(index, index + 400).forEach((document) => {
      batch.delete(document.ref);
    });

    await batch.commit();
  }
}

async function updateUserSubscriptionsCurrency(userId: string, currency: string) {
  const snapshot = await subscriptionsCollection.where("userId", "==", userId).get();

  if (snapshot.empty) {
    return;
  }

  const updatedAt = new Date().toISOString();

  for (let index = 0; index < snapshot.docs.length; index += 400) {
    const batch = db.batch();

    snapshot.docs.slice(index, index + 400).forEach((document) => {
      batch.set(
        document.ref,
        {
          currency,
          updatedAt
        },
        { merge: true }
      );
    });

    await batch.commit();
  }
}

function isFirebaseUserNotFound(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "auth/user-not-found"
  );
}

export const userService = {
  async getProfile(userId: string) {
    await syncPremiumPlanStatus(userId);
    const snapshot = await usersCollection.doc(userId).get();

    if (!snapshot.exists) {
      throw new ApiError(404, "Profil utilisateur introuvable.");
    }

    return {
      language: DEFAULT_LANGUAGE,
      colorBlindMode: false,
      ...snapshot.data(),
      notificationPreferences: buildNotificationPreferences(
        (snapshot.data() as { notificationPreferences?: Record<string, unknown> } | undefined)
          ?.notificationPreferences
      )
    };
  },

  async updateSettings(userId: string, payload: UpdateSettingsRequest) {
    const snapshot = await usersCollection.doc(userId).get();

    if (!snapshot.exists) {
      throw new ApiError(404, "Profil utilisateur introuvable.");
    }

    const current = snapshot.data() as {
      language?: string;
      colorBlindMode?: boolean;
      fcmTokens?: string[];
      notificationPreferences?: Record<string, unknown>;
    };

    const nextPreferences = payload.notificationPreferences
      ? buildNotificationPreferences({
          ...(current.notificationPreferences ?? {}),
          ...payload.notificationPreferences
        })
      : buildNotificationPreferences(current.notificationPreferences);
    const nextFcmTokens =
      payload.fcmTokens !== undefined
        ? buildFcmTokens(payload.fcmTokens)
        : buildFcmTokens(current.fcmTokens);

    const nextProfile = {
      ...(payload.currency ? { currency: payload.currency } : {}),
      ...(payload.language ? { language: payload.language } : {}),
      ...(payload.planTier ? { planTier: payload.planTier } : {}),
      ...(payload.colorBlindMode !== undefined ? { colorBlindMode: payload.colorBlindMode } : {}),
      ...(payload.fcmTokens !== undefined ? { fcmTokens: nextFcmTokens } : {}),
      ...(nextPreferences ? { notificationPreferences: nextPreferences } : {}),
      updatedAt: new Date().toISOString()
    };

    await usersCollection.doc(userId).set(nextProfile, { merge: true });

    if (payload.currency) {
      await updateUserSubscriptionsCurrency(userId, payload.currency);
    }

    return {
      id: userId,
      language: DEFAULT_LANGUAGE,
      colorBlindMode: false,
      ...snapshot.data(),
      fcmTokens: nextFcmTokens,
      notificationPreferences: nextPreferences,
      ...nextProfile
    };
  },

  async assertAccountAccessible(userId: string) {
    const snapshot = await usersCollection.doc(userId).get();

    if (!snapshot.exists) {
      return;
    }

    const data = snapshot.data() as {
      accountStatus?: string;
      deletionScheduledFor?: string | null;
    };

    if (data.accountStatus === "pending_deletion") {
      const suffix = data.deletionScheduledFor
        ? ` jusqu'au ${new Date(data.deletionScheduledFor).toLocaleDateString("fr-FR")}`
        : "";
      throw new ApiError(
        403,
        `Ce compte est en attente de suppression${suffix}.`
      );
    }
  },

  async requestAccountDeletion(userId: string) {
    const snapshot = await usersCollection.doc(userId).get();

    if (!snapshot.exists) {
      throw new ApiError(404, "Profil utilisateur introuvable.");
    }

    const current = snapshot.data() as {
      accountStatus?: string;
      deletionRequestedAt?: string;
      deletionScheduledFor?: string;
    };

    if (
      current.accountStatus === "pending_deletion" &&
      current.deletionRequestedAt &&
      current.deletionScheduledFor
    ) {
      return {
        deletionRequestedAt: current.deletionRequestedAt,
        deletionScheduledFor: current.deletionScheduledFor
      };
    }

    const schedule = buildDeletionSchedule();
    const now = new Date().toISOString();

    await usersCollection.doc(userId).set(
      {
        accountStatus: "pending_deletion",
        deletionRequestedAt: schedule.deletionRequestedAt,
        deletionScheduledFor: schedule.deletionScheduledFor,
        updatedAt: now
      },
      { merge: true }
    );

    try {
      await adminAuth.updateUser(userId, {
        disabled: true
      });
      await adminAuth.revokeRefreshTokens(userId);
    } catch (error) {
      if (!isFirebaseUserNotFound(error)) {
        throw error;
      }
    }

    return schedule;
  },

  async purgeArchivedAccounts() {
    const now = new Date().toISOString();
    const snapshot = await usersCollection
      .where("deletionScheduledFor", "<=", now)
      .get();

    if (snapshot.empty) {
      return;
    }

    for (const document of snapshot.docs) {
      const userId = document.id;
      const data = document.data() as { accountStatus?: string };

      if (data.accountStatus !== "pending_deletion") {
        continue;
      }

      await Promise.all([
        deleteDocumentsByUserId(subscriptionsCollection, userId),
        deleteDocumentsByUserId(categoriesCollection, userId),
        deleteDocumentsByUserId(paymentsCollection, userId),
        deleteDocumentsByUserId(notificationsCollection, userId)
      ]);

      await usersCollection.doc(userId).delete();

      try {
        await adminAuth.deleteUser(userId);
      } catch (error) {
        if (!isFirebaseUserNotFound(error)) {
          throw error;
        }
      }
    }
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
      language: DEFAULT_LANGUAGE,
      colorBlindMode: false,
      notificationPreferences: {
        notificationsEnabled: true,
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
