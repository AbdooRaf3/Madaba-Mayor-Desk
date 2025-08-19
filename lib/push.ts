import { getMessaging as getClientMessaging, db } from "./firebase"
import { getToken, onMessage } from "firebase/messaging"
import { doc, setDoc, arrayUnion } from "firebase/firestore"

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission()
    if (permission === "granted") {
      console.log("Notification permission granted.")
      return await getNotificationToken()
    } else {
      console.log("Unable to get permission to notify.")
      return null
    }
  } catch (error) {
    console.error("An error occurred while retrieving token. ", error)
    return null
  }
}

export const getNotificationToken = async () => {
  try {
    const messagingInstance = await getClientMessaging()
    if (!messagingInstance) return null

    const response = await fetch("/api/get-vapid-key")
    const { vapidKey } = await response.json()

    const token = await getToken(messagingInstance, { vapidKey })
    console.log("FCM Token:", token)
    return token
  } catch (error) {
    console.error("An error occurred while retrieving token. ", error)
    return null
  }
}

export const ensurePushToken = async (userId: string) => {
  try {
    const token = await getNotificationToken()
    if (token) {
      // Store token in user document tokens array to align with Cloud Functions
      await setDoc(
        doc(db, "users", userId),
        {
          fcmTokens: arrayUnion(token),
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      )
    }
    return token
  } catch (error) {
    console.error("Error ensuring push token:", error)
    return null
  }
}

export const subscribeForegroundMessages = async (callback: (payload: any) => void) => {
  const messagingInstance = await getClientMessaging()
  if (!messagingInstance) return

  return onMessage(messagingInstance, callback)
}

export const onMessageListener = async () => {
  const messagingInstance = await getClientMessaging()
  if (!messagingInstance) return

  return new Promise((resolve) => {
    onMessage(messagingInstance, (payload) => {
      console.log("Message received. ", payload)
      resolve(payload)
    })
  })
}
