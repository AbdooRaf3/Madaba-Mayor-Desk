"use client"

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { getFirebaseDb } from "@/lib/firebase"
import { LogOut, RefreshCw, Search } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: "secretary" | "mayor" | "admin" | "pending"
  status: "active" | "pending_approval" | "suspended"
  createdAt: string
}

export default function AdminDashboard() {
  const { userData, loading, logout } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | User["role"]>("all")

  useEffect(() => {
    if (!loading && (!userData || userData.role !== "admin")) {
      router.push("/")
      return
    }
  }, [userData, loading, router])

  useEffect(() => {
    if (userData?.role === "admin") {
      fetchUsers()
    }
  }, [userData])

  const fetchUsers = async () => {
    try {
      const db = await getFirebaseDb()
      if (!db) return

      const { collection, getDocs, orderBy, query } = await import("firebase/firestore")
      const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"))
      const snapshot = await getDocs(usersQuery)

      const usersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[]

      setUsers(usersData)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    setUpdating(userId)
    try {
      const db = await getFirebaseDb()
      if (!db) return

      const { doc, updateDoc } = await import("firebase/firestore")
      await updateDoc(doc(db, "users", userId), {
        role: newRole,
        status: "active",
      })

      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, role: newRole as any, status: "active" } : user)),
      )
    } catch (error) {
      console.error("Error updating user role:", error)
    } finally {
      setUpdating(null)
    }
  }

  const updateUserStatus = async (userId: string, newStatus: string) => {
    setUpdating(userId)
    try {
      const db = await getFirebaseDb()
      if (!db) return

      const { doc, updateDoc } = await import("firebase/firestore")
      await updateDoc(doc(db, "users", userId), { status: newStatus })

      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, status: newStatus as any } : user)))
    } catch (error) {
      console.error("Error updating user status:", error)
    } finally {
      setUpdating(null)
    }
  }

  const handleSuspend = async (userId: string) => {
    const ok = window.confirm("هل أنت متأكد من تعليق هذا الحساب؟")
    if (!ok) return
    await updateUserStatus(userId, "suspended")
  }

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  if (loading || loadingUsers) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>جاري التحميل...</div>
      </div>
    )
  }

  if (!userData || userData.role !== "admin") {
    return null
  }

  const normalizedSearch = search.trim().toLowerCase()
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const roleOk = roleFilter === "all" ? true : u.role === roleFilter
      const text = `${u.name || ""} ${u.email || ""}`.toLowerCase()
      const searchOk = normalizedSearch ? text.includes(normalizedSearch) : true
      return roleOk && searchOk
    })
  }, [users, roleFilter, normalizedSearch])

  const pendingUsers = filteredUsers.filter((user) => user.status === "pending_approval")
  const activeUsers = filteredUsers.filter((user) => user.status === "active")
  const suspendedUsers = filteredUsers.filter((user) => user.status === "suspended")

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "secretary":
        return "bg-blue-100 text-blue-800"
      case "mayor":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "pending_approval":
        return "bg-yellow-100 text-yellow-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const UserCard = ({ user }: { user: User }) => (
    <Card key={user.id} className="mb-4">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold">{user.name}</h3>
            <p className="text-sm text-gray-600">{user.email}</p>
            <p className="text-xs text-gray-500">
              تاريخ التسجيل: {new Date(user.createdAt).toLocaleDateString("ar-SA")}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Badge className={getRoleBadgeColor(user.role)}>
              {user.role === "admin"
                ? "مدير"
                : user.role === "secretary"
                  ? "سكرتير"
                  : user.role === "mayor"
                    ? "عمدة"
                    : "في الانتظار"}
            </Badge>
            <Badge className={getStatusBadgeColor(user.status)}>
              {user.status === "active" ? "نشط" : user.status === "pending_approval" ? "في انتظار الموافقة" : "معلق"}
            </Badge>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {user.status === "pending_approval" && (
            <>
              <Select onValueChange={(value) => updateUserRole(user.id, value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="تحديد الدور" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="secretary">سكرتير</SelectItem>
                  <SelectItem value="mayor">عمدة</SelectItem>
                  <SelectItem value="admin">مدير</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}

          {user.status === "active" && user.role !== "admin" && (
            <>
              <Select value={user.role} onValueChange={(value) => updateUserRole(user.id, value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="secretary">سكرتير</SelectItem>
                  <SelectItem value="mayor">عمدة</SelectItem>
                  <SelectItem value="admin">مدير</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="destructive" size="sm" onClick={() => handleSuspend(user.id)} disabled={updating === user.id}>
                تعليق
              </Button>
            </>
          )}

          {user.status === "suspended" && (
            <Button
              variant="default"
              size="sm"
              onClick={() => updateUserStatus(user.id, "active")}
              disabled={updating === user.id}
            >
              إلغاء التعليق
            </Button>
          )}

          {updating === user.id && <div className="text-sm text-gray-500">جاري التحديث...</div>}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">لوحة تحكم المدير</h1>
            <p className="text-gray-600">إدارة المستخدمين والأدوار</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loadingUsers}>
              <RefreshCw className="h-4 w-4 mr-2" /> تحديث
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" /> تسجيل الخروج
            </Button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative md:w-1/2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="بحث بالاسم أو البريد..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="md:w-48">
            <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="كل الأدوار" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الأدوار</SelectItem>
                <SelectItem value="admin">مدير</SelectItem>
                <SelectItem value="secretary">سكرتير</SelectItem>
                <SelectItem value="mayor">عمدة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">طلبات الانتظار</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingUsers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">المستخدمون النشطون</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeUsers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">المستخدمون المعلقون</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{suspendedUsers.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">طلبات الانتظار ({pendingUsers.length})</TabsTrigger>
          <TabsTrigger value="active">المستخدمون النشطون ({activeUsers.length})</TabsTrigger>
          <TabsTrigger value="suspended">المعلقون ({suspendedUsers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingUsers.length === 0 ? (
            <Alert>
              <AlertDescription>لا توجد طلبات في الانتظار</AlertDescription>
            </Alert>
          ) : (
            <div>
              {pendingUsers.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          {activeUsers.length === 0 ? (
            <Alert>
              <AlertDescription>لا يوجد مستخدمون نشطون</AlertDescription>
            </Alert>
          ) : (
            <div>
              {activeUsers.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="suspended" className="mt-6">
          {suspendedUsers.length === 0 ? (
            <Alert>
              <AlertDescription>لا يوجد مستخدمون معلقون</AlertDescription>
            </Alert>
          ) : (
            <div>
              {suspendedUsers.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
