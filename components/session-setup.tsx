"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface SessionSetupProps {
  onSessionStart: (userId: string) => void
}

export default function SessionSetup({ onSessionStart }: SessionSetupProps) {
  const [userName, setUserName] = useState("")
  const [avatarColor, setAvatarColor] = useState("emerald")
  const [isLoading, setIsLoading] = useState(false)

  const handleStart = async () => {
    if (!userName.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userName,
          avatarColor: avatarColor,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        onSessionStart(data.userId)
      }
    } catch (error) {
      console.error("Failed to create session:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const avatarColors = [
    { name: "emerald", label: "Verde", hex: "#7DE08D" },
    { name: "blue", label: "Azul", hex: "#081534" },
    { name: "teal", label: "Turquesa", hex: "#14B8A6" },
    { name: "violet", label: "Roxo", hex: "#8B5CF6" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-primary/20">
        <div className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Franca Assessoria</h1>
            <p className="text-muted-foreground">Virtual Office Platform</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Your Name</label>
            <Input
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleStart()}
              className="border-primary/20 focus:border-primary"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Avatar Color</label>
            <div className="grid grid-cols-2 gap-3">
              {avatarColors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setAvatarColor(color.name)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    avatarColor === color.name
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color.hex }} />
                    <span className="text-sm font-medium">{color.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleStart}
            disabled={!userName.trim() || isLoading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
          >
            {isLoading ? "Entering Office..." : "Enter Virtual Office"}
          </Button>
        </div>
      </Card>
    </div>
  )
}
