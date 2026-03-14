import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

const isLocalEmulator =
  process.env.FUNCTIONS_EMULATOR === "true" ||
  Boolean(process.env.FIRESTORE_EMULATOR_HOST) ||
  Boolean(process.env.FIREBASE_AUTH_EMULATOR_HOST);

const projectId =
  process.env.GCLOUD_PROJECT ?? process.env.GOOGLE_CLOUD_PROJECT ?? "subly-dev";

const adminApp =
  getApps()[0] ??
  initializeApp({
    ...(isLocalEmulator ? { projectId } : { credential: applicationDefault(), projectId })
  });

export const adminAuth = getAuth(adminApp);
export const db = getFirestore(adminApp);
export const adminMessaging = getMessaging(adminApp);
