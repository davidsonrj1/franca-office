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
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const credentials: Record<string, string> = {
    Gabriel: "gabriel@2025",
    Bruna: "bruna@2025",
    Leonardo: "leo@2025",
    Guilherme: "gui@2025",
    Davidson: "deivin@2025",
  }

  const users = Object.keys(credentials)

  const handleLogin = () => {
    if (!selectedName || !password) {
      setError("Selecione seu nome e digite a senha")
      return
    }

    const correctPassword = credentials[selectedName]
    if (password !== correctPassword) {
      setError("Senha incorreta")
      return
    }

    setError("")
    onStart(Math.random().toString(), selectedName)
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
              onChange={(e) => {
                setSelectedName(e.target.value)
                setPassword("")
                setError("")
              }}
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

          {selectedName && (
            <label className="block animate-in fade-in">
              <span className="text-sm font-semibold text-[#081534] mb-3 block">Digite sua senha:</span>
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError("")
                }}
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                className="w-full px-4 py-3 border-2 border-[#7DE08D] rounded-lg focus:outline-none focus:border-[#7DE08D] bg-white text-[#081534] font-medium"
              />
            </label>
          )}

          {error && <div className="bg-red-100 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>}

          <button
            onClick={handleLogin}
            disabled={!selectedName || !password}
            className="w-full bg-[#7DE08D] hover:bg-[#6fd87d] disabled:bg-gray-300 text-[#081534] font-bold py-3 rounded-lg transition-colors"
          >
            Entrar
          </button>
        </div>
      </div>
    </div>
  )
}
