"use client"

import { useState, useEffect } from "react"
import CommunicationHub from "@/components/communication-hub"

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    const storedUserId = localStorage.getItem("franca_user_id")
    const storedUserName = localStorage.getItem("franca_user_name")
    if (storedUserId && storedUserName) {
      setUserId(storedUserId)
      setUserName(storedUserName)
    }
  }, [])

  const handleStart = (id: string, name: string) => {
    localStorage.setItem("franca_user_id", id)
    localStorage.setItem("franca_user_name", name)
    setUserId(id)
    setUserName(name)
  }

  const handleLogout = () => {
    localStorage.removeItem("franca_user_id")
    localStorage.removeItem("franca_user_name")
    setUserId(null)
    setUserName(null)
  }

  if (!userId || !userName) {
    return <LoginScreen onStart={handleStart} />
  }

  return <CommunicationHub userId={userId} userName={userName} onLogout={handleLogout} />
}

function LoginScreen({ onStart }: { onStart: (id: string, name: string) => void }) {
  const [selectedName, setSelectedName] = useState("")

  const users = ["Gabriel", "Bruna", "Leonardo", "Guilherme", "Davidson"]

  const handleLogin = () => {
    if (selectedName) {
      onStart(Math.random().toString(), selectedName)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#081534] mb-2">Franca Assessoria</h1>
          <p className="text-gray-600">Hub de Comunicação</p>
        </div>

        <div className="bg-[#f0f8f5] rounded-lg p-6 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-[#081534] mb-3 block">Selecione seu nome:</span>
            <select
              value={selectedName}
              onChange={(e) => setSelectedName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[#7DE08D] rounded-lg focus:outline-none focus:border-[#7DE08D] bg-white text-[#081534] font-medium"
            >
              <option value="">Escolha um nome</option>
              {users.map((user) => (
                <option key={user} value={user}>
                  {user}
                </option>
              ))}
            </select>
          </label>

          <button
            onClick={handleLogin}
            disabled={!selectedName}
            className="w-full bg-[#7DE08D] hover:bg-[#6fd87d] disabled:bg-gray-300 text-[#081534] font-bold py-3 rounded-lg transition-colors"
          >
            Entrar
          </button>
        </div>
      </div>
    </div>
  )
}
