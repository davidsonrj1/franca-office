"use client"

import type React from "react"

import { useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"

interface User {
  id: string
  name: string
  x: number
  y: number
  avatarColor: string
}

interface OfficeLayoutProps {
  users: User[]
  currentUserId: string
  userPosition: { x: number; y: number }
  onPositionChange: (x: number, y: number) => void
}

export default function OfficeLayout({ users, currentUserId, userPosition, onPositionChange }: OfficeLayoutProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size to match container
    const container = containerRef.current
    if (container) {
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
    }

    // Clear canvas
    ctx.fillStyle = "#f0f8f5"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw office elements
    drawOfficeElements(ctx, canvas.width, canvas.height)

    // Draw users
    users.forEach((user) => {
      drawUser(ctx, user, user.id === currentUserId)
    })
  }, [users, currentUserId])

  const drawOfficeElements = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Meeting table (center area)
    ctx.fillStyle = "#e0e8e4"
    ctx.fillRect(width / 2 - 80, height / 2 - 40, 160, 80)
    ctx.strokeStyle = "#7de08d"
    ctx.lineWidth = 2
    ctx.strokeRect(width / 2 - 80, height / 2 - 40, 160, 80)

    // Workstations
    const workstations = [
      { x: 100, y: 80 },
      { x: width - 100, y: 80 },
      { x: 100, y: height - 80 },
      { x: width - 100, y: height - 80 },
      { x: width / 2, y: height - 100 },
    ]

    workstations.forEach((ws) => {
      ctx.fillStyle = "#e8f5f0"
      ctx.fillRect(ws.x - 40, ws.y - 30, 80, 60)
      ctx.strokeStyle = "#7de08d"
      ctx.lineWidth = 1.5
      ctx.strokeRect(ws.x - 40, ws.y - 30, 80, 60)
    })

    // Lounge area
    ctx.fillStyle = "#f0f8f5"
    ctx.fillRect(width - 200, 20, 180, 140)
    ctx.strokeStyle = "#b0d4c4"
    ctx.lineWidth = 1
    ctx.strokeRect(width - 200, 20, 180, 140)
    ctx.fillStyle = "#081534"
    ctx.font = "12px Poppins"
    ctx.fillText("Lounge", width - 180, 45)
  }

  const drawUser = (ctx: CanvasRenderingContext2D, user: User, isCurrent: boolean) => {
    // Draw avatar circle
    const colors: { [key: string]: string } = {
      emerald: "#7DE08D",
      blue: "#081534",
      teal: "#14B8A6",
      violet: "#8B5CF6",
    }

    ctx.fillStyle = colors[user.avatarColor] || "#7DE08D"
    ctx.beginPath()
    ctx.arc(user.x, user.y, 20, 0, Math.PI * 2)
    ctx.fill()

    // Draw border for current user
    if (isCurrent) {
      ctx.strokeStyle = "#081534"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(user.x, user.y, 20, 0, Math.PI * 2)
      ctx.stroke()
    }

    // Draw name
    ctx.fillStyle = "#081534"
    ctx.font = "bold 12px Poppins"
    ctx.textAlign = "center"
    ctx.fillText(user.name, user.x, user.y + 40)
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    onPositionChange(x, y)
  }

  return (
    <Card className="flex-1 border-primary/20 overflow-hidden">
      <div ref={containerRef} className="w-full h-full">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-full cursor-move"
          style={{ display: "block" }}
        />
      </div>
    </Card>
  )
}
