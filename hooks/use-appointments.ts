"use client"

import { useState, useEffect, useMemo } from "react"
import { useOfflineStorage } from "./use-offline-storage"

interface Appointment {
  id: string
  visitorName: string
  subject: string
  date: string
  time: string
  notes?: string
  createdBy: string
  createdAt: any
  reminderSent?: boolean
}

interface SearchFilters {
  searchTerm: string
  dateFrom: string
  dateTo: string
  status: "all" | "upcoming" | "today" | "past"
  sortBy: "date" | "name" | "subject"
  sortOrder: "asc" | "desc"
}

export function useAppointments(
  userId: string | null,
  filter: "all" | "today" | "upcoming" = "all",
  searchFilters?: SearchFilters,
) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isOnline, offlineData, saveOfflineData } = useOfflineStorage()

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    if (!isOnline && offlineData) {
      setAppointments(offlineData.appointments)
      setLoading(false)
      return
    }

    let unsubscribeFn: undefined | (() => void)

    const setupFirestoreListener = async () => {
      try {
        const { getFirebaseDb } = await import("@/lib/firebase")
        const { collection, query, onSnapshot, where } = await import("firebase/firestore")

        const db = await getFirebaseDb()
        if (!db) {
          throw new Error("Database not initialized")
        }

        setLoading(true)
        setError(null)

        let q = query(collection(db, "appointments"))

        if (filter === "today") {
          const today = new Date().toISOString().split("T")[0]
          q = query(collection(db, "appointments"), where("date", "==", today))
        } else if (filter === "upcoming") {
          const today = new Date().toISOString().split("T")[0]
          q = query(collection(db, "appointments"), where("date", ">=", today))
        }

        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const appointmentsList: Appointment[] = []
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as any
              appointmentsList.push({ id: docSnap.id, ...data })
            })
            // Sort locally by computed datetime to avoid composite index
            appointmentsList.sort((a: any, b: any) => {
              const aDt = (a.datetime as string) || `${a.date}T${a.time}`
              const bDt = (b.datetime as string) || `${b.date}T${b.time}`
              return aDt > bDt ? 1 : aDt < bDt ? -1 : 0
            })
            setAppointments(appointmentsList as any)
            if (isOnline) {
              saveOfflineData(appointmentsList)
            }
            setLoading(false)
          },
          (error) => {
            console.error("Error fetching appointments:", error)
            setError(error.message)
            if (offlineData) {
              setAppointments(offlineData.appointments)
            }
            setLoading(false)
          },
        )
        unsubscribeFn = unsubscribe
      } catch (error) {
        console.error("Setup error:", error)
        setError("Failed to connect to database")
        if (offlineData) {
          setAppointments(offlineData.appointments)
        }
        setLoading(false)
      }
    }

    setupFirestoreListener()
    return () => {
      if (unsubscribeFn) unsubscribeFn()
    }
  }, [userId, filter, isOnline])

  const filteredAppointments = useMemo(() => {
    let filtered = [...appointments]

    if (searchFilters) {
      // Search term filter
      if (searchFilters.searchTerm) {
        const term = searchFilters.searchTerm.toLowerCase()
        filtered = filtered.filter(
          (apt) =>
            apt.visitorName.toLowerCase().includes(term) ||
            apt.subject.toLowerCase().includes(term) ||
            apt.notes?.toLowerCase().includes(term),
        )
      }

      // Date range filter
      if (searchFilters.dateFrom) {
        filtered = filtered.filter((apt) => apt.date >= searchFilters.dateFrom)
      }
      if (searchFilters.dateTo) {
        filtered = filtered.filter((apt) => apt.date <= searchFilters.dateTo)
      }

      // Status filter
      const today = new Date().toISOString().split("T")[0]
      if (searchFilters.status === "today") {
        filtered = filtered.filter((apt) => apt.date === today)
      } else if (searchFilters.status === "upcoming") {
        filtered = filtered.filter((apt) => apt.date >= today)
      } else if (searchFilters.status === "past") {
        filtered = filtered.filter((apt) => apt.date < today)
      }

      // Sorting
      filtered.sort((a, b) => {
        let aValue: string | number
        let bValue: string | number

        switch (searchFilters.sortBy) {
          case "name":
            aValue = a.visitorName.toLowerCase()
            bValue = b.visitorName.toLowerCase()
            break
          case "subject":
            aValue = a.subject.toLowerCase()
            bValue = b.subject.toLowerCase()
            break
          default:
            aValue = `${a.date} ${a.time}`
            bValue = `${b.date} ${b.time}`
        }

        if (searchFilters.sortOrder === "desc") {
          return aValue < bValue ? 1 : -1
        }
        return aValue > bValue ? 1 : -1
      })
    }

    return filtered
  }, [appointments, searchFilters])

  const computedData = useMemo(() => {
    const today = new Date().toISOString().split("T")[0]

    return {
      todayCount: appointments.filter((apt) => apt.date === today).length,
      upcomingCount: appointments.filter((apt) => apt.date >= today).length,
      totalCount: appointments.length,
    }
  }, [appointments])

  return {
    appointments: filteredAppointments,
    loading,
    error,
    isOnline,
    ...computedData,
  }
}
