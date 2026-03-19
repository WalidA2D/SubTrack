process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || "subly-dev";
process.env.GOOGLE_CLOUD_PROJECT =
  process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;
process.env.FIRESTORE_EMULATOR_HOST =
  process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8188";
process.env.FIREBASE_AUTH_EMULATOR_HOST =
  process.env.FIREBASE_AUTH_EMULATOR_HOST || "127.0.0.1:9099";

const { adminAuth, db } = require("../functions/lib/config/firebaseAdmin.js");
const {
  ensureDemoWorkspace
} = require("../functions/lib/services/demoWorkspaceService.js");

const sharedPassword = "StrongPass!123";

const demoUsers = [
  {
    uid: "mock-user-id",
    email: "demo@subly.app",
    displayName: "Demo Subly",
    password: sharedPassword,
    profile: { currency: "EUR", planTier: "free", defaultReminderDaysBefore: 3 }
  },
  {
    uid: "walid-demo-user",
    email: "walid.demo@subly.app",
    displayName: "Walid Demo",
    password: sharedPassword,
    profile: { currency: "EUR", planTier: "premium", defaultReminderDaysBefore: 1 }
  },
  {
    uid: "lea-bernard-user",
    email: "lea.bernard@subly.app",
    displayName: "Lea Bernard",
    password: sharedPassword,
    profile: { currency: "EUR", planTier: "free", defaultReminderDaysBefore: 2 }
  },
  {
    uid: "karim-saidi-user",
    email: "karim.saidi@subly.app",
    displayName: "Karim Saidi",
    password: sharedPassword,
    profile: { currency: "EUR", planTier: "premium", defaultReminderDaysBefore: 5 }
  },
  {
    uid: "ines-moreau-user",
    email: "ines.moreau@subly.app",
    displayName: "Ines Moreau",
    password: sharedPassword,
    profile: { currency: "USD", planTier: "free", defaultReminderDaysBefore: 3 }
  },
  {
    uid: "noah-martin-user",
    email: "noah.martin@subly.app",
    displayName: "Noah Martin",
    password: sharedPassword,
    profile: { currency: "GBP", planTier: "free", defaultReminderDaysBefore: 4 }
  },
  {
    uid: "camille-roger-user",
    email: "camille.roger@subly.app",
    displayName: "Camille Roger",
    password: sharedPassword,
    profile: { currency: "EUR", planTier: "premium", defaultReminderDaysBefore: 2 }
  },
  {
    uid: "yassine-belaid-user",
    email: "yassine.belaid@subly.app",
    displayName: "Yassine Belaid",
    password: sharedPassword,
    profile: { currency: "CHF", planTier: "free", defaultReminderDaysBefore: 7 }
  },
  {
    uid: "sarah-nguyen-user",
    email: "sarah.nguyen@subly.app",
    displayName: "Sarah Nguyen",
    password: sharedPassword,
    profile: { currency: "CAD", planTier: "premium", defaultReminderDaysBefore: 3 }
  },
  {
    uid: "tom-rossi-user",
    email: "tom.rossi@subly.app",
    displayName: "Tom Rossi",
    password: sharedPassword,
    profile: { currency: "EUR", planTier: "free", defaultReminderDaysBefore: 6 }
  }
];

async function ensureAuthUser(user) {
  try {
    await adminAuth.getUser(user.uid);
    await adminAuth.updateUser(user.uid, {
      email: user.email,
      password: user.password,
      displayName: user.displayName
    });
    return "updated";
  } catch (error) {
    const code = error && typeof error === "object" ? error.code : "";

    if (code !== "auth/user-not-found") {
      throw error;
    }
  }

  await adminAuth.createUser({
    uid: user.uid,
    email: user.email,
    password: user.password,
    displayName: user.displayName
  });

  return "created";
}

async function applyProfileOverrides(user) {
  await db.collection("users").doc(user.uid).set(
    {
      displayName: user.displayName,
      email: user.email,
      planTier: user.profile.planTier,
      currency: user.profile.currency,
      notificationPreferences: {
        notificationsEnabled: true,
        paymentReminders: true,
        trialReminders: true,
        insightNotifications: true,
        defaultReminderDaysBefore: user.profile.defaultReminderDaysBefore
      },
      updatedAt: new Date().toISOString()
    },
    { merge: true }
  );
}

async function main() {
  console.log("Seeding Firebase Emulator...");
  console.log(`Project: ${process.env.GCLOUD_PROJECT}`);
  console.log(`Firestore: ${process.env.FIRESTORE_EMULATOR_HOST}`);
  console.log(`Auth: ${process.env.FIREBASE_AUTH_EMULATOR_HOST}`);
  console.log(`Password commun de test: ${sharedPassword}`);

  for (const user of demoUsers) {
    const authStatus = await ensureAuthUser(user);
    await ensureDemoWorkspace(user);
    await applyProfileOverrides(user);

    console.log(
      `- ${user.uid}: auth ${authStatus}, workspace seeded (${user.email}, ${user.profile.planTier}, ${user.profile.currency})`
    );
  }

  console.log(`Seed termine. ${demoUsers.length} utilisateurs prets.`);
}

main().catch((error) => {
  console.error("Seed impossible.");
  console.error(error);
  process.exitCode = 1;
});
