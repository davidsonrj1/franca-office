import { NextResponse } from "next/server"

const DAILY_API_KEY = process.env.DAILY_API_KEY
const DAILY_API_URL = "https://api.daily.co/v1"

export async function POST(request: Request) {
  try {
    const { roomName } = await request.json()

    if (!DAILY_API_KEY) {
      return NextResponse.json({ error: "API key não configurada" }, { status: 500 })
    }

    const response = await fetch(`${DAILY_API_URL}/meeting-tokens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          user_name: "user",
        },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("[v0] Daily API erro:", error)
      return NextResponse.json({ error: "Erro ao criar token" }, { status: 500 })
    }

    const data = await response.json()
    return NextResponse.json({
      token: data.token,
      roomUrl: `https://${roomName}.daily.co`,
    })
  } catch (error) {
    console.error("[v0] Erro ao criar token Daily:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
