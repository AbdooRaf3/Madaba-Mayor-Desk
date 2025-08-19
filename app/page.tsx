"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Users, FileText, Phone, Mail, Clock, AlertCircle, Building } from "lucide-react"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("dashboard")

  // Sample data
  const stats = [
    { title: "طلبات المواطنين", value: "24", icon: FileText, color: "text-blue-600" },
    { title: "الاجتماعات اليوم", value: "3", icon: Calendar, color: "text-green-600" },
    { title: "المشاريع النشطة", value: "8", icon: Building, color: "text-purple-600" },
    { title: "الشكاوى المعلقة", value: "12", icon: AlertCircle, color: "text-orange-600" },
  ]

  const recentRequests = [
    { id: 1, citizen: "أحمد محمد", type: "إصلاح طريق", status: "قيد المراجعة", priority: "عالية", date: "2024-01-15" },
    { id: 2, citizen: "فاطمة علي", type: "إنارة شارع", status: "مكتمل", priority: "متوسطة", date: "2024-01-14" },
    { id: 3, citizen: "محمود حسن", type: "تنظيف منطقة", status: "جديد", priority: "منخفضة", date: "2024-01-13" },
  ]

  const upcomingMeetings = [
    { title: "اجتماع المجلس البلدي", time: "10:00 ص", attendees: 12 },
    { title: "لقاء مع المقاولين", time: "2:00 م", attendees: 5 },
    { title: "مراجعة المشاريع", time: "4:30 م", attendees: 8 },
  ]

  const projects = [
    { name: "تطوير الحديقة المركزية", progress: 75, budget: "50,000 دينار", status: "جاري" },
    { name: "إصلاح شبكة المياه", progress: 40, budget: "80,000 دينار", status: "جاري" },
    { name: "تحديث الإنارة العامة", progress: 90, budget: "30,000 دينار", status: "شبه مكتمل" },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <Building className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">مكتب عمدة مادبا</h1>
              <p className="text-sm opacity-90">نظام إدارة الشؤون البلدية</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              متصل
            </Badge>
            <div className="text-right rtl:text-left">
              <p className="font-medium">السيد عمدة مادبا</p>
              <p className="text-xs opacity-75">مدير النظام</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">لوحة التحكم</TabsTrigger>
            <TabsTrigger value="requests">طلبات المواطنين</TabsTrigger>
            <TabsTrigger value="meetings">الاجتماعات</TabsTrigger>
            <TabsTrigger value="projects">المشاريع</TabsTrigger>
            <TabsTrigger value="contacts">جهات الاتصال</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Requests */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    أحدث الطلبات
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{request.citizen}</p>
                        <p className="text-sm text-muted-foreground">{request.type}</p>
                      </div>
                      <div className="text-right rtl:text-left">
                        <Badge variant={request.status === "مكتمل" ? "default" : "secondary"}>{request.status}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">{request.date}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Today's Meetings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    اجتماعات اليوم
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingMeetings.map((meeting, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{meeting.title}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {meeting.attendees} مشارك
                        </p>
                      </div>
                      <div className="text-right rtl:text-left">
                        <p className="font-medium flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {meeting.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">إدارة طلبات المواطنين</h2>
              <Button>طلب جديد</Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>قائمة الطلبات</CardTitle>
                <CardDescription>جميع طلبات المواطنين وحالتها</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentRequests.map((request) => (
                    <div key={request.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{request.citizen}</p>
                        <p className="text-sm text-muted-foreground">المواطن</p>
                      </div>
                      <div>
                        <p className="font-medium">{request.type}</p>
                        <p className="text-sm text-muted-foreground">نوع الطلب</p>
                      </div>
                      <div>
                        <Badge
                          variant={
                            request.priority === "عالية"
                              ? "destructive"
                              : request.priority === "متوسطة"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {request.priority}
                        </Badge>
                        <p className="text-sm text-muted-foreground">الأولوية</p>
                      </div>
                      <div>
                        <Badge variant={request.status === "مكتمل" ? "default" : "secondary"}>{request.status}</Badge>
                        <p className="text-sm text-muted-foreground">الحالة</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          عرض
                        </Button>
                        <Button size="sm">تحديث</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Meetings Tab */}
          <TabsContent value="meetings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">إدارة الاجتماعات</h2>
              <Button>اجتماع جديد</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>جدولة اجتماع جديد</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input placeholder="عنوان الاجتماع" />
                  <Textarea placeholder="وصف الاجتماع" />
                  <Input type="datetime-local" />
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر القاعة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main">القاعة الرئيسية</SelectItem>
                      <SelectItem value="conference">قاعة المؤتمرات</SelectItem>
                      <SelectItem value="small">القاعة الصغيرة</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="w-full">حفظ الاجتماع</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>الاجتماعات القادمة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingMeetings.map((meeting, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{meeting.title}</h4>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            {meeting.time}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {meeting.attendees} مشارك
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            تعديل
                          </Button>
                          <Button size="sm" variant="destructive">
                            إلغاء
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">إدارة المشاريع</h2>
              <Button>مشروع جديد</Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {projects.map((project, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{project.name}</CardTitle>
                        <CardDescription>الميزانية: {project.budget}</CardDescription>
                      </div>
                      <Badge variant={project.status === "شبه مكتمل" ? "default" : "secondary"}>{project.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>التقدم</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline">
                          عرض التفاصيل
                        </Button>
                        <Button size="sm">تحديث التقدم</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">جهات الاتصال المهمة</h2>
              <Button>إضافة جهة اتصال</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: "الدفاع المدني", phone: "199", email: "civil.defense@gov.jo", type: "طوارئ" },
                { name: "شركة الكهرباء", phone: "06-4618100", email: "info@nepco.com.jo", type: "خدمات" },
                { name: "شركة المياه", phone: "06-5686200", email: "info@miyahuna.com.jo", type: "خدمات" },
                { name: "وزارة الداخلية", phone: "06-5629000", email: "info@moi.gov.jo", type: "حكومي" },
                { name: "محافظة مادبا", phone: "05-3240100", email: "madaba@gov.jo", type: "حكومي" },
                { name: "الأمن العام", phone: "911", email: "info@psd.gov.jo", type: "طوارئ" },
              ].map((contact, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{contact.name}</CardTitle>
                    <Badge variant="outline">{contact.type}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{contact.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{contact.email}</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        <Phone className="h-3 w-3 mr-1" />
                        اتصال
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        <Mail className="h-3 w-3 mr-1" />
                        إيميل
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
