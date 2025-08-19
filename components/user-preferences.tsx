"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Settings, Bell, X, Plus } from "lucide-react"
import { useUserPreferences } from "@/hooks/use-user-preferences"

interface UserPreferencesProps {
  userId: string | null
  onClose: () => void
}

export default function UserPreferences({ userId, onClose }: UserPreferencesProps) {
  const { preferences, updatePreferences, loading } = useUserPreferences(userId)
  const [newReminderTime, setNewReminderTime] = useState<string>("60")

  const addReminderTime = () => {
    const time = Number.parseInt(newReminderTime)
    if (time > 0 && !preferences.reminderTimes.includes(time)) {
      updatePreferences({
        reminderTimes: [...preferences.reminderTimes, time].sort((a, b) => b - a),
      })
    }
    setNewReminderTime("60")
  }

  const removeReminderTime = (time: number) => {
    updatePreferences({
      reminderTimes: preferences.reminderTimes.filter((t) => t !== time),
    })
  }

  if (loading) {
    return <div>Loading preferences...</div>
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          User Preferences
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-md font-medium mb-3 flex items-center">
            <Bell className="h-4 w-4 mr-2" />
            Notification Settings
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Notification Sound</label>
              <Switch
                checked={preferences.notificationSound}
                onCheckedChange={(checked) => updatePreferences({ notificationSound: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Email Notifications</label>
              <Switch
                checked={preferences.emailNotifications}
                onCheckedChange={(checked) => updatePreferences({ emailNotifications: checked })}
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-md font-medium mb-3">Reminder Times</h3>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {preferences.reminderTimes.map((time) => (
                <Badge key={time} variant="secondary" className="flex items-center gap-1">
                  {time} minutes before
                  <button onClick={() => removeReminderTime(time)} className="ml-1 hover:text-red-500">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Select value={newReminderTime} onValueChange={setNewReminderTime}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="1440">1 day</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" onClick={addReminderTime}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-md font-medium mb-3">Theme</h3>
          <Select
            value={preferences.theme}
            onValueChange={(value: "light" | "dark" | "system") => updatePreferences({ theme: value })}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
