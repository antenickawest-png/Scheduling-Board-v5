"use client"

import { useEffect, useState } from "react"
import { useAuth } from "../hooks/use-auth"
import LoginForm from "../components/login-form"
import { ScheduleBoard } from "../components/schedule-board" // Add this import

export default function Home() {
  const { user, loading, signOut } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  console.log("[v0] Page component - loading:", loading, "user:", user ? "exists" : "null", "mounted:", mounted)

  if (!mounted) {
    return null
  }

  if (loading) {
    console.log("[v0] Page showing loading screen")
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
        Loading...
      </div>
    )
  }

  if (!user) {
    console.log("[v0] Page showing login form")
    return <LoginForm />
  }

  console.log("[v0] Page showing main app")
  
  // REPLACE THIS ENTIRE BLOCK:
  /*
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ color: "#7c3aed", margin: 0 }}>🚀 R&S Tower Service Scheduling</h1>
        <button
          onClick={() => signOut()}
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
