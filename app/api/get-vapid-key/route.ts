import { NextResponse } from "next/server"

export async function GET() {
  const vapidKey = process.env.FIREBASE_VAPID_KEY

  if (!vapidKey) {
    return NextResponse.json({ error: "VAPID key not configured" }, { status: 500 })
  }

  return NextResponse.json({ vapidKey })
}
