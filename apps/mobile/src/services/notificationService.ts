export const notificationService = {
  async registerForPush() {
    return null;
  },

  async refreshToken() {
    return null;
  },

  listenForForegroundMessages(handler: (title?: string, body?: string) => void) {
    void handler;
    return () => undefined;
  }
};
