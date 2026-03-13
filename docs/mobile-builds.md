# Builds iOS / Android

Subly is a cross-platform mobile app built with React Native + Expo prebuild.

Supported targets:

- iOS
- Android

## Mobile stack

- Shared UI: React Native
- Navigation: React Navigation
- Native Firebase: `@react-native-firebase/*`
- Cloud builds: EAS Build

## Android local on Windows

1. Install Android Studio
2. Create an Android emulator
3. Install repository dependencies
4. Add `google-services.json` in [apps/mobile](/c:/Users/walid/Desktop/Projet%20debut/SubTrack/apps/mobile)
5. Start:

```powershell
cd "c:\Users\walid\Desktop\Projet debut\SubTrack"
npm install
npm run functions:serve
npm run android
```

## iOS

For iOS, either:

- use a Mac with Xcode and run `expo run:ios`
- or use EAS Build from the cloud

Add `GoogleService-Info.plist` in [apps/mobile](/c:/Users/walid/Desktop/Projet%20debut/SubTrack/apps/mobile), then run:

```powershell
cd "c:\Users\walid\Desktop\Projet debut\SubTrack"
npm install
npx eas login
npx eas build --platform ios --profile preview
```

## Android build

```powershell
cd "c:\Users\walid\Desktop\Projet debut\SubTrack"
npm install
npx eas login
npx eas build --platform android --profile preview
```

## Production builds

Android:

```powershell
npx eas build --platform android --profile production
```

iOS:

```powershell
npx eas build --platform ios --profile production
```

## Required files

In [apps/mobile](/c:/Users/walid/Desktop/Projet%20debut/SubTrack/apps/mobile):

- `google-services.json`
- `GoogleService-Info.plist`
- `.env` based on [apps/mobile/.env.example](/c:/Users/walid/Desktop/Projet%20debut/SubTrack/apps/mobile/.env.example)

In [functions](/c:/Users/walid/Desktop/Projet%20debut/SubTrack/functions):

- `.env` based on [functions/.env.example](/c:/Users/walid/Desktop/Projet%20debut/SubTrack/functions/.env.example)

## Note

On Windows, local development is practical for Android.
For iOS without a Mac, use `EAS Build`.
