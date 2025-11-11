import { type NextRequest, NextResponse } from "next/server"

// In-memory message storage
const messages: any[] = []

export async function POST(request: NextRequest) {
  const body = await request.json()

  const message = {
    id: Date.now().toString(),
    userId: body.userId,
    userName: body.userName,
    text: body.text,
    timestamp: Date.now(),
  }

  messages.push(message)

  // Keep only last 50 messages
  if (messages.length > 50) {
    messages.shift()
  }

  return NextResponse.json({ message })
}

export async function GET() {
  return NextResponse.json({ messages })
}
