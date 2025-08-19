import { NextRequest, NextResponse } from "next/server"
import { adminDb, adminMessaging } from "@/lib/admin"

export async function POST(req: NextRequest) {
  try {
    const { appointmentId, type } = await req.json()
    if (!appointmentId || !type) return NextResponse.json({ error: "bad_request" }, { status: 400 })

    const db = adminDb()
    const doc = await db.collection("appointments").doc(appointmentId).get()
    if (!doc.exists) return NextResponse.json({ error: "not_found" }, { status: 404 })

    const a = doc.data() as any
    const title = type === "reminder" ? "Reminder: Upcoming Appointment" : "New Appointment Scheduled"
    const body =
      type === "reminder"
        ? `${a.visitorName} • ${a.subject} • in ~30 min (${a.date} ${a.time})`
        : `${a.visitorName} • ${a.subject} • ${a.date} ${a.time}`

    const usersSnap = await db.collection("users").where("role", "in", ["mayor"]).get()
    const tokens: string[] = []
    usersSnap.forEach((u) => {
      const arr = (u.data().fcmTokens || []) as string[]
      tokens.push(...arr)
    })
    if (tokens.length === 0) return NextResponse.json({ success: true, info: "no_tokens" })

    const messaging = adminMessaging()
    await messaging.sendEachForMulticast({ notification: { title, body }, tokens })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("notify error", e)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}


