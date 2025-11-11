"use client"

interface MediaControlsProps {
  isMuted: boolean
  setIsMuted: (value: boolean | (() => boolean)) => void | Promise<void>
  isCameraOff: boolean
  setIsCameraOff: (value: boolean | (() => boolean)) => void | Promise<void>
}

export default function MediaControls({ isMuted, setIsMuted, isCameraOff, setIsCameraOff }: MediaControlsProps) {
  const handleMuteClick = async () => {
    const result = setIsMuted((prev) => !prev)
    if (result instanceof Promise) {
      await result
    }
  }

  const handleCameraClick = async () => {
    const result = setIsCameraOff((prev) => !prev)
    if (result instanceof Promise) {
      await result
    }
  }

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-4 space-y-3">
      <p className="text-xs font-semibold text-[#081534] uppercase tracking-wide">Controles</p>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleMuteClick}
          className={`py-3 px-3 rounded-lg font-semibold transition-colors text-sm ${
            isMuted
              ? "bg-red-100 text-red-600 border-2 border-red-300"
              : "bg-[#7DE08D] text-[#081534] border-2 border-[#7DE08D] hover:bg-[#6fd87d]"
          }`}
        >
          {isMuted ? "Silenciado" : "Microfone"}
        </button>

        <button
          onClick={handleCameraClick}
          className={`py-3 px-3 rounded-lg font-semibold transition-colors text-sm ${
            isCameraOff
              ? "bg-red-100 text-red-600 border-2 border-red-300"
              : "bg-[#7DE08D] text-[#081534] border-2 border-[#7DE08D] hover:bg-[#6fd87d]"
          }`}
        >
          {isCameraOff ? "Câmera Off" : "Câmera"}
        </button>
      </div>

      <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
        {isMuted && <p>✓ Microfone desligado</p>}
        {isCameraOff && <p>✓ Câmera desligada</p>}
        {!isMuted && !isCameraOff && <p>✓ Câmera e microfone ligados</p>}
      </div>
    </div>
  )
}
