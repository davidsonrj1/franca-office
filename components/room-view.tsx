// components/room-view.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import DailyIframe, {
  DailyCall,
  DailyParticipant,
  DailyEventObjectParticipantsUpdated,
  DailyEventObjectTrackStarted,
  DailyEventObjectTrackStopped,
} from "@daily-co/daily-js";
import MediaControls from "./media-controls";
import ChatPanel from "./chat-panel";

interface RoomViewProps {
  room: { id: string; name: string; icon: string };
  usersInRoom: string[];
  currentUserName: string;
}

type PMap = Record<string, DailyParticipant>;

export default function RoomView({
  room,
  usersInRoom,
  currentUserName,
}: RoomViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callRef = useRef<DailyCall | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [participants, setParticipants] = useState<PMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // refs para os <video> por participante
  const videoEls = useRef<Record<string, HTMLVideoElement | null>>({});
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  // util para anexar track de vídeo em um <video>
  const attachVideo = useCallback(
    (videoEl: HTMLVideoElement | null, p: DailyParticipant) => {
      if (!videoEl) return;
      const t =
        p.tracks.video?.persistentTrack ||
        (p.tracks.video?.track as MediaStreamTrack | null);

      // Quando a câmera está off, não há track "live"
      if (!t || t.readyState !== "live") {
        videoEl.srcObject = null;
        return;
      }
      const ms = new MediaStream([t]);
      if (videoEl.srcObject !== ms) {
        videoEl.srcObject = ms;
      }
      videoEl.play().catch(() => {});
    },
    []
  );

  // Atualiza o estado de participantes e reanexa videos
  const refreshParticipants = useCallback(() => {
    const call = callRef.current;
    if (!call) return;
    const ps = call.participants();
    setParticipants(ps);

    // local
    const local = ps.local;
    if (localVideoRef.current) attachVideo(localVideoRef.current, local);

    // remotos
    Object.values(ps)
      .filter((p) => p.session_id && !p.local)
      .forEach((p) => {
        const el = videoEls.current[p.session_id!];
        if (el) attachVideo(el, p);
      });
  }, [attachVideo]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!containerRef.current) return;

      try {
        setIsLoading(true);
        setError(null);

        // 1) pega token + roomUrl
        const resp = await fetch("/api/daily-room", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomName: `franca-${room.id}`,
            userName: currentUserName,
          }),
        });
        if (!resp.ok) throw new Error("Erro ao obter token para a sala");
        const { token, roomUrl } = await resp.json();

        // 2) cria CallObject (sem UI automática)
        const call = DailyIframe.createCallObject();
        callRef.current = call;

        // 3) eventos importantes
        const onParticipants = (ev: DailyEventObjectParticipantsUpdated) => {
          refreshParticipants();
        };
        const onTrackStarted = (ev: DailyEventObjectTrackStarted) => {
          refreshParticipants();
        };
        const onTrackStopped = (ev: DailyEventObjectTrackStopped) => {
          refreshParticipants();
        };
        const onError = (e: any) => {
          console.error("[daily] error", e);
          setError("Erro na chamada");
        };

        call.on("participants-updated", onParticipants);
        call.on("participant-joined", onParticipants as any);
        call.on("participant-updated", onParticipants as any);
        call.on("participant-left", onParticipants as any);
        call.on("track-started", onTrackStarted);
        call.on("track-stopped", onTrackStopped);
        call.on("error", onError);
        call.on("camera-error", onError);

        // 4) entra na sala
        await call.join({ url: roomUrl, token, userName: currentUserName });

        // 5) define estados iniciais
        await call.setLocalAudio(!isMuted);
        await call.setLocalVideo(!isCameraOff);

        // 6) popula participantes e anexa vídeos
        if (mounted) {
          refreshParticipants();
          setIsLoading(false);
        }
      } catch (e) {
        console.error("[v0] Erro ao inicializar Daily:", e);
        if (mounted) {
          setError(
            "Erro ao conectar à sala. Verifique o console ou tente novamente."
          );
          setIsLoading(false);
        }
      }
    };

    init();

    // cleanup
    return () => {
      mounted = false;
      try {
        const call = callRef.current;
        if (call) {
          call.leave();
          call.destroy();
        }
      } catch {}
      callRef.current = null;
      setParticipants({});
    };
  }, [room.id, currentUserName]); // não inclua isMuted/isCameraOff aqui para evitar rejoin

  // aplicar mute/câmera
  const handleToggleMute = async () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (callRef.current) {
      await callRef.current.setLocalAudio(!newMuted);
    }
  };

  const handleToggleCamera = async () => {
    const newCamOff = !isCameraOff;
    setIsCameraOff(newCamOff);
    if (callRef.current) {
      await callRef.current.setLocalVideo(!newCamOff);
      // reanexa local (track pode ter mudado)
      const local = callRef.current.participants().local;
      attachVideo(localVideoRef.current!, local);
    }
  };

  // render helpers
  const remoteParticipants = Object.values(participants).filter(
    (p) => p.session_id && !p.local
  );

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="bg-[#081534] text-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{room.icon}</span>
            <h2 className="text-xl font-bold">{room.name}</h2>
          </div>
          <div className="text-sm text-gray-300">
            {Object.keys(participants).length}{" "}
            {Object.keys(participants).length === 1 ? "pessoa" : "pessoas"}{" "}
            conectada
            {Object.keys(participants).length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 p-6 overflow-hidden">
        {/* Video area */}
        <div className="flex-1 flex flex-col gap-4 relative" ref={containerRef}>
          {/* Grade de vídeos */}
          <div
            className="bg-gray-100 rounded-lg p-4 border-2 border-gray-200 overflow-hidden"
            style={{ minHeight: 400 }}
          >
            {isLoading && !error && (
              <div className="w-full h-[360px] flex items-center justify-center text-gray-600">
                Conectando à sala...
              </div>
            )}

            {error && (
              <div className="w-full h-[360px] flex items-center justify-center text-red-600">
                {error}
              </div>
            )}

            {!isLoading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* local */}
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    ref={(el) => {
                      localVideoRef.current = el;
                      const local = participants.local;
                      if (el && local) attachVideo(el, local);
                    }}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-[240px] object-cover bg-black"
                  />
                  <span className="absolute bottom-2 left-2 text-xs px-2 py-1 rounded bg-white/70 text-black">
                    Você
                  </span>
                </div>

                {/* remotos */}
                {remoteParticipants.map((p) => (
                  <div
                    key={p.session_id}
                    className="relative bg-black rounded-lg overflow-hidden"
                  >
                    <video
                      ref={(el) => {
                        videoEls.current[p.session_id!] = el;
                        if (el) attachVideo(el, p);
                      }}
                      autoPlay
                      playsInline
                      className="w-full h-[240px] object-cover bg-black"
                    />
                    <span className="absolute bottom-2 left-2 text-xs px-2 py-1 rounded bg-white/70 text-black">
                      {p.user_name || "Participante"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lista de nomes */}
          <div className="bg-[#f0f8f5] rounded-lg p-4">
            <p className="text-sm font-semibold text-[#081534] mb-3">
              Pessoas na chamada:
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.values(participants).map((p) => (
                <span
                  key={p.session_id || "local"}
                  className="px-3 py-1 rounded-full text-sm font-medium bg-[#7DE08D] text-[#081534]"
                >
                  {p.local ? "Você" : p.user_name || "Participante"}
                </span>
              ))}
            </div>
          </div>

          {/* Controles */}
          <MediaControls
            isMuted={isMuted}
            setIsMuted={handleToggleMute}
            isCameraOff={isCameraOff}
            setIsCameraOff={handleToggleCamera}
          />
        </div>

        {/* Chat */}
        <ChatPanel roomId={room.id} currentUserName={currentUserName} />
      </div>
    </div>
  );
}
