"use client"

import { useState, useEffect, useRef } from "react"

interface Message {
  id: string
  userName: string
  text: string
  timestamp: number
}

interface ChatPanelProps {
  roomId: string
  currentUserName: string
}

export default function ChatPanel({ roomId, currentUserName }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const syncMessages = async () => {
      try {
        const response = await fetch(`/api/chat-message?room=${roomId}`)
        const data = await response.json()
        setMessages(data.messages || [])
      } catch (error) {
        console.log("[v0] Erro ao sincronizar mensagens:", error)
      }
    }

    syncMessages()
    const interval = setInterval(syncMessages, 2000)
    return () => clearInterval(interval)
  }, [roomId])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputText.trim()) return

    try {
      await fetch("/api/chat-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room: roomId,
          userName: currentUserName,
          text: inputText,
        }),
      })
      setInputText("")
    } catch (error) {
      console.log("[v0] Erro ao enviar mensagem:", error)
    }
  }

  return (
    <div className="w-80 bg-[#f0f8f5] border-l border-[#e0e8e4] rounded-lg flex flex-col overflow-hidden">
      {/* Chat Header */}
      <div className="bg-[#081534] text-white px-4 py-3 border-b border-[#e0e8e4]">
        <h3 className="font-bold text-sm">Chat</h3>
        <p className="text-xs text-gray-300 mt-1">Sala: {roomId}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            <p>Nenhuma mensagem ainda</p>
            <p className="text-xs mt-2">Seja o primeiro a conversar!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#081534]">{msg.userName}</span>
                <span className="text-xs text-gray-500">
                  {new Date(msg.timestamp).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="bg-white rounded-lg p-3 text-sm text-[#081534] border-l-4 border-[#7DE08D]">
                {msg.text}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[#e0e8e4] space-y-2 bg-white">
        <input
          type="text"
          placeholder="Digite uma mensagem..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          className="w-full px-3 py-2 border-2 border-[#e0e8e4] rounded-lg focus:outline-none focus:border-[#7DE08D] text-sm placeholder-gray-400"
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputText.trim()}
          className="w-full bg-[#7DE08D] hover:bg-[#6fd87d] disabled:bg-gray-300 text-[#081534] font-bold py-2 rounded-lg transition-colors text-sm"
        >
          Enviar
        </button>
      </div>
    </div>
  )
}
