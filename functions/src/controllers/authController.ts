import { Request, Response } from "express";
import {
  DEFAULT_REMINDER_DAYS_BEFORE,
  DEFAULT_LANGUAGE,
  loginRequestSchema,
  registerRequestSchema,
  resetPasswordRequestSchema
} from "@subly/shared";

import { adminAuth, db } from "../config/firebaseAdmin";
import { requireEnv } from "../config/runtime";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const payload = registerRequestSchema.parse(req.body);
  const createdAt = new Date().toISOString();

  const userRecord = await adminAuth.createUser({
    email: payload.email,
    password: payload.password,
    displayName: payload.displayName
  });

  await db.collection("users").doc(userRecord.uid).set({
    id: userRecord.uid,
    email: payload.email,
    displayName: payload.displayName,
    photoUrl: null,
    planTier: "free",
    currency: "EUR",
    language: DEFAULT_LANGUAGE,
    colorBlindMode: false,
    notificationPreferences: {
      paymentReminders: true,
      trialReminders: true,
      insightNotifications: true,
      defaultReminderDaysBefore: DEFAULT_REMINDER_DAYS_BEFORE
    },
    activeSubscriptionCount: 0,
    fcmTokens: [],
    createdAt,
    updatedAt: createdAt
  });

  const customToken = await adminAuth.createCustomToken(userRecord.uid);

  res.status(201).json({
    user: {
      id: userRecord.uid,
      email: payload.email,
      displayName: payload.displayName,
      planTier: "free"
    },
    customToken
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const payload = loginRequestSchema.parse(req.body);
  const apiKey = requireEnv("AUTH_WEB_API_KEY");

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: payload.email,
        password: payload.password,
        returnSecureToken: true
      })
    }
  );

  const data = (await response.json()) as {
    error?: { message?: string };
    localId?: string;
    email?: string;
    displayName?: string;
    idToken?: string;
    refreshToken?: string;
    expiresIn?: string;
  };

  if (!response.ok || !data.localId || !data.idToken || !data.refreshToken || !data.expiresIn) {
    throw new ApiError(401, data.error?.message ?? "Email ou mot de passe invalide.");
  }

  const userSnapshot = await db.collection("users").doc(data.localId).get();
  const profile = userSnapshot.exists ? userSnapshot.data() : null;

  res.json({
    idToken: data.idToken,
    refreshToken: data.refreshToken,
    expiresIn: data.expiresIn,
    user: {
      id: data.localId,
      email: data.email ?? payload.email,
      displayName: profile?.displayName ?? data.displayName ?? "Utilisateur Subly",
      planTier: profile?.planTier ?? "free"
    }
  });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const payload = resetPasswordRequestSchema.parse(req.body);
  const apiKey = requireEnv("AUTH_WEB_API_KEY");

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        requestType: "PASSWORD_RESET",
        email: payload.email
      })
    }
  );

  if (!response.ok) {
    throw new ApiError(400, "Impossible d'envoyer l'email de reinitialisation.");
  }

  res.json({
    message: "Email de reinitialisation envoye."
  });
});
