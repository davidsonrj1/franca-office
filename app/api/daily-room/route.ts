// app/api/daily-room/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

const DAILY_API_URL = "https://api.daily.co/v1";

async function ensureRoom(roomName: string, apiKey: string) {
  // tenta obter
  const getRes = await fetch(`${DAILY_API_URL}/rooms/${roomName}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: "no-store",
  });
  if (getRes.ok) return getRes.json();

  // cria se não existir
  const createRes = await fetch(`${DAILY_API_URL}/rooms`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: roomName,
      privacy: "private",
      properties: { enable_chat: true, enable_screenshare: true },
    }),
  });
  if (!createRes.ok) {
    const txt = await createRes.text();
    throw new Error(`DAILY_CREATE_ROOM_${createRes.status}: ${txt}`);
  }
  return createRes.json();
}

async function createToken(roomName: string, userName: string, apiKey: string) {
  const res = await fetch(`${DAILY_API_URL}/meeting-tokens`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        room_name: roomName,
        user_name: userName || "Convidado",
        is_owner: false,
      },
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`DAILY_TOKEN_${res.status}: ${txt}`);
  }
  const data = await res.json();
  return data.token as string;
}

// Util: extrai roomName/userName de POST JSON ou GET querystring
async function readParams(req: NextRequest) {
  if (req.method === "POST") {
    try {
      const { roomName, userName } = await req.json();
      return {
        roomName: String(roomName ?? "reunion"),
        userName: String(userName ?? "Convidado"),
      };
    } catch {
      // body inválido
      return { roomName: "reunion", userName: "Convidado" };
    }
  }
  // GET fallback: /api/daily-room?roomName=reunion&userName=Gabriel
  const sp = req.nextUrl.searchParams;
  return {
    roomName: String(sp.get("roomName") ?? "reunion"),
    userName: String(sp.get("userName") ?? "Convidado"),
  };
}

async function handler(req: NextRequest) {
  try {
    const apiKey = process.env.DAILY_API_KEY;
    const domain = process.env.NEXT_PUBLIC_DAILY_DOMAIN; // ex: francaassessoria.daily.co

    if (!apiKey || !domain) {
      console.error("ENV_MISSING", {
        hasDailyApiKey: Boolean(apiKey),
        domain,
      });
      return NextResponse.json(
        { error: "Faltam as variáveis DAILY_API_KEY ou NEXT_PUBLIC_DAILY_DOMAIN" },
        { status: 500 }
      );
    }

    const { roomName, userName } = await readParams(req);
    const safeRoom = roomName.replace(/[^a-z0-9-]/gi, "-").toLowerCase();

    const roomData = await ensureRoom(safeRoom, apiKey);
    const token = await createToken(roomData.name, userName, apiKey);

    return NextResponse.json({
      roomUrl: `https://${domain}/${roomData.name}`,
      token,
    });
  } catch (e: any) {
    console.error("[daily-room] ERROR:", e?.message || e);
    return NextResponse.json(
      { error: "Erro ao obter token para a sala", detail: e?.message ?? null },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return handler(req);
}
export async function GET(req: NextRequest) {
  return handler(req);
}
