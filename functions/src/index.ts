import * as admin from "firebase-admin"
import * as functions from "firebase-functions/v2"
import { onSchedule } from "firebase-functions/v2/scheduler"

admin.initializeApp()

const db = admin.firestore()
const fcm = admin.messaging()

type Appointment = {
  visitorName: string
  subject: string
  date: string // YYYY-MM-DD
  time: string // HH:mm
  notes?: string
  createdBy: string
  createdAt: admin.firestore.Timestamp
  reminderSent?: boolean
}

async function sendToRole(role: "mayor" | "secretary", title: string, body: string) {
  const snap = await db.collection("users").where("role", "==", role).get()
  const tokens: string[] = []

  snap.forEach((d) => {
    const arr = (d.data().fcmTokens || []) as string[]
    tokens.push(...arr)
  })

  if (tokens.length === 0) return

  const message: admin.messaging.MulticastMessage = {
    notification: { title, body },
    tokens,
  }

  await fcm.sendEachForMulticast(message)
}

// Callable when an appointment is created/updated
export const notifyNewAppointment = functions.https.onCall({ region: "us-central1" }, async (req) => {
  const { appointmentId } = req.data as { appointmentId: string }
  const doc = await db.collection("appointments").doc(appointmentId).get()

  if (!doc.exists) return { ok: false }

  const a = doc.data() as Appointment
  const when = `${a.date} ${a.time}`

  await sendToRole("mayor", "New Appointment Scheduled", `${a.visitorName} • ${a.subject} • ${when}`)

  return { ok: true }
})

// Run every minute to send 30-min reminders
export const sendReminders = onSchedule({ schedule: "every 1 minutes", region: "us-central1" }, async () => {
  const now = new Date()
  const todayISO = now.toISOString().slice(0, 10)

  const snap = await db.collection("appointments").where("date", "==", todayISO).get()

  for (const doc of snap.docs) {
    const a = doc.data() as Appointment
    if (a.reminderSent) continue

    const appointmentDateTime = new Date(`${a.date}T${a.time}:00`)
    const diff = appointmentDateTime.getTime() - now.getTime()

    if (diff <= 30 * 60 * 1000 && diff > 0) {
      const when = `${a.date} ${a.time}`
      await sendToRole(
        "mayor",
        "Reminder: Upcoming Appointment",
        `${a.visitorName} • ${a.subject} • in ~30 min (${when})`,
      )

      await doc.ref.update({ reminderSent: true })
    }
  }
})

// Initialize first admin when there is no admin yet
export const initFirstAdmin = functions.https.onCall({ region: "us-central1" }, async (req) => {
  // Require authentication; prefer the caller's UID
  const callerUid = req.auth?.uid as string | undefined
  const targetUid = (req.data?.userId as string | undefined) || callerUid

  if (!targetUid) {
    return { ok: false, reason: "unauthenticated" }
  }

  // If any admin already exists, abort
  const existingAdmins = await db.collection("users").where("role", "==", "admin").limit(1).get()
  if (!existingAdmins.empty) {
    return { ok: false, reason: "admin_exists" }
  }

  const userRef = db.collection("users").doc(targetUid)
  const snapshot = await userRef.get()

  const nowIso = new Date().toISOString()
  if (snapshot.exists) {
    await userRef.update({ role: "admin", status: "active" })
  } else {
    await userRef.set({ role: "admin", status: "active", createdAt: nowIso })
  }

  return { ok: true }
})
