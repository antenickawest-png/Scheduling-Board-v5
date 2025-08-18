"use client"

import { useState, useEffect } from "react"
import { useAuth } from "./use-auth"
import { useSync } from "./use-sync"

interface Resource {
  id: string
  name: string
  type: "crew" | "truck" | "trailer" | "equipment"
  status: "available" | "off" | "shop" | "djm"
  location: "KC" | "Indy" | "STL"
  assignment?: string
}

interface Site {
  id: string
  name: string
  location: string
  resources: Resource[]
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

export default function ScheduleBoard() {
  const { user } = useAuth()
  const { syncToSupabase, loadFromSupabase, autoSync, setAutoSync, lastSync } = useSync()
  const [sites, setSites] = useState<Site[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [draggedResource, setDraggedResource] = useState<Resource | null>(null)
  const [savedSchedules, setSavedSchedules] = useState<string[]>([])
  const [newSiteName, setNewSiteName] = useState("")
  const [showAddSite, setShowAddSite] = useState(false)

  const isAdmin = user?.user_metadata?.role === "admin"

  useEffect(() => {
    const defaultResources: Resource[] = [
      // 👷 Crew
      { id: "crew-1", name: "Geno", type: "crew", status: "available", location: "KC" },
      { id: "crew-2", name: "Mike", type: "crew", status: "available", location: "KC" },
      { id: "crew-3", name: "John", type: "crew", status: "available", location: "Indy" },
      { id: "crew-4", name: "Sarah", type: "crew", status: "available", location: "STL" },

      // 🚚 Trucks
      { id: "truck-1", name: "Truck 101", type: "truck", status: "available", location: "KC" },
      { id: "truck-2", name: "Truck 102", type: "truck", status: "available", location: "Indy" },
      { id: "truck-3", name: "Truck 103", type: "truck", status: "available", location: "STL" },

      // 🚛 Trailers
      { id: "trailer-1", name: "Trailer A", type: "trailer", status: "available", location: "KC" },
      { id: "trailer-2", name: "Trailer B", type: "trailer", status: "available", location: "Indy" },

      // 🔧 Equipment
      { id: "equip-1", name: "Crane 1", type: "equipment", status: "available", location: "KC" },
      { id: "equip-2", name: "Crane 2", type: "equipment", status: "available", location: "STL" },
    ]

    setResources(defaultResources)
    loadSchedule()
  }, [])

  const loadSchedule = async () => {
    const { data } = await loadFromSupabase()
    if (data) {
      setSites(data.sites || [])
      setResources(data.resources || [])
      setSavedSchedules(data.savedSchedules || [])
    }
  }

  const handleSync = async () => {
    const scheduleData = { sites, resources, savedSchedules }
    await syncToSupabase(scheduleData)
  }

  const addSite = () => {
    if (!isAdmin || !newSiteName.trim()) return

    const newSite: Site = {
      id: `site-${Date.now()}`,
      name: newSiteName.trim(),
      location: "KC",
      resources: [],
    }

    setSites((prev) => [...prev, newSite])
    setNewSiteName("")
    setShowAddSite(false)
  }

  const deleteSite = (siteId: string) => {
    if (!isAdmin) return

    // Return resources to available pool
    const siteToDelete = sites.find((s) => s.id === siteId)
    if (siteToDelete) {
      setResources((prev) => [...prev, ...siteToDelete.resources.map((r) => ({ ...r, assignment: undefined }))])
    }

    setSites((prev) => prev.filter((s) => s.id !== siteId))
  }

  const clearBoard = () => {
    if (!isAdmin) return

    // Return all resources to available pool
    const allResources = sites.flatMap((site) => site.resources.map((r) => ({ ...r, assignment: undefined })))
    setResources((prev) => [...prev, ...allResources])
    setSites([])
  }

  const handleDragStart = (resource: Resource) => {
    if (!isAdmin) return
    setDraggedResource(resource)
  }

  const handleDrop = (siteId: string, day: string) => {
    if (!isAdmin || !draggedResource) return

    const newSites = [...sites]
    const siteIndex = newSites.findIndex((s) => s.id === siteId)

    if (siteIndex !== -1) {
      // Add to existing site
      newSites[siteIndex].resources.push({ ...draggedResource, assignment: `${siteId}-${day}` })
    }

    // Remove resource from available pool
    setResources((prev) => prev.filter((r) => r.id !== draggedResource.id))
    setSites(newSites)
    setDraggedResource(null)
  }

  const moveResourceToAvailable = (resource: Resource) => {
    if (!isAdmin) return

    // Remove from site
    setSites((prev) =>
      prev.map((site) => ({
        ...site,
        resources: site.resources.filter((r) => r.id !== resource.id),
      })),
    )

    // Add back to available resources
    setResources((prev) => [...prev, { ...resource, assignment: undefined }])
  }

  const getResourceEmoji = (type: string) => {
    switch (type) {
      case "crew":
        return "👷"
      case "truck":
        return "🚚"
      case "trailer":
        return "🚛"
      case "equipment":
        return "🔧"
      default:
        return ""
    }
  }

  const getLocationEmoji = (location: string) => {
    switch (location) {
      case "KC":
        return "🏙️"
      case "Indy":
        return "🏁"
      case "STL":
        return "🌉"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-6">
      {/* Controls with original emojis */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg shadow">
        <button onClick={handleSync} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          ☁️ Sync now
        </button>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={autoSync}
            onChange={(e) => setAutoSync(e.target.checked)}
            className="rounded"
          />
          ⏱ Auto-sync (30s)
        </label>

        {isAdmin && (
          <>
            <button
              onClick={() => setShowAddSite(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              ➕ Add Site
            </button>
            <button onClick={clearBoard} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
              🧹 Clear Board
            </button>
            <button onClick={handleSync} className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
              💾 Auto-Save
            </button>
          </>
        )}

        {lastSync && <div className="text-sm text-gray-600">Last sync: {lastSync.toLocaleTimeString()}</div>}
      </div>

      {/* Add Site Modal */}
      {showAddSite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">➕ Add New Site</h3>
            <input
              type="text"
              value={newSiteName}
              onChange={(e) => setNewSiteName(e.target.value)}
              placeholder="Site name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
            />
            <div className="flex gap-2">
              <button onClick={addSite} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                Add
              </button>
              <button
                onClick={() => setShowAddSite(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-6 gap-px bg-gray-200">
          <div className="bg-gray-50 p-4 font-semibold">📋 Sites</div>
          {DAYS.map((day) => (
            <div key={day} className="bg-gray-50 p-4 font-semibold text-center">
              {day}
            </div>
          ))}

          {/* Schedule rows */}
          {sites.map((site) => (
            <div key={site.id} className="contents">
              <div className="bg-white p-4 font-medium border-r flex justify-between items-center">
                <span>{site.name}</span>
                {isAdmin && (
                  <button onClick={() => deleteSite(site.id)} className="text-red-600 hover:text-red-800 text-sm">
                    🗑️
                  </button>
                )}
              </div>
              {DAYS.map((day) => (
                <div
                  key={`${site.id}-${day}`}
                  className="bg-white p-2 min-h-[100px] border-r border-b"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(site.id, day)}
                >
                  {site.resources
                    .filter((resource) => resource.assignment?.includes(day))
                    .map((resource) => (
                      <div
                        key={resource.id}
                        className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm mb-1 cursor-pointer flex justify-between items-center"
                        onClick={() => moveResourceToAvailable(resource)}
                      >
                        <span>
                          {getResourceEmoji(resource.type)} {resource.name}
                        </span>
                        {isAdmin && <span className="text-xs">❌</span>}
                      </div>
                    ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Available Resources with original emojis */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">📊 Available Resources</h3>
        <div className="grid grid-cols-4 gap-6">
          {[
            { type: "crew", emoji: "👷", label: "Crew" },
            { type: "truck", emoji: "🚚", label: "Trucks" },
            { type: "trailer", emoji: "🚛", label: "Trailers" },
            { type: "equipment", emoji: "🔧", label: "Equipment" },
          ].map(({ type, emoji, label }) => (
            <div key={type}>
              <h4 className="font-medium mb-2">
                {emoji} {label}
              </h4>
              <div className="space-y-2">
                {resources
                  .filter((r) => r.type === type)
                  .map((resource) => (
                    <div
                      key={resource.id}
                      draggable={isAdmin}
                      onDragStart={() => handleDragStart(resource)}
                      className={`p-2 rounded text-sm ${
                        resource.status === "available"
                          ? "bg-green-100 text-green-800"
                          : resource.status === "off"
                            ? "bg-red-100 text-red-800"
                            : resource.status === "shop"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                      } ${isAdmin ? "cursor-move" : "cursor-default"}`}
                    >
                      <div className="font-medium">{resource.name}</div>
                      <div className="text-xs">
                        {getLocationEmoji(resource.location)} {resource.location}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Zones with original emojis */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">📊 Status Zones</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 min-h-[100px]">
            <h4 className="font-medium text-red-800 mb-2">Off</h4>
          </div>
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 min-h-[100px]">
            <h4 className="font-medium text-green-800 mb-2">Available</h4>
          </div>
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 min-h-[100px]">
            <h4 className="font-medium text-yellow-800 mb-2">Shop/Logistics</h4>
          </div>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 min-h-[100px]">
            <h4 className="font-medium text-blue-800 mb-2">DJM Use</h4>
          </div>
        </div>
      </div>

      {!isAdmin && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">👁️ You have view-only access. Contact an administrator to make changes.</p>
        </div>
      )}
    </div>
  )
}
