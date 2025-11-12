import { kv } from "@vercel/kv"

export async function POST(request: Request) {
  const { action, room, userName } = await request.json()

  if (action === "join") {
    const key = `room:${room}`
    const users = await kv.smembers(key)

    if (!users.includes(userName)) {
      await kv.sadd(key, userName)
    }

    const updatedUsers = await kv.smembers(key)
    return Response.json({ users: updatedUsers })
  }

  if (action === "leave") {
    const key = `room:${room}`
    await kv.srem(key, userName)
    const updatedUsers = await kv.smembers(key)
    return Response.json({ users: updatedUsers })
  }

  if (action === "get-users") {
    const key = `room:${room}`
    const users = await kv.smembers(key)
    return Response.json({ users: users || [] })
  }

  return Response.json({ error: "Invalid action" }, { status: 400 })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const room = searchParams.get("room")

  if (!room) {
    return Response.json({ error: "Room required" }, { status: 400 })
  }

  const key = `room:${room}`
  const users = await kv.smembers(key)
  return Response.json({ users: users || [] })
}
