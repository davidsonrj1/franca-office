"use client"

import { useState, useEffect } from "react"
import RoomList from "./room-list"
import RoomView from "./room-view"

const ROOMS = [
  { id: "gabriel", name: "Sala do Gabriel", icon: "👤" },
  { id: "bruna", name: "Sala da Bruna", icon: "👤" },
  { id: "leonardo", name: "Sala do Leonardo", icon: "👤" },
  { id: "guilherme", name: "Sala do Guilherme", icon: "👤" },
  { id: "davidson", name: "Sala do Davidson", icon: "👤" },
  { id: "reunion", name: "Sala de Reunião da Equipe", icon: "👥" },
]

export default function CommunicationHub({
  userId,
  userName,
  onLogout,
}: {
  userId: string
  userName: string
  onLogout: () => void
}) {
  const [currentRoom, setCurrentRoom] = useState("reunion")
  const [usersInRooms, setUsersInRooms] = useState<Record<string, string[]>>({
    gabriel: [],
    bruna: [],
    leonardo: [],
    guilherme: [],
    davidson: [],
    reunion: [],
  })
  const [lastUpdate, setLastUpdate] = useState(0)

  useEffect(() => {
    const syncUsers = async () => {
      try {
        const updates: Record<string, string[]> = {}
        for (const room of ROOMS) {
          const response = await fetch(`/api/sync-room?room=${room.id}`)
          const data = await response.json()
          updates[room.id] = data.users || []
        }
        setUsersInRooms(updates)
      } catch (error) {
        console.log("[v0] Erro ao sincronizar usuários:", error)
      }
    }

    syncUsers()
    const interval = setInterval(syncUsers, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleJoinRoom = async (roomId: string) => {
    // Remove do Redis
    try {
      await fetch("/api/sync-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "leave",
          room: currentRoom,
          userName,
        }),
      })

      // Adiciona à nova sala
      await fetch("/api/sync-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "join",
          room: roomId,
          userName,
        }),
      })
    } catch (error) {
      console.log("[v0] Erro ao trocar de sala:", error)
    }

    setCurrentRoom(roomId)
    setLastUpdate(Date.now())
  }

  // Quando montar, adicionar usuário à sala padrão
  useEffect(() => {
    handleJoinRoom(currentRoom)
  }, [])

  const currentRoomData = ROOMS.find((r) => r.id === currentRoom)
  const usersInCurrentRoom = usersInRooms[currentRoom] || []

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#081534] text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Franca Assessoria</h1>
          <p className="text-sm text-gray-300">Bem-vindo, {userName}</p>
        </div>
        <button
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium text-sm"
        >
          Sair
        </button>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar - Room List */}
        <RoomList rooms={ROOMS} usersInRooms={usersInRooms} currentRoom={currentRoom} onJoinRoom={handleJoinRoom} />

        {/* Main Content - Room View */}
        {currentRoomData && (
          <RoomView room={currentRoomData} usersInRoom={usersInCurrentRoom} currentUserName={userName} />
        )}
      </div>
    </div>
  )
}
