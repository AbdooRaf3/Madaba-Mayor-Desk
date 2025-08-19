import { initializeApp, getApps, cert, type App } from "firebase-admin/app"
import { getMessaging } from "firebase-admin/messaging"
import { getFirestore } from "firebase-admin/firestore"

let adminApp: App | null = null

export function getAdminApp() {
  if (adminApp) return adminApp
  if (getApps().length) {
    adminApp = getApps()[0]!
    return adminApp
  }

  // Uses default application credentials on Vercel (env vars / service account JSON)
  adminApp = initializeApp({
    // On Vercel, set GOOGLE_APPLICATION_CREDENTIALS or individual envs if needed
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    }),
  })
  return adminApp
}

export const adminDb = () => getFirestore(getAdminApp())
export const adminMessaging = () => getMessaging(getAdminApp())


