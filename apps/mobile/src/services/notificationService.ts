import Constants from "expo-constants";
import { Platform } from "react-native";

type NotificationModule = typeof import("expo-notifications");
type NativeSubscription = { remove: () => void };

let notificationsModulePromise: Promise<NotificationModule> | null = null;
let isNotificationServiceReady = false;
const isExpoGo = Constants.executionEnvironment === "storeClient";

function getNotificationsModule() {
  notificationsModulePromise ??= import("expo-notifications");
  return notificationsModulePromise;
}

async function ensureNotificationService() {
  if (isExpoGo) {
    return null;
  }

  const Notifications = await getNotificationsModule();

  if (!isNotificationServiceReady) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false
      })
    });

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Subly",
        importance: Notifications.AndroidImportance.DEFAULT
      });
    }

    isNotificationServiceReady = true;
  }

  return Notifications;
}

function extractToken(token: { data: unknown } | null | undefined) {
  return typeof token?.data === "string" && token.data.trim().length > 0 ? token.data : null;
}

export const notificationService = {
  async initialize() {
    try {
      await ensureNotificationService();
    } catch {
      // Keep startup resilient on simulators or when native notifications are unavailable.
    }
  },

  async registerForPush() {
    try {
      const Notifications = await ensureNotificationService();

      if (!Notifications) {
        return null;
      }

      const currentPermissions = await Notifications.getPermissionsAsync();
      let status = currentPermissions.status;

      if (status !== "granted") {
        const requestedPermissions = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true
          }
        });
        status = requestedPermissions.status;
      }

      if (status !== "granted") {
        return null;
      }

      return extractToken(await Notifications.getDevicePushTokenAsync());
    } catch {
      return null;
    }
  },

  async refreshToken() {
    try {
      const Notifications = await ensureNotificationService();

      if (!Notifications) {
        return null;
      }

      return extractToken(await Notifications.getDevicePushTokenAsync());
    } catch {
      return null;
    }
  },

  listenForForegroundMessages(handler: (title?: string, body?: string) => void) {
    let subscription: NativeSubscription | null = null;

    void ensureNotificationService()
      .then((Notifications) => {
        if (!Notifications) {
          return;
        }

        subscription = Notifications.addNotificationReceivedListener((notification) => {
          handler(notification.request.content.title ?? undefined, notification.request.content.body ?? undefined);
        });
      })
      .catch(() => undefined);

    return () => {
      subscription?.remove();
    };
  },

  listenForTokenRefresh(handler: (token: string) => void) {
    let subscription: NativeSubscription | null = null;

    void ensureNotificationService()
      .then((Notifications) => {
        if (!Notifications) {
          return;
        }

        subscription = Notifications.addPushTokenListener((token) => {
          const normalizedToken = extractToken(token);

          if (normalizedToken) {
            handler(normalizedToken);
          }
        });
      })
      .catch(() => undefined);

    return () => {
      subscription?.remove();
    };
  }
};
