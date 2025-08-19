"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  const router = useRouter()
  const { user, userData, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
      } else if (userData) {
        if (userData.status === "pending_approval") {
          router.push("/pending")
        } else if (userData.role === "admin") {
          router.push("/admin")
        } else if (userData.role === "secretary") {
          router.push("/secretary")
        } else if (userData.role === "mayor") {
          router.push("/mayor")
        } else {
          router.push("/login")
        }
      }
    }
  }, [user, userData, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>نظام مواعيد العمدة</CardTitle>
          <CardDescription>جاري التحميل...</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
