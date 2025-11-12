import { kv } from "@vercel/kv"

export async function POST(request: Request) {
  const { room, userName, text } = await request.json()

  const messageKey = `chat:${room}:messages`
  const message = {
    id: Math.random().toString(),
    userName,
    text,
    timestamp: Date.now(),
  }

  await kv.lpush(messageKey, JSON.stringify(message))
  await kv.ltrim(messageKey, 0, 49)

  const messages = await kv.lrange(messageKey, 0, -1)
  const parsedMessages = messages.map((m) => JSON.parse(m as string))

  return Response.json({ messages: parsedMessages.reverse() })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const room = searchParams.get("room")

  if (!room) {
    return Response.json({ error: "Room required" }, { status: 400 })
  }

  const messageKey = `chat:${room}:messages`
  const messages = await kv.lrange(messageKey, 0, -1)
  const parsedMessages = messages.map((m) => JSON.parse(m as string))

  return Response.json({ messages: parsedMessages.reverse() })
}
