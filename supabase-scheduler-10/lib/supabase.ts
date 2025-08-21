// lib/supabase.ts
import { createClient } from "@supabase/supabase-js"

// Use default values for development if environment variables are not set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ldbjgdfkjnpxwvrofmkx.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkYmpnZGZram5weHd2cm9mbWt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4OTMwMTYsImV4cCI6MjA3MDQ2OTAxNn0.2DeJq25bo_3nKG_PhkWaUUssVjUqQSRqsoeo8zZ4dFg"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for common database operations
export async function getResources(table: 'crews' | 'trucks' | 'trailers' | 'equipment') {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .order('name')
  
  if (error) {
    console.error(`Error fetching ${table}:`, error)
    return []
  }
  
  return data || []
}

export async function addResource(table: 'crews' | 'trucks' | 'trailers' | 'equipment', name: string, userId?: string) {
  const { data, error } = await supabase
    .from(table)
    .insert({ name, created_by: userId })
    .select()
    .single()
  
  if (error) {
    console.error(`Error adding ${table}:`, error)
    throw error
  }
  
  return data
}

export async function getCurrentBoard() {
  const { data, error } = await supabase
    .from('current_board')
    .select('*')
    .eq('id', '00000000-0000-0000-0000-000000000001')
    .single()
  
  if (error && error.code !== 'PGRST116') { // Ignore "not found" error
    console.error('Error fetching current board:', error)
    throw error
  }
  
  return data
}

export async function updateCurrentBoard(boardData: any, permanentBoxesData: any, locationData: any, userId?: string) {
  // Check if board exists
  const { data: existingBoard } = await supabase
    .from('current_board')
    .select('id')
    .eq('id', '00000000-0000-0000-0000-000000000001')
    .single()
  
  const updateData = {
    board_data: boardData,
    permanent_boxes_data: permanentBoxesData,
    location_data: locationData,
    last_updated_by: userId,
    updated_at: new Date().toISOString()
  }
  
  if (existingBoard) {
    // Update existing board
    const { error } = await supabase
      .from('current_board')
      .update(updateData)
      .eq('id', '00000000-0000-0000-0000-000000000001')
    
    if (error) {
      console.error('Error updating board:', error)
      throw error
    }
  } else {
    // Insert new board
    const { error } = await supabase
      .from('current_board')
      .insert({
        id: '00000000-0000-0000-0000-000000000001',
        ...updateData
      })
    
    if (error) {
      console.error('Error creating board:', error)
      throw error
    }
  }
  
  return true
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          role: "admin" | "view"
          password_changed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username: string
          role?: "admin" | "view"
          password_changed?: boolean
        }
        Update: {
          username?: string
          role?: "admin" | "view"
          password_changed?: boolean
        }
      }
      crews: {
        Row: {
          id: string
          name: string
          created_by: string | null
          created_at: string
        }
        Insert: {
          name: string
          created_by?: string | null
        }
        Update: {
          name?: string
        }
      }
      trucks: {
        Row: {
          id: string
          name: string
          created_by: string | null
          created_at: string
        }
        Insert: {
          name: string
          created_by?: string | null
        }
        Update: {
          name?: string
        }
      }
      trailers: {
        Row: {
          id: string
          name: string
          created_by: string | null
          created_at: string
        }
        Insert: {
          name: string
          created_by?: string | null
        }
        Update: {
          name?: string
        }
      }
      equipment: {
        Row: {
          id: string
          name: string
          created_by: string | null
          created_at: string
        }
        Insert: {
          name: string
          created_by?: string | null
        }
        Update: {
          name?: string
        }
      }
      schedules: {
        Row: {
          id: string
          name: string
          board_data: any
          permanent_boxes_data: any | null
          location_data: any | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          board_data: any
          permanent_boxes_data?: any | null
          location_data?: any | null
          created_by?: string | null
        }
        Update: {
          name?: string
          board_data?: any
          permanent_boxes_data?: any | null
          location_data?: any | null
        }
      }
      current_board: {
        Row: {
          id: string
          board_data: any
          permanent_boxes_data: any | null
          location_data: any | null
          last_updated_by: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          board_data: any
          permanent_boxes_data?: any | null
          location_data?: any | null
          last_updated_by?: string | null
        }
        Update: {
          board_data?: any
          permanent_boxes_data?: any | null
          location_data?: any | null
          last_updated_by?: string | null
        }
      }
    }
  }
}
