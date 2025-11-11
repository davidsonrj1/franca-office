import { type NextRequest, NextResponse } from "next/server"

// Note: This would be in a shared module in production
const userPositions = new Map()

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()

  userPositions.set(id, { x: body.x, y: body.y })

  return NextResponse.json({ success: true })
}
