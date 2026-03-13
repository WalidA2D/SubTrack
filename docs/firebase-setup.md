# Firebase Setup Guide

## Services to Enable

Enable these Firebase services in the project:

- Authentication with Email/Password sign-in
- Firestore in native mode
- Cloud Functions
- Cloud Messaging
- Storage

## Project Configuration

### Firebase project IDs

- Local emulator target: `subly-dev`
- Production target example: `subly-prod`

### Required runtime secret

Set this for Cloud Functions:

```text
FIREBASE_WEB_API_KEY=<firebase web api key>
```

This is required for the REST wrapper endpoints:

- `POST /auth/login`
- `POST /auth/reset-password`

## Mobile Configuration

Place the Firebase native config files in [apps/mobile](/c:/Users/walid/Desktop/Projet%20debut/SubTrack/apps/mobile):

- `google-services.json` for Android
- `GoogleService-Info.plist` for iOS

The Expo app config already expects those paths in [app.config.ts](/c:/Users/walid/Desktop/Projet%20debut/SubTrack/apps/mobile/app.config.ts).

## Firestore Collections

Primary collections already modeled in this repo:

- `users`
- `subscriptions`
- `payments`
- `notifications`
- `categories`

Collection field examples live in [examples/firestore-documents.json](/c:/Users/walid/Desktop/Projet%20debut/SubTrack/examples/firestore-documents.json).

## Security and Indexes

- Firestore rules: [firestore.rules](/c:/Users/walid/Desktop/Projet%20debut/SubTrack/firestore.rules)
- Firestore indexes: [firestore.indexes.json](/c:/Users/walid/Desktop/Projet%20debut/SubTrack/firestore.indexes.json)
- Storage rules: [storage.rules](/c:/Users/walid/Desktop/Projet%20debut/SubTrack/storage.rules)

Deploy these before production traffic so dashboard and payment-history queries do not fail under load.

## Messaging Flow

1. Mobile app requests push permission through [notificationService.ts](/c:/Users/walid/Desktop/Projet%20debut/SubTrack/apps/mobile/src/services/notificationService.ts).
2. FCM token is stored on the user document.
3. Scheduled Cloud Function `sendBillingReminders` scans upcoming billing windows every hour.
4. Notification records are written to Firestore for auditability.
5. Push notifications are sent through Firebase Cloud Messaging.

## Auth Lifecycle

- `syncUserProfile` runs on Firebase Auth user creation and ensures every authenticated user gets a matching Firestore profile document.
- Billing collections are server-write only, which keeps freemium limits and analytics trustworthy.

## Local Development

1. Install workspace dependencies.
2. Copy `functions/.env.example` to a real env file or set emulator env vars.
3. Run the Firebase emulator suite from the repository root.
4. Start the mobile app and point `EXPO_PUBLIC_API_BASE_URL` to the local functions endpoint.
