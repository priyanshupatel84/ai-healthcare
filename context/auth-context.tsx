"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

type User = {
  id: string
  name: string
  email: string
  role: "patient" | "doctor" | "admin"
}

type AuthContextType = {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  clearUser: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
  clearUser: () => {},
})

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if user is already logged in
        const response = await fetch("/api/auth/session")

        if (response.ok) {
          const data = await response.json()
          if (data.user) {
            setUser(data.user)
          }
        }
      } catch (error) {
        // Session invalid or expired
        console.error("Auth initialization error:", error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const clearUser = () => {
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, setUser, clearUser }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

