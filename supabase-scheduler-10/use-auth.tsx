"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "../supabase"

type UserProfile = {
  id: string
  email: string
  role: "admin" | "view"
}

type AuthContextType = {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        console.log("[v0] Initializing auth...")
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("[v0] Error getting session:", error)
          setLoading(false)
          return
        }

        console.log("[v0] Session:", session ? "exists" : "none")
        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          console.log("[v0] No session, setting loading to false")
          setProfile(null)
          setLoading(false)
        }
      } catch (error) {
        console.error("[v0] Error initializing auth:", error)
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[v0] Auth state changed:", event)
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        console.log("[v0] Auth state change: no session, setting loading to false")
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      console.log("[v0] Fetching profile for user:", userId)
      const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

      if (error) {
        console.log("[v0] Profile fetch error:", error.code, error.message)
        if (error.code === "PGRST116") {
          console.log("[v0] No profile found, creating default profile")
          const defaultProfile = {
            id: userId,
            email: user?.email || "",
            role: "view" as const,
          }
          setProfile(defaultProfile)
        } else {
          console.error("[v0] Database error:", error)
          throw error
        }
      } else {
        console.log("[v0] Profile loaded:", data)
        setProfile(data)
      }
    } catch (error) {
      console.error("[v0] Error fetching profile:", error)
      const fallbackProfile = {
        id: userId,
        email: user?.email || "",
        role: "view" as const,
      }
      setProfile(fallbackProfile)
    } finally {
      console.log("[v0] Setting loading to false")
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log("[v0] Attempting sign in for:", email)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        console.error("[v0] Sign in error:", error.message)
        return { error: error.message }
      }
      console.log("[v0] Sign in successful")
      return {}
    } catch (error) {
      console.error("[v0] Sign in exception:", error)
      return { error: "An unexpected error occurred" }
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      console.log("[v0] Attempting sign up for:", email)
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_SITE_URL
            ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
            : `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        console.error("[v0] Sign up error:", error.message)
        return { error: error.message }
      }
      console.log("[v0] Sign up successful")
      return {}
    } catch (error) {
      console.error("[v0] Sign up exception:", error)
      return { error: "An unexpected error occurred" }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin: profile?.role === "admin",
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
