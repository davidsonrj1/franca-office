// ✅ app/api/daily-room/route.ts
export const runtime = "nodejs"; // fundamental para acessar process.env

import { NextRequest, NextResponse } from "next/server";

const DAILY_API_URL = "https://api.daily.co/v1";

/**
 * Cria uma sala no Daily caso ainda não exista
 */
async function ensureRoom(roomName: string, apiKey: string) {
  const getRes = await fetch(`${DAILY_API_URL}/rooms/${roomName}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: "no-store",
  });

  if (getRes.ok) {
    const data = await getRes.json();
    return data;
  }

  // Se não existir, cria uma nova sala privada
  const createRes = await fetch(`${DAILY_API_URL}/rooms`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: roomName,
      privacy: "private",
      properties: {
        enable_chat: true,
        enable_screenshare: true,
      },
    }),
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(`Falha ao criar sala (${createRes.status}): ${errorText}`);
  }

  const data = await createRes.json();
  return data;
}

/**
 * Gera um token de acesso à sala Daily
 */
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
    const errorText = await res.text();
    throw new Error(`Falha ao gerar token (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return data.token;
}

/**
 * Endpoint principal (POST /api/daily-room)
 */
export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.DAILY_API_KEY;
    const domain = process.env.NEXT_PUBLIC_DAILY_DOMAIN;

    if (!apiKey || !domain) {
      console.error("❌ Variáveis de ambiente ausentes", {
        hasKey: !!apiKey,
        domain,
      });
      return NextResponse.json(
        { error: "Faltam as variáveis DAILY_API_KEY ou NEXT_PUBLIC_DAILY_DOMAIN" },
        { status: 500 }
      );
    }

    const { roomName, userName } = await req.json();
    if (!roomName) {
      return NextResponse.json({ error: "roomName é obrigatório" }, { status: 400 });
    }

    // Garante que a sala existe no Daily
    const room = await ensureRoom(roomName, apiKey);

    // Gera o token para o usuário
    const token = await createToken(room.name, userName || "Convidado", apiKey);

    const roomUrl = `https://${domain}/${room.name}`;

    return NextResponse.json({
      token,
      roomUrl,
    });
  } catch (err: any) {
    console.error("[Daily API] Erro:", err?.message || err);
    return NextResponse.json(
      { error: "Erro ao obter token para a sala." },
      { status: 500 }
    );
  }
}
