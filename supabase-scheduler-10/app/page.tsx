"use client"

// Add this export to prevent static prerendering
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react"
import { useAuth } from "../hooks/use-auth"
import LoginForm from "../components/login-form"
import { ScheduleBoard } from "../components/schedule-board"

export default function Home() {
  const { user, loading, signOut } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [loadingTimeout, setLoadingTimeout] = useState(false)

  // Add this effect for client-side hydration
  useEffect(() => {
    console.log("[DEBUG] Component mounted effect running")
    setMounted(true)
    
    // Add a timeout to bypass loading if it takes too long
    const timer = setTimeout(() => {
      console.log("[DEBUG] Loading timeout reached, forcing render")
      setLoadingTimeout(true)
    }, 5000) // 5 seconds timeout
    
    return () => clearTimeout(timer)
  }, [])

  // Log every render
  console.log("[DEBUG] Page rendering - loading:", loading, "user:", user ? "exists" : "null", "mounted:", mounted, "loadingTimeout:", loadingTimeout)

  // Don't render anything until client-side hydration is complete
  if (!mounted) {
    console.log("[DEBUG] Not mounted yet, returning null")
    return null
  }

  // If loading takes too long, show the original UI
  if (loading && !loadingTimeout) {
    console.log("[DEBUG] Still loading, showing loading screen")
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div>
          <p>Loading...</p>
          <p style={{ fontSize: "12px", color: "#666" }}>
            (If this takes too long, the page will continue in a few seconds)
          </p>
        </div>
      </div>
    )
  }

  // If no user and not loading, or loading timed out without a user
  if ((!loading || loadingTimeout) && !user) {
    console.log("[DEBUG] No user, showing login form")
    return <LoginForm />
  }

  console.log("[DEBUG] User authenticated or loading timed out, showing ScheduleBoard")
  
  // REPLACE THIS ENTIRE BLOCK:
  /*
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ color: "#7c3aed", margin: 0 }}>🚀 R&S Tower Service Scheduling</h1>
        <button
          onClick={() => signOut ? signOut() : null}
          style={{
            backgroundColor: "#7c3aed",
            color: "white",
            padding: "8px 16px",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Sign Out
        </button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h2>📅 Weekly Sites & Resources</h2>
        <p>🏙️ KC | 🏁 Indy | 🌉 STL</p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>👷 Crew | 🚚 Trucks | 🚛 Trailers | 🔧 Equipment</h3>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>📊 Status Zones</h3>
        <p>✅ Available | 🔧 Shop/Logistics | 🚫 Off | 🏢 DJM Use</p>
      </div>

      <div>
        <button
          style={{
            backgroundColor: "#7c3aed",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            marginRight: "10px",
          }}
        >
          💾 Save Schedule
        </button>
        <button
          style={{
            backgroundColor: "#7c3aed",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
          }}
        >
          ☁️ Sync Now
        </button>
      </div>
    </div>
  )
  */
  
  // WITH THIS SINGLE LINE:
  return <ScheduleBoard />
}
