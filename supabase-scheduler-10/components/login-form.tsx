"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "../hooks/use-auth"
import { Button } from "./ui/button"  // Fixed import path
import { Input } from "./ui/input"    // Fixed import path
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"  // Fixed import path

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [username, setUsername] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      let result
      if (isSignUp) {
        // Check if email is antenicka.west@rnstower.com to auto-assign admin role
        const isAdminEmail = email.toLowerCase() === 'antenicka.west@rnstower.com'
        result = await signUp(email, password, username)
        
        // Show special message for admin signup
        if (isAdminEmail && !result.error) {
          alert("Admin account created successfully!")
        }
      } else {
        result = await signIn(email, password)
      }

      if (result.error) {
        setError(result.error)
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error("Login error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-300 to-purple-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-purple-800">🚀 R&S Tower Service Scheduling</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}

            <div>
              <Input
                type="email"
                placeholder="📧 Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {isSignUp && (
              <div>
                <Input
                  type="text"
                  placeholder="👤 Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            )}

            <div>
              <Input
                type="password"
                placeholder="🔒 Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white" disabled={loading}>
              {loading ? "Loading..." : isSignUp ? "🚀 Sign Up" : "🚀 Sign In"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-purple-600 hover:underline"
              >
                {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginForm

