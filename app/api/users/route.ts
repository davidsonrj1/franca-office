import { type NextRequest, NextResponse } from "next/server"

// In-memory storage (use database in production)
const users = new Map()
const userPositions = new Map()

export async function POST(request: NextRequest) {
  const body = await request.json()
  const userId = Date.now().toString()

  users.set(userId, {
    id: userId,
    name: body.name,
    avatarColor: body.avatarColor,
  })

  userPositions.set(userId, { x: Math.random() * 800 + 100, y: Math.random() * 400 + 100 })

  return NextResponse.json({
    userId,
    user: users.get(userId),
  })
}

export async function GET() {
  const userList = Array.from(users.values()).map((user) => ({
    ...user,
    ...userPositions.get(user.id),
  }))

  return NextResponse.json({ users: userList })
}
