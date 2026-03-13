# Subly API Reference

Base URL:

```text
https://<region>-<project-id>.cloudfunctions.net/api/api/v1
```

All protected routes require:

```http
Authorization: Bearer <firebase-id-token>
Content-Type: application/json
```

## Auth

### POST `/auth/register`

Creates a Firebase user and initial profile document.

Request:

```json
{
  "email": "sarah@subly.app",
  "password": "StrongPass!123",
  "displayName": "Sarah Miller"
}
```

Response:

```json
{
  "user": {
    "id": "uid_123",
    "email": "sarah@subly.app",
    "displayName": "Sarah Miller",
    "planTier": "free"
  },
  "customToken": "eyJhbGciOi..."
}
```

### POST `/auth/login`

Signs a user in using Firebase Identity Toolkit behind the API.

Request:

```json
{
  "email": "sarah@subly.app",
  "password": "StrongPass!123"
}
```

Response:

```json
{
  "idToken": "eyJhbGciOi...",
  "refreshToken": "AE0u-Nf...",
  "expiresIn": "3600",
  "user": {
    "id": "uid_123",
    "email": "sarah@subly.app",
    "displayName": "Sarah Miller",
    "planTier": "free"
  }
}
```

### POST `/auth/reset-password`

Request:

```json
{
  "email": "sarah@subly.app"
}
```

Response:

```json
{
  "message": "Password reset email sent."
}
```

## Subscriptions

### GET `/subscriptions`

Query parameters:

- `search`
- `categoryId`
- `sort=price_desc|price_asc|next_billing`
- `status=active|trial|paused|cancelled`

Response:

```json
{
  "data": [
    {
      "id": "sub_netflix_01",
      "providerName": "Netflix",
      "categoryId": "cat_entertainment",
      "price": 15.99,
      "currency": "USD",
      "billingFrequency": "monthly",
      "priceMonthly": 15.99,
      "priceYearly": 191.88,
      "nextBillingDate": "2026-03-21T00:00:00.000Z",
      "status": "active"
    }
  ],
  "meta": {
    "total": 1
  }
}
```

### POST `/subscriptions`

Request:

```json
{
  "providerName": "Spotify",
  "categoryId": "cat_music",
  "categoryName": "Music",
  "price": 10.99,
  "currency": "USD",
  "billingFrequency": "monthly",
  "nextBillingDate": "2026-03-29T00:00:00.000Z",
  "reminderDaysBefore": 3,
  "notes": "Family plan"
}
```

Response:

```json
{
  "data": {
    "id": "sub_spotify_01",
    "providerName": "Spotify",
    "normalizedProviderName": "spotify",
    "priceMonthly": 10.99,
    "priceYearly": 131.88,
    "status": "active"
  }
}
```

### PUT `/subscriptions/:id`

Request:

```json
{
  "price": 12.99,
  "billingFrequency": "monthly",
  "nextBillingDate": "2026-04-29T00:00:00.000Z",
  "notes": "Upgraded to premium family plan"
}
```

Response:

```json
{
  "data": {
    "id": "sub_spotify_01",
    "updatedAt": "2026-03-13T10:25:00.000Z"
  }
}
```

### DELETE `/subscriptions/:id`

Soft-archives the subscription to preserve history.

Response:

```json
{
  "message": "Subscription archived."
}
```

## Dashboard

### GET `/dashboard/summary`

Response:

```json
{
  "data": {
    "monthlySpending": 74.95,
    "yearlyEstimate": 899.4,
    "subscriptionCount": 6,
    "upcomingPayments": [
      {
        "subscriptionId": "sub_netflix_01",
        "providerName": "Netflix",
        "amount": 15.99,
        "dueDate": "2026-03-21T00:00:00.000Z"
      }
    ],
    "insights": [
      {
        "type": "unused_subscription",
        "message": "Adobe Creative Cloud has not been used in 34 days."
      }
    ]
  }
}
```

## Statistics

### GET `/statistics/overview`

Response:

```json
{
  "data": {
    "byCategory": [
      {
        "categoryId": "cat_entertainment",
        "categoryName": "Entertainment",
        "amountMonthly": 27.98
      }
    ],
    "monthlyTrend": [
      {
        "month": "2026-01",
        "amount": 68.44
      },
      {
        "month": "2026-02",
        "amount": 72.19
      },
      {
        "month": "2026-03",
        "amount": 74.95
      }
    ],
    "biggestSubscriptions": [
      {
        "subscriptionId": "sub_figma_01",
        "providerName": "Figma",
        "amountMonthly": 20
      }
    ]
  }
}
```

## Settings

### GET `/settings/profile`

Response:

```json
{
  "data": {
    "id": "uid_123",
    "email": "sarah@subly.app",
    "displayName": "Sarah Miller",
    "planTier": "free",
    "currency": "USD",
    "notificationPreferences": {
      "paymentReminders": true,
      "trialReminders": true,
      "insightNotifications": true,
      "defaultReminderDaysBefore": 3
    }
  }
}
```

### PATCH `/settings`

Request:

```json
{
  "currency": "EUR",
  "notificationPreferences": {
    "paymentReminders": true,
    "trialReminders": true,
    "insightNotifications": false,
    "defaultReminderDaysBefore": 5
  }
}
```

Response:

```json
{
  "data": {
    "id": "uid_123",
    "currency": "EUR",
    "updatedAt": "2026-03-13T12:00:00.000Z"
  }
}
```
