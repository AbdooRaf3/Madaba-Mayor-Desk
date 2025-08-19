"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("كلمات المرور غير متطابقة")
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل")
      setLoading(false)
      return
    }

    try {
      const auth = await getFirebaseAuth()
      const db = await getFirebaseDb()

      if (!auth || !db) {
        throw new Error("Firebase not initialized")
      }

      const { createUserWithEmailAndPassword } = await import("firebase/auth")
      const { doc, setDoc } = await import("firebase/firestore")

      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const user = userCredential.user

      // Save user data to Firestore with pending role
      await setDoc(doc(db, "users", user.uid), {
        name: formData.name,
        email: formData.email,
        role: "pending", // Admin will assign role later
        createdAt: new Date().toISOString(),
        status: "pending_approval",
      })

      setSuccess(true)
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-96">
          <CardContent className="pt-6">
            <Alert>
              <AlertDescription>
                تم إنشاء الحساب بنجاح! في انتظار موافقة المدير لتحديد الدور. سيتم توجيهك لصفحة تسجيل الدخول...
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>إنشاء حساب جديد</CardTitle>
          <CardDescription>قم بإنشاء حساب للوصول إلى نظام مواعيد العمدة</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">الاسم الكامل</Label>
              <Input id="name" name="name" type="text" value={formData.name} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </div>
            {error && (
              <Alert>
                <AlertDescription className="text-red-600">{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
            </Button>
            <div className="text-center">
              <Button type="button" variant="link" onClick={() => router.push("/login")}>
                لديك حساب بالفعل؟ تسجيل الدخول
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
