# Demarrage local Subly

Ce guide te donne la config exacte pour lancer Subly comme app mobile iOS + Android avec Firebase.

## 0. Mode de test recommande pour maintenant

Tant que tu n'as pas de compte developpeur Apple, le plus simple est :

- iPhone + Expo Go
- Firebase JS SDK cote mobile
- backend Firebase local via emulateurs

Le chemin `development build` iOS reste possible plus tard, mais il n'est plus obligatoire pour tester l'app maintenant.

## 1. Valeurs exactes du projet

Utilise ces valeurs dans Firebase :

- Nom app : `Subly`
- Firebase project dev : `subly-dev`
- Firebase project prod : `subly-prod`
- Android package name : `com.subly.app`
- iOS bundle identifier : `com.subly.app`
- Expo scheme : `subly`
- Region Cloud Functions : `europe-west1`

Les valeurs mobile sont deja configurees dans [apps/mobile/app.config.ts](/c:/Users/walid/Desktop/Projet%20debut/SubTrack/apps/mobile/app.config.ts).

## 2. Services Firebase a activer

Dans la console Firebase, active :

- Authentication
- Firestore Database
- Cloud Functions
- Cloud Messaging
- Storage

Dans Authentication :

- Active le provider `Email/Password`

## 3. Apps Firebase a creer

### Android

Ajoute une app Android avec :

- Package name : `com.subly.app`

Puis telecharge :

- `google-services.json`

Et place le fichier ici :

- [apps/mobile](/c:/Users/walid/Desktop/Projet%20debut/SubTrack/apps/mobile)

### iOS

Ajoute une app iOS avec :

- Bundle ID : `com.subly.app`

Puis telecharge :

- `GoogleService-Info.plist`

Et place le fichier ici :

- [apps/mobile](/c:/Users/walid/Desktop/Projet%20debut/SubTrack/apps/mobile)

### Web

Ajoute aussi une app Web Firebase. Elle sert surtout a recuperer la Web API key pour les routes REST d'auth.

Recupere :

- `Web API Key`

Puis ajoute-la dans :

- [functions/.env](/c:/Users/walid/Desktop/Projet%20debut/SubTrack/functions/.env)

Format :

```env
AUTH_WEB_API_KEY=your-real-key
```

## 4. Fichiers .env

Depuis la racine du projet :

```powershell
cd "c:\Users\walid\Desktop\Projet debut\SubTrack"
npm run setup:local
```

Cela cree si besoin :

- [apps/mobile/.env](/c:/Users/walid/Desktop/Projet%20debut/SubTrack/apps/mobile/.env)
- [functions/.env](/c:/Users/walid/Desktop/Projet%20debut/SubTrack/functions/.env)

### API locale Android emulator

Dans [apps/mobile/.env](/c:/Users/walid/Desktop/Projet%20debut/SubTrack/apps/mobile/.env), garde :

```env
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:5001/subly-dev/europe-west1/api/api/v1
```

### API locale telephone physique

Si tu testes sur un vrai telephone, remplace par l'IP de ton PC sur le meme Wi-Fi :

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.24:5001/subly-dev/europe-west1/api/api/v1
```

## 5. Installer les prerequis

Installe :

- Node.js 20+
- npm
- Android Studio
- Un emulateur Android
- Java SDK via Android Studio

Optionnel mais recommande :

- Firebase CLI : `npm install -g firebase-tools`
- EAS CLI : `npm install -g eas-cli`

## 6. Installer le projet

Depuis la racine :

```powershell
cd "c:\Users\walid\Desktop\Projet debut\SubTrack"
npm install
```

## 7. Lancer Firebase en local

Dans un terminal :

```powershell
cd "c:\Users\walid\Desktop\Projet debut\SubTrack"
npm run functions:serve
```

Comme `.firebaserc` pointe maintenant vers `subly-dev`, l'emulateur utilise ce projet par defaut.

## 8. Lancer Android en local

Dans un second terminal :

```powershell
cd "c:\Users\walid\Desktop\Projet debut\SubTrack"
npm run android
```

Si c'est le premier lancement, cela construit le client natif avec `expo run:android`.

## 9. Lancer iPhone avec Expo Go

Dans un second terminal :

```powershell
cd "c:\Users\walid\Desktop\Projet debut\SubTrack"
npm run mobile
```

Puis :

1. Ouvre Expo Go sur l'iPhone
2. Scanne le QR code
3. Verifie que l'iPhone et le PC sont sur le meme Wi-Fi

Important :

- dans [apps/mobile/.env](/c:/Users/walid/Desktop/Projet%20debut/SubTrack/apps/mobile/.env), garde l'IP locale du PC pour l'iPhone
- ne mets pas `10.0.2.2` pour l'iPhone

## 10. Lancer iOS plus tard avec un compte Apple

### Option A - avec un Mac

Depuis un Mac avec Xcode :

```powershell
cd "c:\Users\walid\Desktop\Projet debut\SubTrack"
npm install
npm run ios
```

### Option B - depuis Windows avec EAS Build

Depuis Windows :

```powershell
cd "c:\Users\walid\Desktop\Projet debut\SubTrack"
npm install
npx eas login
npx eas build --platform ios --profile preview
```

## 11. Build Android

Pour un build partageable Android :

```powershell
cd "c:\Users\walid\Desktop\Projet debut\SubTrack"
npx eas login
npx eas build --platform android --profile preview
```

Pour la prod :

```powershell
npx eas build --platform android --profile production
```

## 12. Checklist rapide

Avant de lancer, verifie :

- `apps/mobile/google-services.json` existe
- `apps/mobile/GoogleService-Info.plist` existe
- `apps/mobile/.env` existe
- `functions/.env` existe
- `functions/.env` contient une vraie `AUTH_WEB_API_KEY`
- Email/Password est active dans Firebase Auth
- L'emulateur Android est demarre
- Si tu testes sur iPhone, Expo Go est installe sur l'appareil

## 13. En cas de blocage

Les endroits les plus utiles a verifier sont :

- [README.md](/c:/Users/walid/Desktop/Projet%20debut/SubTrack/README.md)
- [docs/firebase-setup.md](/c:/Users/walid/Desktop/Projet%20debut/SubTrack/docs/firebase-setup.md)
- [docs/mobile-builds.md](/c:/Users/walid/Desktop/Projet%20debut/SubTrack/docs/mobile-builds.md)
- [functions/src/index.ts](/c:/Users/walid/Desktop/Projet%20debut/SubTrack/functions/src/index.ts)
- [apps/mobile/app.config.ts](/c:/Users/walid/Desktop/Projet%20debut/SubTrack/apps/mobile/app.config.ts)
