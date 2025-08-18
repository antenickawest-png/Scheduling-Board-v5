"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"
import { useAuth } from "../hooks/use-auth"

type UserProfile = {
  id: string
  email: string
  username: string
  role: "admin" | "view"
  created_at: string
}

export function AdminPanel() {
  const { isAdmin } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAdmin) {
      fetchUsers()
    }
  }, [isAdmin])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: "admin" | "view") => {
    try {
      const { error } = await supabase.from("users").update({ role: newRole }).eq("id", userId)

      if (error) throw error

      // Update local state
      setUsers(users.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))
    } catch (error) {
      console.error("Error updating user role:", error)
      alert("Failed to update user role")
    }
  }

  if (!isAdmin) {
    return null
  }

  if (loading) {
    return <div className="p-4">Loading users...</div>
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">👥 User Management</h3>
      <div className="space-y-2">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <div className="font-medium">📧 {user.email}</div>
              <div className="text-sm text-gray-600">📅 Joined: {new Date(user.created_at).toLocaleDateString()}</div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 rounded text-xs ${
                  user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"
                }`}
              >
                {user.role === "admin" ? "👑 Admin" : "👁️ View"}
              </span>
              <select
                value={user.role}
                onChange={(e) => updateUserRole(user.id, e.target.value as "admin" | "view")}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="view">👁️ View Only</option>
                <option value="admin">👑 Admin</option>
              </select>
              <button
                onClick={() => updateUserRole(user.id, user.role === "admin" ? "view" : "admin")}
                className="text-sm bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700"
              >
                ⚙️ Actions
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminPanel
