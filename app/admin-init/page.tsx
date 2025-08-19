"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { initFirstAdmin } from "@/lib/functions"

export default function AdminInitPage() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleInit = async () => {
    setBusy(true)
    const res = await initFirstAdmin(user?.uid)
    if (res.ok) {
      setResult("تم تعيينك كمدير بنجاح.")
      setTimeout(() => router.push("/admin"), 1500)
    } else if (res.reason === "admin_exists") {
      setResult("يوجد مدير بالفعل. استخدم حساب المدير الحالي.")
    } else if (res.reason === "unauthenticated") {
      setResult("يجب تسجيل الدخول أولاً.")
    } else {
      setResult("حدث خطأ أثناء التهيئة.")
    }
    setBusy(false)
  }

  if (loading) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>تهيئة أول مدير</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            هذه الصفحة تستخدم لمرة واحدة فقط لتعيين أول مدير عند عدم وجود أي مدير في قاعدة البيانات.
          </p>
          {result && (
            <Alert>
              <AlertDescription>{result}</AlertDescription>
            </Alert>
          )}
          <Button className="w-full" onClick={handleInit} disabled={busy || !user}>
            {busy ? "جاري التهيئة..." : user ? "تعيين نفسي كمدير" : "سجّل الدخول أولاً"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}


