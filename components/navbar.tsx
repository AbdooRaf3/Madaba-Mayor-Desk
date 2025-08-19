"use client"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { LogOut, Calendar, Settings, Bell } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { ensurePushToken, requestNotificationPermission } from "@/lib/push"

export default function Navbar() {
  const { user, userData, logout } = useAuth()
  const router = useRouter()
  const [notificationsGranted, setNotificationsGranted] = useState<boolean>(false)

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationsGranted(Notification.permission === "granted")
    }
  }, [])

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const handleEnableNotifications = useCallback(async () => {
    try {
      if (typeof window === "undefined") return
      const token = await requestNotificationPermission()
      const granted = !!token
      setNotificationsGranted(granted)
      if (granted && user?.uid) {
        await ensurePushToken(user.uid)
      }
    } catch (e) {
      console.error("Failed to enable notifications", e)
    }
  }, [user?.uid])

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "admin":
        return "مدير"
      case "secretary":
        return "سكرتير"
      case "mayor":
        return "عمدة"
      default:
        return role
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "secretary":
        return "bg-blue-100 text-blue-800"
      case "mayor":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">نظام مواعيد العمدة</span>
          </div>

          <div className="flex items-center space-x-4 gap-4">
            <span className="text-sm text-gray-600">مرحباً، {userData?.name || userData?.email}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(userData?.role || "")}`}>
              {getRoleDisplay(userData?.role || "")}
            </span>

            {!notificationsGranted && (
              <Button variant="outline" size="sm" onClick={handleEnableNotifications}>
                <Bell className="h-4 w-4 mr-2" />
                تفعيل الإشعارات
              </Button>
            )}

            {userData?.role === "admin" && (
              <Button variant="outline" size="sm" onClick={() => router.push("/admin")}>
                <Settings className="h-4 w-4 mr-2" />
                لوحة التحكم
              </Button>
            )}

            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
