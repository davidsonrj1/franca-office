"use client"

import { useState, useEffect, useCallback } from "react"
import OfficeLayout from "@/components/office-layout"
import ChatPanel from "@/components/chat-panel"
import MediaControls from "@/components/media-controls"

interface User {
  id: string
  name: string
  x: number
  y: number
  avatarColor: string
}

interface VirtualOfficeProps {
  userId: string
}

export default function VirtualOffice({ userId }: VirtualOfficeProps) {
  const [users, setUsers] = useState<User[]>([])
  const [userPosition, setUserPosition] = useState({ x: 100, y: 100 })
  const [showChat, setShowChat] = useState(true)
  const [showMedia, setShowMedia] = useState(false)
  const [isMicOn, setIsMicOn] = useState(false)
  const [isCameraOn, setIsCameraOn] = useState(false)

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users")
        if (response.ok) {
          const data = await response.json()
          setUsers(data.users)
        }
      } catch (error) {
        console.error("Failed to fetch users:", error)
      }
    }

    fetchUsers()
    const interval = setInterval(fetchUsers, 2000) // Poll every 2 seconds
    return () => clearInterval(interval)
  }, [])

  // Update user position
  const handlePositionChange = useCallback(
    async (x: number, y: number) => {
      setUserPosition({ x, y })
      try {
        await fetch(`/api/users/${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ x, y }),
        })
      } catch (error) {
        console.error("Failed to update position:", error)
      }
    },
    [userId],
  )

  // Handle media controls
  const handleMicToggle = () => setIsMicOn(!isMicOn)
  const handleCameraToggle = () => setIsCameraOn(!isCameraOn)

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">Franca Assessoria</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMedia(!showMedia)}
              className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-sm font-medium"
            >
              {isMicOn || isCameraOn ? "Media On" : "Media Off"}
            </button>
            <button
              onClick={() => localStorage.removeItem("franca_user_id")}
              className="px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 text-sm font-medium"
            >
              Exit
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Office Area */}
        <div className="flex-1 flex flex-col">
          <OfficeLayout
            users={users}
            currentUserId={userId}
            userPosition={userPosition}
            onPositionChange={handlePositionChange}
          />
        </div>

        {/* Right Sidebar */}
        <div className="w-80 flex flex-col gap-4">
          {showChat && <ChatPanel userId={userId} users={users} />}
          {showMedia && (
            <MediaControls
              isMicOn={isMicOn}
              isCameraOn={isCameraOn}
              onMicToggle={handleMicToggle}
              onCameraToggle={handleCameraToggle}
            />
          )}
        </div>
      </div>
    </div>
  )
}
