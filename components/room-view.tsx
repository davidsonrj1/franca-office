"use client"

import { useState, useRef, useEffect } from "react"
import DailyIframe from "@daily-co/daily-js" 
import MediaControls from "./media-controls"
import ChatPanel from "./chat-panel"

interface RoomViewProps {
  room: {
    id: string
    name: string
    icon: string
  }
  usersInRoom: string[]
  currentUserName: string
}

export default function RoomView({ room, usersInRoom, currentUserName }: RoomViewProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const callObject = useRef<any>(null)
  const [participants, setParticipants] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // O useEffect agora gerencia a conexão e desconexão da sala
  useEffect(() => {
    const initializeDailyCall = async () => {
      // Verifica se o elemento DOM já existe (deve existir agora após a correção no JSX)
      if (!containerRef.current) {
        console.error("[v0] Container DOM não encontrado.")
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // 1. Obter token para a sala
        const tokenResponse = await fetch("/api/daily-room", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            roomName: `franca-${room.id}`,
            // CORREÇÃO CRÍTICA: Envia o nome do usuário para o backend (para corrigir o Erro 500)
            userName: currentUserName 
          }),
        })

        // Se houver erro 500, cai aqui
        if (!tokenResponse.ok) {
          throw new Error("Erro ao obter token para a sala")
        }

        const { token, roomUrl } = await tokenResponse.json()

        // 2. Cria o objeto de chamada
        const call = DailyIframe.createCallObject({
          dailyJsVersion: ">=0.75.3",
        })

        callObject.current = call

        // 3. Listeners para atualizar a UI
        call.on("participants-changed", () => {
          setParticipants(Object.values(call.participants())) 
        })

        call.on("error", (error: any) => {
          console.error("[v0] Daily error:", error)
          setError("Erro na chamada. Tente novamente.")
        })

        // 4. Entrar na sala, ANEXANDO o vídeo ao container
        await call.join({
          url: roomUrl,
          token,
          userName: currentUserName,
          // CORREÇÃO ANTERIOR: Informa ao Daily qual elemento DOM usar
          parentEl: containerRef.current, 
        })
        
        // 5. Define o estado inicial de mic/camera
        await call.setLocalAudio(!isMuted);
        await call.setLocalVideo(!isCameraOff);

        setIsLoading(false)

      } catch (err) {
        console.error("[v0] Erro ao inicializar Daily:", err)
        setError("Erro ao conectar à sala. Verifique o console ou tente novamente.") 
        setIsLoading(false)
      }
    }

    initializeDailyCall()

    // 6. Cleanup function (Executa ao trocar de sala ou desmontar o componente)
    return () => {
      if (callObject.current) {
        callObject.current.leave() 
        // CRÍTICO: Destroi o objeto e limpa o DOM
        callObject.current.destroy() 
        callObject.current = null
        setParticipants([])
      }
    }
  }, [room.id, currentUserName, isMuted, isCameraOff]) 

  const handleToggleMute = async () => {
    if (callObject.current) {
      const newMutedState = !isMuted
      setIsMuted(newMutedState)
      await callObject.current.setLocalAudio(!newMutedState)
    }
  }

  const handleToggleCamera = async () => {
    if (callObject.current) {
      const newCameraState = !isCameraOff
      setIsCameraOff(newCameraState)
      await callObject.current.setLocalVideo(!newCameraState)
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Room Header */}
      <div className="bg-[#081534] text-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{room.icon}</span>
            <h2 className="text-xl font-bold">{room.name}</h2>
          </div>
          <div className="text-sm text-gray-300">
            {participants.length} {participants.length === 1 ? "pessoa" : "pessoas"} conectada
            {participants.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 p-6 overflow-hidden">
        {/* Video Container */}
        <div className="flex-1 flex flex-col gap-4 relative">
          
          {/* CORREÇÃO ESTRUTURAL: O contêiner com o 'ref' DEVE SER RENDERIZADO SEMPRE. 
              Classes de Tailwind como 'invisible' e 'absolute inset-0' 
              são usadas para esconder o elemento e permitir que o loading/erro apareçam por cima, 
              mas o elemento DOM continua existindo para o Daily.co. */}
          <div
            ref={containerRef}
            className={`bg-gray-100 rounded-lg p-4 flex-1 border-2 border-gray-200 overflow-hidden ${
                isLoading || error ? 'invisible absolute inset-0' : ''
            }`}
            style={{ minHeight: "400px" }}
          />

          {/* Feedback Visual: Carregando/Erro (renderizado condicionalmente) */}
          {isLoading && (
            <div className="bg-gray-100 rounded-lg p-4 flex-1 flex items-center justify-center border-2 border-gray-200 absolute inset-0">
              <div className="text-center">
                <div className="animate-spin text-4xl mb-4">⏳</div>
                <p className="text-gray-600 font-medium">Conectando à sala...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-100 rounded-lg p-4 flex-1 flex items-center justify-center border-2 border-red-300 absolute inset-0">
              <div className="text-center">
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Active Users */}
          <div className="bg-[#f0f8f5] rounded-lg p-4">
            <p className="text-sm font-semibold text-[#081534] mb-3">Pessoas na chamada:</p>
            <div className="flex flex-wrap gap-2">
              {participants.map((participant: any) => (
                <span
                  key={participant.session_id}
                  className="px-3 py-1 rounded-full text-sm font-medium bg-[#7DE08D] text-[#081534]"
                >
                  {participant.user_name || "Participante"}
                </span>
              ))}
            </div>
          </div>

          {/* Media Controls */}
          <MediaControls
            isMuted={isMuted}
            setIsMuted={handleToggleMute}
            isCameraOff={isCameraOff}
            setIsCameraOff={handleToggleCamera}
          />
        </div>

        {/* Chat Panel */}
        <ChatPanel roomId={room.id} currentUserName={currentUserName} />
      </div>
    </div>
  )
}
