"use client"

import { useEffect, useRef, useState } from "react"
import { supabase } from "../lib/supabase" // Updated import path
import { useAuth } from "./use-auth"

export function useSync() {
  const { user, isAdmin } = useAuth()
  const [autoSync, setAutoSync] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (autoSync && user) {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      
      // Set up new interval
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
      setSyncError(null)
      
      // First, check if the board exists
      const { data: existingBoard } = await supabase
        .from("current_board")
        .select("id")
        .eq("id", "00000000-0000-0000-0000-000000000001")
        .single();
      
      let result;
      
      if (existingBoard) {
        // Update existing board
        result = await supabase.from("current_board").update({
          board_data: boardData,
          permanent_boxes_data: permanentBoxesData,
          location_data: locationData,
          last_updated_by: user.id,
          updated_at: new Date().toISOString(),
        }).eq("id", "00000000-0000-0000-0000-000000000001");
      } else {
        // Insert new board
        result = await supabase.from("current_board").insert({
          id: "00000000-0000-0000-0000-000000000001",
          board_data: boardData,
          permanent_boxes_data: permanentBoxesData,
          location_data: locationData,
          last_updated_by: user.id,
          updated_at: new Date().toISOString(),
        });
      }

      if (result.error) throw result.error
      
      setLastSync(new Date())
      console.log("[v0] Synced to Supabase successfully")
    } catch (error: any) {
      console.error("[v0] Error syncing to Supabase:", error)
      setSyncError(error.message || "Failed to sync to Supabase")
    }
  }

  const syncFromSupabase = async () => {
    if (!user) return

    try {
      setSyncError(null)
      
      const { data, error } = await supabase
        .from("current_board")
        .select("*")
        .eq("id", "00000000-0000-0000-0000-000000000001")
        .single()

      if (error) {
        // If the error is "not found", it's not a real error - just means no board yet
        if (error.code === 'PGRST116') {
          console.log("[v0] No board found in Supabase yet")
          return
        }
        throw error
      }

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
    } catch (error: any) {
      console.error("[v0] Error syncing from Supabase:", error)
      setSyncError(error.message || "Failed to sync from Supabase")
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
    syncError,
  }
}
