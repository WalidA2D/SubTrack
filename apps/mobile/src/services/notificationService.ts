import messaging from "@react-native-firebase/messaging";

export const notificationService = {
  async registerForPush() {
    await messaging().requestPermission();
    return messaging().getToken();
  },

  async refreshToken() {
    return messaging().getToken();
  },

  listenForForegroundMessages(handler: (title?: string, body?: string) => void) {
    return messaging().onMessage(async (message) => {
      handler(message.notification?.title, message.notification?.body);
    });
  }
};
