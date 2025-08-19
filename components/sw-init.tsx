"use client"

import { useEffect } from "react"
// Import removed to avoid auto-requesting notifications on load

export default function SwInit() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration)
          // NOTE: Don't auto-request Notification permission on load.
          // Trigger it later based on explicit user action (e.g., a button press).
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError)
        })
    }
  }, [])

  return null
}
