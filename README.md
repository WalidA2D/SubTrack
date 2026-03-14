# Subly

Subly is a startup-grade subscription management platform built for iOS and Android with a Firebase-native backend. This repository is structured as a monorepo so the product, mobile application, Cloud Functions API, shared contracts, and infrastructure rules evolve together.

## Stack

- Mobile: React Native + Expo prebuild + TypeScript
- Backend: Firebase Authentication, Firestore, Cloud Functions, Cloud Messaging, Storage
- Shared layer: TypeScript domain models and API contracts
- Product model: freemium with premium analytics and reminder automation

## Workspace Layout

```text
.
|-- apps/mobile              # React Native app for iOS + Android
|-- functions                # Firebase Cloud Functions REST API + schedulers
|-- packages/shared          # Shared domain types, DTOs, pricing limits
|-- docs                     # Product blueprint, UX, API reference
|-- examples                 # JSON examples for Firestore and REST payloads
|-- firebase.json            # Firebase runtime configuration
|-- firestore.rules          # Firestore security model
|-- firestore.indexes.json   # Firestore query indexes
```

## What Is Included

- End-to-end product blueprint in [docs/product-blueprint.md](/c:/Users/walid/Desktop/Projet%20debut/SubTrack/docs/product-blueprint.md)
- REST API contract in [docs/api-reference.md](/c:/Users/walid/Desktop/Projet%20debut/SubTrack/docs/api-reference.md)
- Firebase setup guide in [docs/firebase-setup.md](/c:/Users/walid/Desktop/Projet%20debut/SubTrack/docs/firebase-setup.md)
- French quickstart in [docs/getting-started-fr.md](/c:/Users/walid/Desktop/Projet%20debut/SubTrack/docs/getting-started-fr.md)
- Mobile build guide in [docs/mobile-builds.md](/c:/Users/walid/Desktop/Projet%20debut/SubTrack/docs/mobile-builds.md)
- Firestore sample documents in [examples/firestore-documents.json](/c:/Users/walid/Desktop/Projet%20debut/SubTrack/examples/firestore-documents.json)
- API payload examples in [examples/api-examples.json](/c:/Users/walid/Desktop/Projet%20debut/SubTrack/examples/api-examples.json)
- Shared business entities in [packages/shared/src/models/domain.ts](/c:/Users/walid/Desktop/Projet%20debut/SubTrack/packages/shared/src/models/domain.ts)
- Firebase function entrypoint in [functions/src/index.ts](/c:/Users/walid/Desktop/Projet%20debut/SubTrack/functions/src/index.ts)

## Product Highlights

- Unified subscription tracking for consumer and SaaS recurring spend
- Smart reminders for billing dates and trial endings
- Insight engine for unused and duplicate subscriptions
- Dashboard-ready analytics with monthly and yearly normalization
- Freemium plan gates designed for 100k+ users

## Build Roadmap

1. Install workspace dependencies.
2. Add Firebase project credentials and native mobile config files.
3. Run the Firebase emulator suite for local backend development.
4. Build the mobile app with Expo prebuild and EAS for native delivery.
5. Deploy Cloud Functions, Firestore rules, and indexes.

## Next Implementation Steps

- Add real form validation and React Hook Form controllers in the mobile app
- Connect purchases for premium upgrades with RevenueCat or App Store / Play Billing
- Expand scheduled billing materialization jobs and add analytics aggregation tables
- Introduce crash reporting, analytics, and A/B test hooks

npm run functions:serve
npm run seed:emulator
npm run mobile


