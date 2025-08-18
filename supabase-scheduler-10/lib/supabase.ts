import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
      combos: {
        Row: {
          id: string
          name: string
          resources: any
          created_by: string | null
          created_at: string
        }
        Insert: {
          name: string
          resources: any
          created_by?: string | null
        }
        Update: {
          name?: string
          resources?: any
        }
      }
    }
  }
}
