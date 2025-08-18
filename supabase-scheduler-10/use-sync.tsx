"use client"

import { useEffect, useState } from "react"
import { supabase } from "./supabase"
import { useAuth } from "./use-auth"

export function useSync() {
  const { user } = useAuth()
  const [autoSync, setAutoSync] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  const syncToSupabase = async (data: any) => {
    if (!user) return { error: "Not authenticated" }

    try {
      const { error } = await supabase.from("schedules").upsert({
        id: "current-schedule",
        name: "Current Schedule",
        data: data,
        created_by: user.id,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      setLastSync(new Date())
      return { error: null }
    } catch (error) {
      console.error("Sync error:", error)
      return { error }
    }
  }

  const loadFromSupabase = async () => {
    if (!user) return { data: null, error: "Not authenticated" }

    try {
      const { data, error } = await supabase.from("schedules").select("*").eq("id", "current-schedule").single()

      if (error && error.code !== "PGRST116") throw error

      return { data: data?.data || null, error: null }
    } catch (error) {
      console.error("Load error:", error)
      return { data: null, error }
    }
  }

  // Auto-sync every 30 seconds when enabled
  useEffect(() => {
    if (!autoSync || !user) return

    const interval = setInterval(async () => {
      const scheduleData = localStorage.getItem("scheduleData")
      if (scheduleData) {
        await syncToSupabase(JSON.parse(scheduleData))
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [autoSync, user])

  return {
    syncToSupabase,
    loadFromSupabase,
    autoSync,
    setAutoSync,
    lastSync,
  }
}
