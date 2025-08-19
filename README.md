<<<<<<< HEAD
# Mayor Schedule

Scheduling system built with Next.js 15, React 19, TailwindCSS 4, and Firebase (Auth, Firestore, Functions, FCM).

## Getting Started

### 1) Setup env

Create `.env.local` in project root:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
FIREBASE_VAPID_KEY=...
```

See `.env.local.example` for a template.

### 2) Install & run dev server

```bash
npm install
npm run dev
```

Open http://localhost:3000 (or the port shown in the terminal).

### 3) Firebase
- Deploy rules and functions:
```
firebase deploy --only firestore:rules,functions
```
- Initialize first admin (one-time):
  - Sign in with the account to be admin
  - Visit `/admin-init` and click "تعيين نفسي كمدير"

## Features
- Role-based access: admin, secretary, mayor
- Appointments management with advanced search
- Offline support (basic localStorage cache)
- Push notifications via FCM (foreground + background)

## Notes
- Environment variables are required; app will throw if missing.
- FCM tokens stored in `users/{uid}.fcmTokens`.
- Firestore rules enforce role-safe CRUD.
=======
# Madaba-Mayor-Desk
Madaba-Mayor-Desk
>>>>>>> fb5952ba55a500e83f93566e7a6913cfdee176e5

