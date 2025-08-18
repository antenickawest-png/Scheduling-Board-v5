"use client"

import { useAuth } from "../hooks/use-auth"
import LoginForm from "../components/login-form"

export default function Home() {
  const { user, loading } = useAuth()

  console.log("[v0] Page component - loading:", loading, "user:", user ? "exists" : "null")

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
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ color: "#7c3aed", marginBottom: "20px" }}>🚀 R&S Tower Service Scheduling</h1>

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
}
