"use client"

import type React from "react"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: ("admin" | "secretary" | "mayor")[]
  fallbackPath?: string
}

export default function ProtectedRoute({ children, allowedRoles, fallbackPath = "/" }: ProtectedRouteProps) {
  const { user, userData, loading } = useAuth()
  const router = useRouter()

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

      if (!allowedRoles.includes(userData.role as any)) {
        router.push(fallbackPath)
        return
      }
    }
  }, [user, userData, loading, router, allowedRoles, fallbackPath])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>جاري التحميل...</div>
      </div>
    )
  }

  if (!user || !userData) {
    return null
  }

  if (userData.status === "suspended") {
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

  if (userData.status === "pending_approval") {
    return null // Will redirect to pending page
  }

  if (!allowedRoles.includes(userData.role as any)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">ليس لديك صلاحية للوصول إلى هذه الصفحة.</p>
            <Button onClick={() => router.push(fallbackPath)} className="mt-4">
              العودة
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
