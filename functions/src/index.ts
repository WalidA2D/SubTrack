import cors from "cors";
import express from "express";
import helmet from "helmet";
import * as functionsV1 from "firebase-functions/v1";
import { onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";

import { dashboardRoutes } from "./routes/dashboardRoutes";
import { errorHandler } from "./middleware/errorHandler";
import { authRoutes } from "./routes/authRoutes";
import { settingsRoutes } from "./routes/settingsRoutes";
import { subscriptionRoutes } from "./routes/subscriptionRoutes";
import { statisticsRoutes } from "./routes/statisticsRoutes";
import {
  materializeDuePayments,
  subscriptionService
} from "./services/subscriptionService";
import { queueUpcomingNotifications } from "./services/notificationService";
import { userService } from "./services/userService";

const app = express();

app.use(cors({ origin: true }));
app.use(helmet());
app.use(express.json());

app.get("/health", async (_req, res) => {
  const activeCount = await subscriptionService.countAllActiveSubscriptions();

  res.json({
    status: "ok",
    activeSubscriptions: activeCount
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/subscriptions", subscriptionRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/statistics", statisticsRoutes);
app.use("/api/v1/settings", settingsRoutes);
app.use(errorHandler);

export const api = onRequest(
  {
    region: "europe-west1",
    timeoutSeconds: 60,
    memory: "512MiB"
  },
  app
);

export const sendBillingReminders = onSchedule(
  {
    schedule: "every 60 minutes",
    timeZone: "Etc/UTC",
    region: "europe-west1"
  },
  async () => {
    await queueUpcomingNotifications();
  }
);

export const generatePaymentHistory = onSchedule(
  {
    schedule: "every day 00:05",
    timeZone: "Etc/UTC",
    region: "europe-west1"
  },
  async () => {
    await materializeDuePayments();
  }
);

export const purgeDeletedAccounts = onSchedule(
  {
    schedule: "every day 03:15",
    timeZone: "Etc/UTC",
    region: "europe-west1"
  },
  async () => {
    await userService.purgeArchivedAccounts();
  }
);

export const syncUserProfile = functionsV1.auth.user().onCreate(async (user) => {
  await userService.provisionUserProfile(user);
});
