"use client"

import { useEffect, useState } from "react"
import { useAuth } from "../hooks/use-auth"
import { useSync } from "../hooks/use-sync"
import { supabase } from "../supabase"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"

type Resource = {
  id: string
  name: string
}

type BoardData = {
  columns: any[]
  permanentBoxes: any
  locations: any
}

export function ScheduleBoard() {
  const { user, profile, signOut, isAdmin } = useAuth()
  const { syncToSupabase, syncFromSupabase, toggleAutoSync, autoSync } = useSync()
  const [currentPage, setCurrentPage] = useState(1)
  const [crews, setCrews] = useState<Resource[]>([])
  const [trucks, setTrucks] = useState<Resource[]>([])
  const [trailers, setTrailers] = useState<Resource[]>([])
  const [equipment, setEquipment] = useState<Resource[]>([])
  const [schedules, setSchedules] = useState<any[]>([])
  const [boardData, setBoardData] = useState<BoardData>({
    columns: [],
    permanentBoxes: {},
    locations: {},
  })

  useEffect(() => {
    if (user) {
      loadResources()
      loadSchedules()
      syncFromSupabase()
    }
  }, [user])

  useEffect(() => {
    const handleSync = (event: CustomEvent) => {
      const { boardData: syncedBoardData, permanentBoxesData, locationData } = event.detail
      setBoardData({
        columns: syncedBoardData?.columns || [],
        permanentBoxes: permanentBoxesData || {},
        locations: locationData || {},
      })
    }

    window.addEventListener("supabase-sync", handleSync as EventListener)
    return () => window.removeEventListener("supabase-sync", handleSync as EventListener)
  }, [])

  const loadResources = async () => {
    try {
      const [crewsRes, trucksRes, trailersRes, equipmentRes] = await Promise.all([
        supabase.from("crews").select("*").order("name"),
        supabase.from("trucks").select("*").order("name"),
        supabase.from("trailers").select("*").order("name"),
        supabase.from("equipment").select("*").order("name"),
      ])

      if (crewsRes.data) setCrews(crewsRes.data)
      if (trucksRes.data) setTrucks(trucksRes.data)
      if (trailersRes.data) setTrailers(trailersRes.data)
      if (equipmentRes.data) setEquipment(equipmentRes.data)
    } catch (error) {
      console.error("[v0] Error loading resources:", error)
    }
  }

  const loadSchedules = async () => {
    try {
      const { data, error } = await supabase.from("schedules").select("*").order("created_at", { ascending: false })

      if (error) throw error
      if (data) setSchedules(data)
    } catch (error) {
      console.error("[v0] Error loading schedules:", error)
    }
  }

  const addResource = async (type: "crews" | "trucks" | "trailers" | "equipment", name: string) => {
    if (!isAdmin) return

    try {
      const { data, error } = await supabase.from(type).insert({ name, created_by: user?.id }).select().single()

      if (error) throw error

      // Update local state
      const setter =
        type === "crews" ? setCrews : type === "trucks" ? setTrucks : type === "trailers" ? setTrailers : setEquipment

      setter((prev) => [...prev, data])
    } catch (error) {
      console.error(`[v0] Error adding ${type}:`, error)
    }
  }

  const handleSyncNow = () => {
    syncFromSupabase()
  }

  const handleSaveBoard = async () => {
    if (!isAdmin) return

    // Get current board state from DOM (simplified for demo)
    const currentBoardData = {
      columns: [], // Would extract from DOM
      timestamp: new Date().toISOString(),
    }

    await syncToSupabase(currentBoardData, {}, {})
  }

  if (!user || !profile) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-purple-50">
      {/* Header */}
      <header className="bg-purple-600 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">📅 R&S Weekly Schedule</h1>

          <nav className="flex gap-2">
            <Button
              variant={currentPage === 1 ? "default" : "outline"}
              onClick={() => setCurrentPage(1)}
              className="text-sm"
            >
              📋 Board & Resources
            </Button>
            <Button
              variant={currentPage === 2 ? "default" : "outline"}
              onClick={() => setCurrentPage(2)}
              className="text-sm"
            >
              💾 Saved Schedules
            </Button>
            {isAdmin && (
              <Button
                variant={currentPage === 3 ? "default" : "outline"}
                onClick={() => setCurrentPage(3)}
                className="text-sm"
              >
                👥 User Management
              </Button>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <Button onClick={handleSyncNow} variant="outline" size="sm" title="Force sync from cloud">
              ☁️ Sync now
            </Button>
            <Button
              onClick={toggleAutoSync}
              variant={autoSync ? "default" : "outline"}
              size="sm"
              title="Toggle 30s auto-sync"
            >
              ⏱ Auto-sync (30s) {autoSync ? "(ON)" : "(OFF)"}
            </Button>
            <span className="text-sm text-white">
              {profile?.username} ({profile?.role === "admin" ? "👑 Admin" : "👁️ View"})
            </span>
            <Button onClick={signOut} variant="outline" size="sm">
              🚪 Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="p-6">
        {currentPage === 1 && (
          <div>
            <h2 className="text-xl font-bold mb-4">📅 Weekly Sites & Resources</h2>

            {/* Controls */}
            {isAdmin && (
              <div className="flex gap-2 mb-6">
                <Button onClick={() => {}}>➕ Add Site</Button>
                <Button onClick={() => {}}>🗑️ Delete Site</Button>
                <Button onClick={() => {}}>🧹 Clear Board</Button>
                <Button onClick={handleSaveBoard}>💾 Auto-Save</Button>
                <Button onClick={() => {}}>🔄 Add Combo</Button>
              </div>
            )}

            {/* Resources */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <ResourceSection
                title="👷 Crew"
                resources={crews}
                onAdd={(name) => addResource("crews", name)}
                canEdit={isAdmin}
              />
              <ResourceSection
                title="🚚 Trucks"
                resources={trucks}
                onAdd={(name) => addResource("trucks", name)}
                canEdit={isAdmin}
              />
              <ResourceSection
                title="🚛 Trailers"
                resources={trailers}
                onAdd={(name) => addResource("trailers", name)}
                canEdit={isAdmin}
              />
              <ResourceSection
                title="🔧 Equipment"
                resources={equipment}
                onAdd={(name) => addResource("equipment", name)}
                canEdit={isAdmin}
              />
            </div>

            {/* Board Area */}
            <div className="bg-white rounded-lg p-4 min-h-96 border-2 border-dashed border-purple-200">
              <p className="text-center text-purple-600">📋 Drag and drop scheduling board will be implemented here</p>
            </div>

            {/* Status Boxes */}
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-4">📊 Status Zones</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatusBox title="🏠 Off" />
                <StatusBox title="✅ Available" />
                <StatusBox title="🔧 Shop/Logistics" />
                <StatusBox title="🏢 DJM Use" />
              </div>
            </div>

            {/* Locations */}
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-4">📍 Locations</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <LocationZone title="🏙️ KC" />
                <LocationZone title="🏁 Indy" />
                <LocationZone title="🌉 STL" />
              </div>
            </div>
          </div>
        )}

        {currentPage === 2 && (
          <div>
            <h2 className="text-xl font-bold mb-4">💾 Saved Schedules</h2>
            <div className="flex gap-2 mb-4">
              <Select>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select saved schedule" />
                </SelectTrigger>
                <SelectContent>
                  {schedules.map((schedule) => (
                    <SelectItem key={schedule.id} value={schedule.id}>
                      {schedule.name} - {new Date(schedule.created_at).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button>📂 Load</Button>
              {isAdmin && <Button>📸 Save Snapshot</Button>}
            </div>
          </div>
        )}

        {currentPage === 3 && isAdmin && (
          <div>
            <h2 className="text-xl font-bold mb-4">👥 User Management</h2>
            <p className="text-purple-600">User management interface will be implemented here</p>
          </div>
        )}
      </main>
    </div>
  )
}

function ResourceSection({
  title,
  resources,
  onAdd,
  canEdit,
}: {
  title: string
  resources: Resource[]
  onAdd: (name: string) => void
  canEdit: boolean
}) {
  const [newResource, setNewResource] = useState("")

  const handleAdd = () => {
    if (newResource.trim() && canEdit) {
      onAdd(newResource.trim())
      setNewResource("")
    }
  }

  return (
    <div className="bg-white rounded-lg p-4">
      <h3 className="font-bold mb-2">{title}</h3>
      {canEdit && (
        <div className="flex gap-1 mb-2">
          <Input
            value={newResource}
            onChange={(e) => setNewResource(e.target.value)}
            placeholder="Add new..."
            className="text-sm"
            onKeyPress={(e) => e.key === "Enter" && handleAdd()}
          />
          <Button onClick={handleAdd} size="sm">
            ➕
          </Button>
        </div>
      )}
      <div className="space-y-1 max-h-32 overflow-y-auto">
        {resources.map((resource) => (
          <div key={resource.id} className="bg-purple-100 p-2 rounded text-sm cursor-move" draggable>
            {resource.name}
          </div>
        ))}
      </div>
    </div>
  )
}

function StatusBox({ title }: { title: string }) {
  return (
    <div className="bg-white rounded-lg p-4 border-2 border-dashed border-purple-200 min-h-24">
      <h4 className="font-bold text-center">{title}</h4>
    </div>
  )
}

function LocationZone({ title }: { title: string }) {
  return (
    <div className="bg-white rounded-lg p-4 border-2 border-dashed border-purple-200 min-h-24">
      <h4 className="font-bold text-center">{title}</h4>
    </div>
  )
}

export default ScheduleBoard
