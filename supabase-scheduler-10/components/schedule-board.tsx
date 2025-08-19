"use client"

import { useEffect, useState, useRef } from "react"
import { useAuth } from "../hooks/use-auth"
import { useSync } from "../hooks/use-sync"
import { supabase } from "../supabase"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"

type Resource = {
  id: string
  name: string
  type?: string
}

type Column = {
  id: string
  name: string
  items: Resource[]
}

type BoardData = {
  columns: Column[]
  permanentBoxes: {
    [key: string]: Resource[]
  }
  locations: {
    [key: string]: Resource[]
  }
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
    permanentBoxes: {
      "off-box": [],
      "available-box": [],
      "shop-box": [],
      "djmuse-box": []
    },
    locations: {
      "kc-zone": [],
      "indy-zone": [],
      "stl-zone": []
    }
  })
  const [draggedItem, setDraggedItem] = useState<Resource | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [comboName, setComboName] = useState("")
  const [showComboControls, setShowComboControls] = useState(false)

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
        permanentBoxes: permanentBoxesData || {
          "off-box": [],
          "available-box": [],
          "shop-box": [],
          "djmuse-box": []
        },
        locations: locationData || {
          "kc-zone": [],
          "indy-zone": [],
          "stl-zone": []
        }
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

      if (crewsRes.data) setCrews(crewsRes.data.map(c => ({ ...c, type: 'crew' })))
      if (trucksRes.data) setTrucks(trucksRes.data.map(t => ({ ...t, type: 'truck' })))
      if (trailersRes.data) setTrailers(trailersRes.data.map(t => ({ ...t, type: 'trailer' })))
      if (equipmentRes.data) setEquipment(equipmentRes.data.map(e => ({ ...e, type: 'equipment' })))
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
      const resourceWithType = { ...data, type: type.slice(0, -1) }
      
      if (type === "crews") {
        setCrews(prev => [...prev, resourceWithType])
      } else if (type === "trucks") {
        setTrucks(prev => [...prev, resourceWithType])
      } else if (type === "trailers") {
        setTrailers(prev => [...prev, resourceWithType])
      } else if (type === "equipment") {
        setEquipment(prev => [...prev, resourceWithType])
      }
    } catch (error) {
      console.error(`[v0] Error adding ${type}:`, error)
    }
  }

  const handleDragStart = (item: Resource) => {
    setDraggedItem(item)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (destination: string, columnIndex?: number) => {
    if (!draggedItem) return

    // Create a copy of the current board data
    const newBoardData = { ...boardData }

    // Handle drop based on destination
    if (destination === 'board' && typeof columnIndex === 'number') {
      // Ensure column exists
      if (!newBoardData.columns[columnIndex]) {
        newBoardData.columns[columnIndex] = {
          id: `column_${Date.now()}`,
          name: `Site ${columnIndex + 1}`,
          items: []
        }
      }
      
      // Add item to column
      newBoardData.columns[columnIndex].items.push(draggedItem)
    } else if (destination.startsWith('permanent-')) {
      const boxKey = destination.replace('permanent-', '')
      if (newBoardData.permanentBoxes[boxKey]) {
        newBoardData.permanentBoxes[boxKey].push(draggedItem)
      }
    } else if (destination.startsWith('location-')) {
      const zoneKey = destination.replace('location-', '')
      if (newBoardData.locations[zoneKey]) {
        newBoardData.locations[zoneKey].push(draggedItem)
      }
    }

    // Update board data
    setBoardData(newBoardData)
    setDraggedItem(null)
    
    // Sync to Supabase if admin
    if (isAdmin) {
      syncToSupabase(newBoardData.columns, newBoardData.permanentBoxes, newBoardData.locations)
    }
  }

  const addSite = () => {
    if (!isAdmin) return
    
    const siteName = prompt('Enter site name:')
    if (!siteName) return
    
    const newBoardData = { ...boardData }
    newBoardData.columns.push({
      id: `site_${Date.now()}`,
      name: siteName,
      items: []
    })
    
    setBoardData(newBoardData)
    
    // Sync to Supabase
    syncToSupabase(newBoardData.columns, newBoardData.permanentBoxes, newBoardData.locations)
  }

  const deleteSite = () => {
    if (!isAdmin) return
    
    const siteIndex = parseInt(prompt('Enter site index to delete (0-based):') || '-1')
    if (siteIndex < 0 || siteIndex >= boardData.columns.length) return
    
    const newBoardData = { ...boardData }
    newBoardData.columns.splice(siteIndex, 1)
    
    setBoardData(newBoardData)
    
    // Sync to Supabase
    syncToSupabase(newBoardData.columns, newBoardData.permanentBoxes, newBoardData.locations)
  }

  const clearBoard = () => {
    if (!isAdmin) return
    
    if (!confirm('Are you sure you want to clear the board?')) return
    
    const newBoardData = { ...boardData }
    newBoardData.columns = []
    
    setBoardData(newBoardData)
    
    // Sync to Supabase
    syncToSupabase(newBoardData.columns, newBoardData.permanentBoxes, newBoardData.locations)
  }

  const toggleItemSelection = (item: Resource) => {
    setSelectedItems(prev => {
      if (prev.includes(item.id)) {
        return prev.filter(id => id !== item.id)
      } else {
        return [...prev, item.id]
      }
    })
  }

  const addCombo = () => {
    if (!isAdmin || !comboName || selectedItems.length < 2) return
    
    // Create combo logic would go here
    alert(`Created combo "${comboName}" with ${selectedItems.length} items`)
    
    // Clear selection
    setComboName("")
    setSelectedItems([])
  }

  const handleSyncNow = () => {
    syncFromSupabase()
  }

  const handleSaveBoard = async () => {
    if (!isAdmin) return

    await syncToSupabase(boardData.columns, boardData.permanentBoxes, boardData.locations)
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
              <div className="flex gap-2 mb-6 bg-purple-100 p-3 rounded-lg overflow-x-auto">
                <Button onClick={addSite}>➕ Add Site</Button>
                <Button onClick={deleteSite}>🗑️ Delete Site</Button>
                <Button onClick={clearBoard}>🧹 Clear Board</Button>
                <Button onClick={handleSaveBoard}>💾 Auto-Save</Button>
                <Button onClick={() => setShowComboControls(!showComboControls)}>
                  {showComboControls ? "❌ Hide Combo" : "🔄 Show Combo"}
                </Button>
              </div>
            )}

            {/* Combo Controls */}
            {isAdmin && showComboControls && (
              <div className="flex gap-2 mb-6 bg-purple-100 p-3 rounded-lg">
                <Input
                  value={comboName}
                  onChange={(e) => setComboName(e.target.value)}
                  placeholder="Combo Name"
                  className="max-w-xs"
                />
                <Button onClick={addCombo}>🔄 Add Combo</Button>
                <span className="text-sm text-purple-700 self-center">
                  {selectedItems.length} items selected
                </span>
              </div>
            )}

            {/* Resources */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <ResourceSection
                title="👷 Crew"
                resources={crews}
                onAdd={(name) => addResource("crews", name)}
                canEdit={isAdmin}
                onDragStart={handleDragStart}
                selectedItems={selectedItems}
                onToggleSelection={toggleItemSelection}
              />
              <ResourceSection
                title="🚚 Trucks"
                resources={trucks}
                onAdd={(name) => addResource("trucks", name)}
                canEdit={isAdmin}
                onDragStart={handleDragStart}
                selectedItems={selectedItems}
                onToggleSelection={toggleItemSelection}
              />
              <ResourceSection
                title="🚛 Trailers"
                resources={trailers}
                onAdd={(name) => addResource("trailers", name)}
                canEdit={isAdmin}
                onDragStart={handleDragStart}
                selectedItems={selectedItems}
                onToggleSelection={toggleItemSelection}
              />
              <ResourceSection
                title="🔧 Equipment"
                resources={equipment}
                onAdd={(name) => addResource("equipment", name)}
                canEdit={isAdmin}
                onDragStart={handleDragStart}
                selectedItems={selectedItems}
                onToggleSelection={toggleItemSelection}
              />
            </div>

            {/* Board Area */}
            <div 
              className="flex gap-4 overflow-x-auto p-4 min-h-64 bg-purple-50 border-t border-purple-200 rounded-lg mb-6"
              onDragOver={handleDragOver}
            >
              {boardData.columns.map((column, index) => (
                <div 
                  key={column.id}
                  className="bg-white rounded-lg p-3 min-w-48 border-2 border-purple-200 flex-shrink-0"
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop('board', index)}
                >
                  <Input 
                    value={column.name} 
                    onChange={(e) => {
                      const newBoardData = { ...boardData }
                      newBoardData.columns[index].name = e.target.value
                      setBoardData(newBoardData)
                    }}
                    className="mb-2 font-bold text-center"
                    readOnly={!isAdmin}
                  />
                  <div className="space-y-2">
                    {column.items.map((item, itemIndex) => (
                      <div 
                        key={`${item.id}_${itemIndex}`}
                        className={`p-2 rounded text-sm flex justify-between items-center ${
                          item.type === 'crew' ? 'bg-purple-200' :
                          item.type === 'truck' ? 'bg-purple-100' :
                          item.type === 'trailer' ? 'bg-green-100' :
                          'bg-yellow-100'
                        }`}
                      >
                        <span>{item.name}</span>
                        {isAdmin && (
                          <div className="flex gap-1">
                            <button 
                              className="text-xs opacity-70 hover:opacity-100"
                              onClick={() => {
                                const newBoardData = { ...boardData }
                                newBoardData.columns[index].items.splice(itemIndex, 1)
                                setBoardData(newBoardData)
                              }}
                            >
                              ❌
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {boardData.columns.length === 0 && (
                <div className="w-full text-center text-purple-400 py-10">
                  No sites added yet. Click "Add Site" to create one.
                </div>
              )}
            </div>

            {/* Status Boxes */}
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-4">📊 Status Zones</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatusBox 
                  title="🏠 Off" 
                  items={boardData.permanentBoxes["off-box"]} 
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop('permanent-off-box')}
                  isAdmin={isAdmin}
                  onRemoveItem={(index) => {
                    const newBoardData = { ...boardData }
                    newBoardData.permanentBoxes["off-box"].splice(index, 1)
                    setBoardData(newBoardData)
                  }}
                />
                <StatusBox 
                  title="✅ Available" 
                  items={boardData.permanentBoxes["available-box"]}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop('permanent-available-box')}
                  isAdmin={isAdmin}
                  onRemoveItem={(index) => {
                    const newBoardData = { ...boardData }
                    newBoardData.permanentBoxes["available-box"].splice(index, 1)
                    setBoardData(newBoardData)
                  }}
                />
                <StatusBox 
                  title="🔧 Shop/Logistics" 
                  items={boardData.permanentBoxes["shop-box"]}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop('permanent-shop-box')}
                  isAdmin={isAdmin}
                  onRemoveItem={(index) => {
                    const newBoardData = { ...boardData }
                    newBoardData.permanentBoxes["shop-box"].splice(index, 1)
                    setBoardData(newBoardData)
                  }}
                />
                <StatusBox 
                  title="🏢 DJM Use" 
                  items={boardData.permanentBoxes["djmuse-box"]}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop('permanent-djmuse-box')}
                  isAdmin={isAdmin}
                  onRemoveItem={(index) => {
                    const newBoardData = { ...boardData }
                    newBoardData.permanentBoxes["djmuse-box"].splice(index, 1)
                    setBoardData(newBoardData)
                  }}
                />
              </div>
            </div>

            {/* Locations */}
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-4">📍 Locations</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <LocationZone 
                  title="🏙️ KC" 
                  items={boardData.locations["kc-zone"]}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop('location-kc-zone')}
                  isAdmin={isAdmin}
                  onRemoveItem={(index) => {
                    const newBoardData = { ...boardData }
                    newBoardData.locations["kc-zone"].splice(index, 1)
                    setBoardData(newBoardData)
                  }}
                />
                <LocationZone 
                  title="🏁 Indy" 
                  items={boardData.locations["indy-zone"]}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop('location-indy-zone')}
                  isAdmin={isAdmin}
                  onRemoveItem={(index) => {
                    const newBoardData = { ...boardData }
                    newBoardData.locations["indy-zone"].splice(index, 1)
                    setBoardData(newBoardData)
                  }}
                />
                <LocationZone 
                  title="🌉 STL" 
                  items={boardData.locations["stl-zone"]}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop('location-stl-zone')}
                  isAdmin={isAdmin}
                  onRemoveItem={(index) => {
                    const newBoardData = { ...boardData }
                    newBoardData.locations["stl-zone"].splice(index, 1)
                    setBoardData(newBoardData)
                  }}
                />
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
  onDragStart,
  selectedItems,
  onToggleSelection
}: {
  title: string
  resources: Resource[]
  onAdd: (name: string) => void
  canEdit: boolean
  onDragStart: (item: Resource) => void
  selectedItems: string[]
  onToggleSelection: (item: Resource) => void
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
      <div className="space-y-1 max-h-32 overflow-y-auto border border-dashed border-purple-200 p-2 rounded-md">
        {resources.map((resource) => (
          <div 
            key={resource.id} 
            className={`${
              resource.type === 'crew' ? 'bg-purple-200' :
              resource.type === 'truck' ? 'bg-purple-100' :
              resource.type === 'trailer' ? 'bg-green-100' :
              'bg-yellow-100'
            } p-2 rounded text-sm cursor-move flex justify-between items-center ${
              selectedItems.includes(resource.id) ? 'ring-2 ring-orange-400' : ''
            }`}
            draggable
            onDragStart={() => onDragStart(resource)}
            onClick={() => onToggleSelection(resource)}
          >
            <span>{resource.name}</span>
            {canEdit && (
              <button className="text-xs opacity-70 hover:opacity-100">❌</button>
            )}
          </div>
        ))}
        {resources.length === 0 && (
          <div className="text-center text-gray-400 py-2 text-xs">No items</div>
        )}
      </div>
    </div>
  )
}

