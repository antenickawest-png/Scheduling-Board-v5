import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ldbjgdfkjnpxwvrofmkx.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkYmpnZGZram5weHd2cm9mbWt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4OTMwMTYsImV4cCI6MjA3MDQ2OTAxNn0.2DeJq25bo_3nKG_PhkWaUUssVjUqQSRqsoeo8zZ4dFg";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: "admin" | "view";
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: "admin" | "view";
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: "admin" | "view";
          created_at?: string;
        };
      };
      schedules: {
        Row: {
          id: string;
          name: string;
          data: any;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          data: any;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          data?: any;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      resources: {
        Row: {
          id: string;
          type: string;
          name: string;
          status: string;
          location: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: string;
          name: string;
          status: string;
          location: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: string;
          name?: string;
          status?: string;
          location?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
