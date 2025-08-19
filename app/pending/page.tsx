"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, LogOut } from "lucide-react"

export default function PendingPage() {
  const { user, userData, logout, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
      } else if (userData && userData.status !== "pending_approval") {
        router.push("/")
      }
    }
  }, [user, userData, loading, router])

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>جاري التحميل...</div>
      </div>
    )
  }

  if (!user || !userData || userData.status !== "pending_approval") {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-96">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <CardTitle>في انتظار الموافقة</CardTitle>
          <CardDescription>تم إنشاء حسابك بنجاح</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              مرحباً {userData.name}، تم إنشاء حسابك بنجاح وهو الآن في انتظار موافقة المدير لتحديد دورك في النظام. سيتم
              إشعارك عبر البريد الإلكتروني عند الموافقة على حسابك.
            </AlertDescription>
          </Alert>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">معلومات الحساب:</h3>
            <p className="text-sm text-gray-600">الاسم: {userData.name}</p>
            <p className="text-sm text-gray-600">البريد الإلكتروني: {userData.email}</p>
            <p className="text-sm text-gray-600">الحالة: في انتظار الموافقة</p>
          </div>

          <Button onClick={handleLogout} className="w-full bg-transparent" variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            تسجيل الخروج
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
