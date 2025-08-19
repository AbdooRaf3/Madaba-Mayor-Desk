"use client"

import { useState, useEffect } from "react"

interface UserPreferences {
  reminderTimes: number[] // minutes before appointment
  notificationSound: boolean
  emailNotifications: boolean
  theme: "light" | "dark" | "system"
}

const defaultPreferences: UserPreferences = {
  reminderTimes: [30, 15], // 30 and 15 minutes before
  notificationSound: true,
  emailNotifications: true,
  theme: "system",
}

export function useUserPreferences(userId: string | null) {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    loadPreferences()
  }, [userId])

  const loadPreferences = () => {
    try {
      const stored = localStorage.getItem(`user-preferences-${userId}`)
      if (stored) {
        setPreferences({ ...defaultPreferences, ...JSON.parse(stored) })
      }
    } catch (error) {
      console.error("Error loading preferences:", error)
    } finally {
      setLoading(false)
    }
  }

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    const newPreferences = { ...preferences, ...updates }
    setPreferences(newPreferences)

    try {
      localStorage.setItem(`user-preferences-${userId}`, JSON.stringify(newPreferences))
    } catch (error) {
      console.error("Error saving preferences:", error)
    }
  }

  return {
    preferences,
    updatePreferences,
    loading,
  }
}
