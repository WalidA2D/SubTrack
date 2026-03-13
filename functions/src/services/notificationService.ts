import { Subscription } from "@subly/shared";

import { adminMessaging, db } from "../config/firebaseAdmin";
import { isWithinCurrentHour, subtractDays } from "../utils/date";

const notificationsCollection = db.collection("notifications");
const subscriptionsCollection = db.collection("subscriptions");
const usersCollection = db.collection("users");

function buildNotificationId(type: string, subscriptionId: string, targetIso: string) {
  return `${type}_${subscriptionId}_${targetIso.slice(0, 13).replace(/[:]/g, "-")}`;
}

async function sendPushToUser(
  userId: string,
  title: string,
  body: string,
  data: Record<string, string>
) {
  const userSnapshot = await usersCollection.doc(userId).get();
  const profile = userSnapshot.data() as { fcmTokens?: string[] } | undefined;
  const tokens = profile?.fcmTokens ?? [];

  if (tokens.length === 0) {
    return false;
  }

  const response = await adminMessaging.sendEachForMulticast({
    tokens,
    notification: {
      title,
      body
    },
    data
  });

  return response.failureCount === 0;
}

async function createAndSendNotification(
  subscription: Subscription,
  type: "payment_due" | "trial_ending",
  scheduledFor: string,
  title: string,
  body: string
) {
  const notificationId = buildNotificationId(type, subscription.id, scheduledFor);
  const notificationReference = notificationsCollection.doc(notificationId);
  const existing = await notificationReference.get();

  if (existing.exists) {
    return;
  }

  const delivered = await sendPushToUser(subscription.userId, title, body, {
    subscriptionId: subscription.id,
    type
  });

  await notificationReference.set({
    id: notificationId,
    userId: subscription.userId,
    subscriptionId: subscription.id,
    type,
    title,
    body,
    scheduledFor,
    status: delivered ? "sent" : "failed",
    channels: ["push"],
    createdAt: new Date().toISOString()
  });
}

export async function queueUpcomingNotifications() {
  const nowIso = new Date().toISOString();
  const maxWindow = new Date();
  maxWindow.setDate(maxWindow.getDate() + 30);
  const maxWindowIso = maxWindow.toISOString();

  const billingSnapshot = await subscriptionsCollection
    .where("nextBillingDate", ">=", nowIso)
    .where("nextBillingDate", "<=", maxWindowIso)
    .get();

  for (const document of billingSnapshot.docs) {
    const subscription = document.data() as Subscription;

    if (subscription.archivedAt || (subscription.status !== "active" && subscription.status !== "trial")) {
      continue;
    }

    const reminderAt = subtractDays(
      subscription.nextBillingDate,
      subscription.reminderDaysBefore
    );

    if (isWithinCurrentHour(reminderAt)) {
      await createAndSendNotification(
        subscription,
        "payment_due",
        reminderAt,
        `${subscription.providerName} renews soon`,
        `Your ${subscription.providerName} subscription will charge ${subscription.currency} ${subscription.price.toFixed(2)} on ${subscription.nextBillingDate.slice(0, 10)}.`
      );
    }
  }

  const trialSnapshot = await subscriptionsCollection
    .where("trialEndsAt", ">=", nowIso)
    .where("trialEndsAt", "<=", maxWindowIso)
    .get();

  for (const document of trialSnapshot.docs) {
    const subscription = document.data() as Subscription;

    if (!subscription.trialEndsAt || subscription.archivedAt) {
      continue;
    }

    const reminderAt = subtractDays(
      subscription.trialEndsAt,
      subscription.reminderDaysBefore
    );

    if (isWithinCurrentHour(reminderAt)) {
      await createAndSendNotification(
        subscription,
        "trial_ending",
        reminderAt,
        `${subscription.providerName} trial ends soon`,
        `Your free trial for ${subscription.providerName} ends on ${subscription.trialEndsAt.slice(0, 10)}.`
      );
    }
  }
}
