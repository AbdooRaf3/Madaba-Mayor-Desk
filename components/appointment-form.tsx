"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { addDoc, collection, doc, updateDoc, Timestamp, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { notifyNewAppointment } from "@/lib/functions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface AppointmentFormProps {
  editingId?: string | null
  onClose: () => void
  initialData?: {
    visitorName: string
    subject: string
    date: string
    time: string
    notes: string
  }
}

export default function AppointmentForm({ editingId, onClose, initialData }: AppointmentFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    visitorName: initialData?.visitorName || "",
    subject: initialData?.subject || "",
    date: initialData?.date || "",
    time: initialData?.time || "",
    notes: initialData?.notes || "",
  })

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
      return
    }

    const loadEditingData = async () => {
      if (!editingId) return
      try {
        const snap = await getDoc(doc(db, "appointments", editingId))
        if (snap.exists()) {
          const data = snap.data() as any
          setFormData({
            visitorName: data.visitorName || "",
            subject: data.subject || "",
            date: data.date || "",
            time: data.time || "",
            notes: data.notes || "",
          })
        }
      } catch (error) {
        console.error("Error loading appointment for edit:", error)
      }
    }

    loadEditingData()
  }, [initialData, editingId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)

    try {
      if (editingId) {
        // Update existing appointment
        const appointmentRef = doc(db, "appointments", editingId)
        await updateDoc(appointmentRef, {
          ...formData,
          datetime: `${formData.date}T${formData.time}`,
          reminderSent: false, // Reset reminder when editing
        })
      } else {
        // Create new appointment
        const docRef = await addDoc(collection(db, "appointments"), {
          ...formData,
          datetime: `${formData.date}T${formData.time}`,
          createdBy: user.uid,
          createdAt: Timestamp.now(),
          reminderSent: false,
        })

        // Send notification
        await notifyNewAppointment(docRef.id)
      }

      onClose()
    } catch (error) {
      console.error("Error saving appointment:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{editingId ? "Edit Appointment" : "New Appointment"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="visitorName">Visitor Name</Label>
              <Input
                id="visitorName"
                value={formData.visitorName}
                onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>
          <div className="flex space-x-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : editingId ? "Update" : "Create"} Appointment
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
