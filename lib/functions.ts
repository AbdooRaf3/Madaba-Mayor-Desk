// Notifications via Firebase Callable Functions
export const notifyNewAppointment = async (appointmentId: string) => {
  try {
    const res = await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId, type: "new" }),
    })
    if (!res.ok) throw new Error("Failed to notify")
    return { success: true }
  } catch (error) {
    console.error("Error sending notification:", error)
    return { success: false, error }
  }
}

export const sendReminderNotification = async (appointmentId: string) => {
  try {
    const res = await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId, type: "reminder" }),
    })
    if (!res.ok) throw new Error("Failed to send reminder")
    return { success: true }
  } catch (error) {
    console.error("Error sending reminder:", error)
    return { success: false, error }
  }
}

export const initFirstAdmin = async (_userId?: string) => {
  // Not available without Cloud Functions Blaze; keep stub
  return { ok: false, reason: "disabled" }
}
