# Subly Product Blueprint

## 1. Product Vision

Subly helps users see every recurring payment in one place, understand where their money goes, and act before waste happens. The product focuses on three emotional outcomes:

- Clarity: users immediately understand total monthly and yearly recurring spend
- Control: reminders reduce accidental renewals and trial conversions
- Confidence: analytics help users cut redundant or underused services

The first release targets busy professionals, students, freelancers, and digital-heavy households managing 5 to 30 recurring services.

## 2. Technical Architecture

### Core stack

- Mobile app: React Native with Expo prebuild, TypeScript, React Navigation, Zustand, React Query
- Backend API: Express running in Firebase Cloud Functions v2
- Authentication: Firebase Authentication with email/password and password reset
- Database: Cloud Firestore with top-level collections for user-scoped querying
- Notifications: Firebase Cloud Messaging triggered by scheduled Cloud Functions
- Storage: Firebase Storage for avatars, receipt uploads, and future export files

### High-level flow

1. User authenticates with Firebase Authentication.
2. Mobile app stores the ID token and attaches it to API requests.
3. Cloud Functions validates the token and executes business logic.
4. Firestore stores subscriptions, generated payment history, notifications, and category metadata.
5. Scheduled functions scan upcoming billing windows and send FCM reminders.
6. Dashboard and statistics endpoints normalize billing frequencies into monthly and yearly values.

## 3. Monorepo Folder Structure

```text
subly/
|-- apps/
|   |-- mobile/
|   |   |-- App.tsx
|   |   |-- app.config.ts
|   |   |-- src/
|   |   |   |-- components/
|   |   |   |-- config/
|   |   |   |-- features/
|   |   |   |-- navigation/
|   |   |   |-- providers/
|   |   |   |-- services/
|   |   |   |-- store/
|   |   |   |-- theme/
|   |   |   `-- types/
|-- functions/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middleware/
|   |   |-- routes/
|   |   |-- services/
|   |   `-- utils/
|-- packages/
|   `-- shared/
|       `-- src/
|           |-- constants/
|           |-- contracts/
|           |-- models/
|           `-- utils/
|-- docs/
|-- examples/
|-- firebase.json
|-- firestore.rules
`-- firestore.indexes.json
```

## 4. Mobile Product Structure

### Navigation model

- Root stack
- Onboarding flow for first launch
- Auth stack for login, registration, password reset
- Main tab navigator after login
- Modal stack for add/edit subscription and quick actions

### Primary screens

1. Onboarding
   Outcome: communicate value quickly and capture first sign-up
2. Login / Register
   Outcome: fast account creation with email/password
3. Dashboard
   Outcome: give users immediate awareness of recurring spend
4. Subscription List
   Outcome: searchable, filterable portfolio of all subscriptions
5. Add Subscription
   Outcome: frictionless capture of service name, price, billing cycle, reminder
6. Subscription Details
   Outcome: complete view of metadata, payment history, and reminders
7. Statistics
   Outcome: spending trends, category split, biggest costs, unused service insights
8. Settings
   Outcome: notification, currency, billing, and privacy controls
9. Profile
   Outcome: account details, premium state, device/session management

### UX principles

- Financial dashboard aesthetic with calm surfaces and clear hierarchy
- Strong card layout with soft shadows and high-contrast key totals
- Plain-language insights instead of finance jargon
- Actionable states on every screen: edit, cancel, snooze, archive, upgrade
- Empty states that teach users what to do next

## 5. UI System

### Visual direction

- Primary: `#4F46E5`
- Secondary: `#6366F1`
- Background: `#F9FAFB`
- Surface: `#FFFFFF`
- Text primary: `#111827`
- Text secondary: `#6B7280`
- Success: `#10B981`
- Warning: `#F59E0B`
- Danger: `#EF4444`

### Typography

- Headings: bold geometric sans for confidence and clarity
- Body: highly readable neutral sans
- Numeric emphasis: tabular figures for totals and analytics

### Component inventory

- KPI cards
- Upcoming payment timeline cards
- Subscription list cards
- Category filter chips
- Insight banners
- Frequency selector
- Analytics blocks
- Settings rows with toggles and disclosure
- Premium paywall modal

## 6. Firestore Data Model

### Collection design

Top-level collections are used instead of deep user subcollections so backend jobs and analytics can query efficiently across large datasets while still enforcing strict `userId` ownership in rules.

Write access to billing data is intentionally centralized in Cloud Functions so premium limits, analytics normalization, and notification scheduling remain tamper-resistant.

#### `users`

- One document per authenticated user
- Stores preferences, plan tier, lifecycle state, and summary metadata

#### `subscriptions`

- Core recurring payment records
- Each record includes normalized provider name for duplicate detection
- Stores `priceMonthly` and `priceYearly` to avoid recalculating on every dashboard query

#### `payments`

- Materialized payment history generated by schedule jobs or user actions
- Powers historical charts and “upcoming payment” screens

#### `notifications`

- Stores scheduled reminders, delivery status, and payload history
- Useful for auditability and retry flows

#### `categories`

