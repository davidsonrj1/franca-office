"use client"

interface Room {
  id: string
  name: string
  icon: string
}

interface RoomListProps {
  rooms: Room[]
  usersInRooms: Record<string, string[]>
  currentRoom: string
  onJoinRoom: (roomId: string) => void
}

export default function RoomList({ rooms, usersInRooms, currentRoom, onJoinRoom }: RoomListProps) {
  return (
    <div className="w-72 bg-[#f0f8f5] border-r border-[#e0e8e4] p-4 overflow-y-auto">
      <h2 className="text-lg font-bold text-[#081534] mb-6">Salas Disponíveis</h2>

      <div className="space-y-2">
        {rooms.map((room) => {
          const usersCount = (usersInRooms[room.id] || []).length
          const isActive = currentRoom === room.id

          return (
            <button
              key={room.id}
              onClick={() => onJoinRoom(room.id)}
              className={`w-full p-4 rounded-lg text-left transition-colors border-2 ${
                isActive
                  ? "bg-[#7DE08D] border-[#7DE08D] text-[#081534] font-semibold"
                  : "bg-white border-gray-200 text-[#081534] hover:border-[#7DE08D]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{room.icon}</span>
                  <div>
                    <p className="font-semibold text-sm">{room.name}</p>
                    <p className="text-xs opacity-70">
                      {usersCount} {usersCount === 1 ? "pessoa" : "pessoas"}
                    </p>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
