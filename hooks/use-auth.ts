"use client"

import { useState, useEffect } from "react"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"

interface UserData {
  email: string
  role: "secretary" | "mayor" | "admin" | "pending"
  name: string
  status?: "active" | "pending_approval" | "suspended"
}

export const useAuth = () => {
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists()) {
            const data = userDoc.data() as UserData
            setUserData(data)
          } else {
            setUserData(null)
          }
        } catch (error) {
          setUserData(null)
        }
      } else {
        setUserData(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)

      const userDoc = await getDoc(doc(db, "users", result.user.uid))

      if (userDoc.exists()) {
        const userData = userDoc.data() as UserData
        if (userData.status === "pending_approval") {
          // Allow login and let the router redirect to /pending
          return { success: true, pending: true }
        }
        if (userData.status === "suspended") {
          await signOut(auth)
          throw new Error("تم تعليق حسابك. يرجى التواصل مع المدير")
        }
      }

      return { success: true }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  return {
    user,
    userData,
    loading,
    login,
    logout,
  }
}
