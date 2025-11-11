// app/api/daily-room/route.ts

import { NextResponse } from "next/server"

// Certifique-se de que DAILY_API_KEY está configurado em .env.local
const DAILY_API_KEY = process.env.DAILY_API_KEY
const DAILY_API_URL = "https://api.daily.co/v1"
// Corrigido para usar o domínio da Franca Assessoria (se for esse)
const DAILY_DOMAIN = "https://francaassessoria.daily.co" 

export async function POST(request: Request) {
  try {
    // CORREÇÃO CRÍTICA: Agora o backend espera receber roomName E userName
    const { roomName, userName } = await request.json() 

    if (!DAILY_API_KEY) {
      return NextResponse.json({ error: "API key do Daily não configurada" }, { status: 500 })
    }

    const response = await fetch(`${DAILY_API_URL}/meeting-tokens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // A chave de API é crucial para a autenticação
        Authorization: `Bearer ${DAILY_API_KEY}`, 
      },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          // CORREÇÃO CRÍTICA: Usa o nome de usuário real
          user_name: userName, 
        },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      // É crucial logar a resposta de erro do Daily para ajudar na depuração
      console.error("[v0] Daily API error:", response.status, error) 
      return NextResponse.json({ error: "Erro ao criar token: Verifique o console do backend." }, { status: 500 })
    }

    const data = await response.json()
    
    // Constrói a URL completa da sala para o frontend
    const roomUrl = `${DAILY_DOMAIN}/${roomName}`

    return NextResponse.json({
      token: data.token,
      roomUrl: roomUrl,
    })
  } catch (error) {
    console.error("[v0] Erro geral ao criar token Daily:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
