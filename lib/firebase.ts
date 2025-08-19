import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID as string,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID as string,
}

function assertFirebaseEnv(cfg: Record<string, string | undefined>) {
  const missing = Object.entries(cfg)
    .filter(([, v]) => !v)
    .map(([k]) => k)
  if (missing.length > 0) {
    throw new Error(`Missing Firebase env vars: ${missing.join(", ")}`)
  }
}

assertFirebaseEnv(firebaseConfig)

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

// Messaging will be initialized when needed via getMessaging()

export const getFirebaseAuth = () => auth
export const getFirebaseDb = () => db

export const getMessaging = async () => {
  if (typeof window !== "undefined") {
    try {
      // Use static import instead of dynamic import
      const { getMessaging: getMsg, isSupported } = require("firebase/messaging")
      const supported = await isSupported()
      if (supported) {
        return getMsg(app)
      }
    } catch (error) {
      console.error("Messaging initialization error:", error)
    }
  }
  return null
}

export default app
