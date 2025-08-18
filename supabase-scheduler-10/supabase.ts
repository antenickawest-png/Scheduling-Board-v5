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
          role: "admin" | "view"
          created_at: string
        }
        Insert: {
          id: string
          email: string
          role?: "admin" | "view"
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: "admin" | "view"
          created_at?: string
        }
      }
      schedules: {
        Row: {
          id: string
          name: string
          data: any
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          data: any
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          data?: any
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      resources: {
        Row: {
          id: string
          type: string
          name: string
          status: string
          location: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: string
          name: string
          status: string
          location: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: string
          name?: string
          status?: string
          location?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
