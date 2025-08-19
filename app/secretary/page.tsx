"use client"
import { Suspense } from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useAppointments } from "@/hooks/use-appointments"
import { DashboardSkeleton } from "@/components/loading-skeleton"
import Navbar from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Search, Settings, WifiOff } from "lucide-react"
import AppointmentForm from "@/components/appointment-form"
import AdvancedSearch from "@/components/advanced-search"
import UserPreferences from "@/components/user-preferences"
import { subscribeForegroundMessages, ensurePushToken } from "@/lib/push"
import { deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"

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

export default function SecretaryPage() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const [searchFilters, setSearchFilters] = useState<any>(null)
  const { appointments, loading: appointmentsLoading, isOnline } = useAppointments(user?.uid, "all", searchFilters)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  useEffect(() => {
    if (!user) return
    const setup = async () => {
      try {
        await ensurePushToken(user.uid)
        await subscribeForegroundMessages(() => {})
      } catch {}
    }
    setup()
  }, [user])

  const handleDelete = async (appointmentId: string) => {
    try {
      const confirmed = window.confirm("هل تريد حذف هذا الموعد؟")
      if (!confirmed) return
      await deleteDoc(doc(db, "appointments", appointmentId))
    } catch (error) {
      console.error("Error deleting appointment:", error)
    }
  }

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
      if (userData.role !== "secretary" && userData.role !== "admin") {
        if (userData.role === "mayor") {
          router.push("/mayor")
        } else {
          router.push("/")
        }
        return
      }
    }
  }, [user, userData, loading, router])

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
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-gray-900">لوحة تحكم السكرتير</h1>
            {!isOnline && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <WifiOff className="h-3 w-3" />
                وضع عدم الاتصال
              </Badge>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}>
              <Search className="h-4 w-4 mr-2" />
              بحث
            </Button>
            <Button variant="outline" onClick={() => setShowPreferences(!showPreferences)}>
              <Settings className="h-4 w-4 mr-2" />
              الإعدادات
            </Button>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              موعد جديد
            </Button>
          </div>
        </div>

        {showAdvancedSearch && (
          <AdvancedSearch onFiltersChange={setSearchFilters} onClose={() => setShowAdvancedSearch(false)} />
        )}

        {showPreferences && <UserPreferences userId={user?.uid || null} onClose={() => setShowPreferences(false)} />}

        {showForm && (
          <Suspense fallback={<div>جاري تحميل النموذج...</div>}>
            <AppointmentForm
              editingId={editingId}
              onClose={() => {
                setShowForm(false)
                setEditingId(null)
              }}
            />
          </Suspense>
        )}

        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold">{appointment.visitorName}</h3>
                      <Badge variant="outline">
                        {appointment.date} في {appointment.time}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-2">{appointment.subject}</p>
                    {appointment.notes && <p className="text-sm text-gray-500">{appointment.notes}</p>}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingId(appointment.id)
                        setShowForm(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(appointment.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {appointments.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">
                  {searchFilters ? "لا توجد مواعيد تطابق معايير البحث." : "لم يتم جدولة أي مواعيد بعد."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
