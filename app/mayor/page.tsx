"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import type { Timestamp } from "firebase/firestore"
import { ensurePushToken, subscribeForegroundMessages } from "@/lib/push"
import Navbar from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, Bell } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DashboardSkeleton } from "@/components/loading-skeleton"
import { useAppointments } from "@/hooks/use-appointments"

interface Appointment {
  id: string
  visitorName: string
  subject: string
  date: string
  time: string
  notes?: string
  createdBy: string
  createdAt: Timestamp
  reminderSent?: boolean
}

export default function MayorPage() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [filter, setFilter] = useState<"all" | "today" | "upcoming">("today")

  const { appointments, loading: appointmentsLoading, todayCount, upcomingCount } = useAppointments(user?.uid, filter)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
        return
      }
      if (!userData) {
        return // Still loading user data
      }
      if (userData.status === "pending_approval") {
        router.push("/pending")
        return
      }
      if (userData.status === "suspended") {
        router.push("/login")
        return
      }
      if (userData.role !== "mayor" && userData.role !== "admin") {
        if (userData.role === "secretary") {
          router.push("/secretary")
        } else {
          router.push("/")
        }
        return
      }
    }
  }, [user, userData, loading, router])

  useEffect(() => {
    if (!user) return

    // Setup push notifications
    const setupPush = async () => {
      try {
        await ensurePushToken(user.uid)

        // Request notification permission
        if (Notification.permission === "default") {
          const permission = await Notification.requestPermission()
          if (permission === "granted") {
            toast({
              title: "تم تفعيل الإشعارات",
              description: "ستتلقى إشعارات فورية للمواعيد الجديدة والتذكيرات.",
            })
          }
        }
      } catch (error) {
        console.error("Error setting up push notifications:", error)
      }
    }

    setupPush()

    // Subscribe to foreground messages
    subscribeForegroundMessages((payload) => {
      toast({
        title: payload.notification?.title || "إشعار جديد",
        description: payload.notification?.body || "",
      })
    })
  }, [user, toast])

  if (loading || appointmentsLoading) {
    return <DashboardSkeleton />
  }

  if (!user || !userData || userData.status === "suspended") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">تم تعليق حسابك. يرجى التواصل مع المدير.</p>
            <Button onClick={() => router.push("/login")} className="mt-4">
              العودة لتسجيل الدخول
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">لوحة تحكم العمدة</h1>
            <p className="text-sm text-gray-600 mt-1">
              {todayCount} اليوم • {upcomingCount} قادمة
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant={filter === "today" ? "default" : "outline"} onClick={() => setFilter("today")}>
              اليوم
            </Button>
            <Button variant={filter === "upcoming" ? "default" : "outline"} onClick={() => setFilter("upcoming")}>
              القادمة
            </Button>
            <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
              الكل
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <Card
              key={appointment.id}
              className={
                appointment.date === new Date().toISOString().split("T")[0] ? "border-blue-200 bg-blue-50" : ""
              }
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <h3 className="text-lg font-semibold">{appointment.visitorName}</h3>
                      {appointment.date === new Date().toISOString().split("T")[0] && (
                        <Badge variant="default">اليوم</Badge>
                      )}
                      {new Date(`${appointment.date}T${appointment.time}`) < new Date() && (
                        <Badge variant="secondary">منتهي</Badge>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 mb-2">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{appointment.date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{appointment.time}</span>
                      </div>
                    </div>

                    <p className="text-gray-800 font-medium mb-2">{appointment.subject}</p>

                    {appointment.notes && (
                      <p className="text-sm text-gray-600 bg-gray-100 p-2 rounded">{appointment.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {appointment.reminderSent && (
                      <Badge variant="outline" className="text-xs">
                        <Bell className="h-3 w-3 mr-1" />
                        تم التذكير
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {appointments.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">
                  {filter === "today"
                    ? "لا توجد مواعيد مجدولة لليوم."
                    : filter === "upcoming"
                      ? "لا توجد مواعيد قادمة."
                      : "لم يتم جدولة أي مواعيد بعد."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
