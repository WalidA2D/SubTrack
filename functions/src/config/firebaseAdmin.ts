import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

const adminApp =
  getApps()[0] ??
  initializeApp({
    credential: applicationDefault()
  });

export const adminAuth = getAuth(adminApp);
export const db = getFirestore(adminApp);
export const adminMessaging = getMessaging(adminApp);