- System categories plus user-defined categories
- Supports filtering and chart groupings

### Relationship map

- `users.id` -> `subscriptions.userId`
- `subscriptions.id` -> `payments.subscriptionId`
- `users.id` -> `payments.userId`
- `users.id` -> `notifications.userId`
- `categories.id` -> `subscriptions.categoryId`

## 7. Business Logic

### Monthly and yearly totals

- `priceMonthly` is stored directly for fast dashboard reads
- Weekly subscriptions are normalized as `price * 52 / 12`
- Yearly subscriptions are normalized as `price / 12`
- `yearlyEstimate` is `priceYearly` summed across active and trial subscriptions

### Upcoming payments

- Query active subscriptions by `nextBillingDate`
- Filter to 7-day and 30-day windows
- Include trial endings when `trialEndsAt` exists

### Unused subscription insight

Initial heuristic for v1:

- Mark subscription as unused if `lastUsedAt` is older than 30 days
- Or if `usageCheckIn` is manually set to `unused`
- Or if a free trial is close to converting and the user has not confirmed intent to keep it

### Duplicate service detection

- Normalize provider names to lowercase, trimmed, punctuation-light values
- Group subscriptions by `normalizedProviderName`
- Show duplicates if more than one active subscription exists in the same user account

### History tracking

- Create a `payments` document whenever a billing cycle completes or is manually confirmed
- Append a `changeLog` summary when a subscription is edited significantly
- Keep soft-deleted subscriptions archived for analytics continuity

## 8. Authentication Design

### User flows

- Register with email, password, and display name
- Login with email/password
- Password reset via Firebase Auth reset email link
- Logout by clearing session on device
- Automatic profile provisioning through an auth-triggered backend function

### Security approach

- Mobile app uses Firebase ID tokens
- Functions verify tokens server-side before every protected route
- Firestore rules independently enforce ownership and prevent direct client writes to billing collections
- Premium entitlement lives in the user document and can later sync with app store receipts

## 9. Notification System

### Reminder types

- Upcoming payment reminders
- Free trial ending reminders
- Insight nudges for unused or duplicate subscriptions

### Delivery pipeline

1. Mobile app registers FCM token after permission grant.
2. Token is stored on the user profile or a future `devices` collection.
3. Scheduled Cloud Function runs every hour.
4. Function selects subscriptions with `nextBillingDate` or `trialEndsAt` within reminder windows.
5. Function creates `notifications` records and sends FCM payloads.
6. Failed deliveries are marked for retry.

### Reminder customization

- User sets default reminder lead time in settings
- Each subscription can override reminder timing
- Premium users can create multiple reminder steps

## 10. REST API Strategy

The app uses Firebase directly for authentication state and low-latency profile reads, while Cloud Functions provide a clean REST layer for business actions, analytics, and future third-party integrations.

### Protected domains

- `/subscriptions`
- `/dashboard`
- `/statistics`
- `/settings`

### Optional auth wrapper routes

- `/auth/register`
- `/auth/login`
- `/auth/reset-password`

These make it easier to support web, admin tooling, or BFF-style orchestration without changing the mobile client contract.

## 11. Freemium Monetization

### Free plan

- Up to 5 active subscriptions
- Basic dashboard totals
- One reminder per subscription
- Simplified category chart

### Premium plan

- Unlimited subscriptions
- Advanced analytics
- Export CSV/PDF reports
- Multiple reminders
- Priority insights and future bank/email integrations

### Upgrade triggers

- User hits 5 active subscriptions
- User opens advanced analytics tabs
- User tries custom multi-step reminders
- User requests exports

## 12. Scalability for 100k+ Users

### Why Firebase works well here

- Firebase Auth handles identity without managing auth infrastructure
- Firestore scales horizontally for user-scoped document workloads
- Cloud Functions auto-scale for bursty reads, writes, and scheduled jobs
- Cloud Messaging supports high-volume push delivery
- Security rules enforce multi-tenant boundaries close to the data layer

### Practical scale strategy

- Keep reads user-scoped and index-driven
- Precompute normalized `priceMonthly` and `priceYearly`
- Materialize payment history rather than recalculating it from raw subscription records
- Add daily aggregation documents later for very heavy analytics queries
- Batch notifications and send in chunks to respect FCM quotas
- Archive inactive subscriptions instead of deleting historical records

### Expected data shape at 100k users

- 100k user documents
- 1M to 3M subscription documents
- 10M+ payment history documents over time
- Scheduled notification throughput measured by near-term due windows, not by total dataset size

## 13. Release Readiness Checklist

- Auth, Firestore, Functions, Messaging configured per environment
- Firestore indexes deployed before production traffic
- Crash reporting and analytics enabled
- Feature flags for premium experiments
- App Store and Play Store purchase validation design approved
- Backups and export paths documented
- Security rules and cost monitoring reviewed

## 14. Post-MVP Growth Ideas

- Shared household workspaces
- Team or freelancer expense bundles
- Receipt scanning and email parsing
- Bank connection partner integration
- AI-generated savings recommendations
- Churn prevention campaigns for premium users
