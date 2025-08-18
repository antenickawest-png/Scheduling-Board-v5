"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../../../supabase"

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const hash = typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : ""
        const hashParams = new URLSearchParams(hash)
        const access_token = hashParams.get("access_token")
        const refresh_token = hashParams.get("refresh_token")

        if (access_token && refresh_token) {
          await supabase.auth.setSession({ access_token, refresh_token })
          router.replace("/")
          return
        }

        // Handle PKCE code from email confirmations
        const searchParams = new URLSearchParams(window.location.search)
        const code = searchParams.get("code")
        if (code) {
          await supabase.auth.exchangeCodeForSession(code)
          router.replace("/")
          return
        }

        // No auth data found, redirect to home
        router.replace("/")
      } catch (err) {
        console.error("Auth callback error:", err)
        router.replace("/")
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-50">
      <div className="text-center">
        <div className="text-lg text-purple-600 mb-2">🔄 Completing sign in...</div>
        <div className="text-sm text-gray-600">Please wait while we redirect you.</div>
      </div>
    </div>
  )
}
