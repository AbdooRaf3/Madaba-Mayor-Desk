"use client"

import { useState, useEffect } from "react"

interface OfflineData {
  appointments: any[]
  lastSync: number
}

export function useOfflineStorage() {
  const [isOnline, setIsOnline] = useState(true)
  const [offlineData, setOfflineData] = useState<OfflineData | null>(null)

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine)

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Load offline data on mount
    loadOfflineData()

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const loadOfflineData = () => {
    try {
      const stored = localStorage.getItem("mayor-schedule-offline")
      if (stored) {
        setOfflineData(JSON.parse(stored))
      }
    } catch (error) {
      console.error("Error loading offline data:", error)
    }
  }

  const saveOfflineData = (appointments: any[]) => {
    try {
      const data: OfflineData = {
        appointments,
        lastSync: Date.now(),
      }
      localStorage.setItem("mayor-schedule-offline", JSON.stringify(data))
      setOfflineData(data)
    } catch (error) {
      console.error("Error saving offline data:", error)
    }
  }

  const clearOfflineData = () => {
    localStorage.removeItem("mayor-schedule-offline")
    setOfflineData(null)
  }

  return {
    isOnline,
    offlineData,
    saveOfflineData,
    clearOfflineData,
  }
}
