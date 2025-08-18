"use client"

import { useAuth } from "../hooks/use-auth"
import LoginForm from "../components/login-form"
import ScheduleBoard from "../components/schedule-board"
import AdminPanel from "../components/admin-panel"

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  const isAdmin = user?.user_metadata?.role === "admin"

  return (
    <div>
      {isAdmin && (
        <div className="p-4 border-b">
          <AdminPanel />
        </div>
      )}
      <ScheduleBoard />
    </div>
  )
}
