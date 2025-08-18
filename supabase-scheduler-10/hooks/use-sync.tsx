"use client"

import { useEffect, useRef, useState } from "react"
import { supabase } from "../supabase"
import { useAuth } from "./use-auth"

export function useSync() {
  const { user, isAdmin } = useAuth()
  const [autoSync, setAutoSync] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (autoSync && user) {
      intervalRef.current = setInterval(() => {
        syncFromSupabase()
      }, 30000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [autoSync, user])

  const syncToSupabase = async (boardData: any, permanentBoxesData: any, locationData: any) => {
    if (!user || !isAdmin) return

    try {
      const { error } = await supabase.from("current_board").upsert({
        id: "00000000-0000-0000-0000-000000000001", // Fixed ID for single board
        board_data: boardData,
        permanent_boxes_data: permanentBoxesData,
        location_data: locationData,
        last_updated_by: user.id,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error
      setLastSync(new Date())
      console.log("[v0] Synced to Supabase successfully")
    } catch (error) {
      console.error("[v0] Error syncing to Supabase:", error)
    }
  }

  const syncFromSupabase = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("current_board")
        .select("*")
        .eq("id", "00000000-0000-0000-0000-000000000001")
        .single()

      if (error) throw error

      if (data) {
        // Dispatch custom event with synced data
        window.dispatchEvent(
          new CustomEvent("supabase-sync", {
            detail: {
              boardData: data.board_data,
              permanentBoxesData: data.permanent_boxes_data,
              locationData: data.location_data,
              lastUpdatedBy: data.last_updated_by,
              updatedAt: data.updated_at,
            },
          }),
        )
        setLastSync(new Date())
        console.log("[v0] Synced from Supabase successfully")
      }
    } catch (error) {
      console.error("[v0] Error syncing from Supabase:", error)
    }
  }

  const toggleAutoSync = () => {
    setAutoSync(!autoSync)
  }

  return {
    syncToSupabase,
    syncFromSupabase,
    toggleAutoSync,
    autoSync,
    lastSync,
  }
}
