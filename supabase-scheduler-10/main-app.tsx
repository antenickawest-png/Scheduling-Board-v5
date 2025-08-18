"use client"

import { useAuth } from "./use-auth"
import LoginForm from "./login-form"
import ScheduleBoard from "./schedule-board"
import AdminPanel from "./admin-panel"

export default function MainApp() {
  const { user, loading, signOut } = useAuth()

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

  return (
    <div className="min-h-screen bg-purple-50">
      <header className="bg-purple-600 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-white">📅 R&S Weekly Schedule</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-purple-100">
                {user.email} ({user.user_metadata?.role || "view"})
              </span>
              <button
                onClick={signOut}
                className="px-4 py-2 text-sm bg-purple-800 text-white rounded-md hover:bg-purple-900"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ScheduleBoard />
        {user.user_metadata?.role === "admin" && (
          <div className="mt-8">
            <AdminPanel />
          </div>
        )}
      </main>
    </div>
  )
}