function StatusBox({ 
  title, 
  items = [], 
  onDragOver, 
  onDrop,
  isAdmin,
  onRemoveItem
}: { 
  title: string
  items?: Resource[]
  onDragOver: (e: React.DragEvent) => void
  onDrop: () => void
  isAdmin: boolean
  onRemoveItem: (index: number) => void
}) {
  return (
    <div 
      className="bg-white rounded-lg p-4 border-2 border-dashed border-purple-200 min-h-24"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <h4 className="font-bold text-center mb-2">{title}</h4>
      <div className="space-y-1">
        {items.map((item, index) => (
          <div 
            key={`${item.id}_${index}`}
            className={`p-2 rounded text-sm flex justify-between items-center ${
              item.type === 'crew' ? 'bg-purple-200' :
              item.type === 'truck' ? 'bg-purple-100' :
              item.type === 'trailer' ? 'bg-green-100' :
              'bg-yellow-100'
            }`}
          >
            <span>{item.name}</span>
            {isAdmin && (
              <button 
                className="text-xs opacity-70 hover:opacity-100"
                onClick={() => onRemoveItem(index)}
              >
                ❌
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function LocationZone({ 
  title, 
  items = [],
  onDragOver,
  onDrop,
  isAdmin,
  onRemoveItem
}: { 
  title: string
  items?: Resource[]
  onDragOver: (e: React.DragEvent) => void
  onDrop: () => void
  isAdmin: boolean
  onRemoveItem: (index: number) => void
}) {
  return (
    <div 
      className="bg-white rounded-lg p-4 border-2 border-dashed border-purple-200 min-h-24"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <h4 className="font-bold text-center mb-2">{title}</h4>
      <div className="space-y-1">
        {items.map((item, index) => (
          <div 
            key={`${item.id}_${index}`}
            className={`p-2 rounded text-sm flex justify-between items-center ${
              item.type === 'crew' ? 'bg-purple-200' :
              item.type === 'truck' ? 'bg-purple-100' :
              item.type === 'trailer' ? 'bg-green-100' :
              'bg-yellow-100'
            }`}
          >
            <span>{item.name}</span>
            {isAdmin && (
              <button 
                className="text-xs opacity-70 hover:opacity-100"
                onClick={() => onRemoveItem(index)}
              >
                ❌
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ScheduleBoard
