# 💻 FRANCA ASSESSORIA | HUB DE COMUNICAÇÃO 

Este projeto implementa uma plataforma de escritório virtual simplificada e leve, focada estritamente em comunicação em tempo real (Voz, Vídeo e Chat) para a equipe da Franca Assessoria.

A plataforma foi desenvolvida com foco em alta performance e na identidade visual da marca, atendendo ao requisito de ser uma alternativa mais simples e funcional que soluções como o Gather.town.

---

## ✨ FUNCIONALIDADES PRINCIPAIS

| Funcionalidade | Status | Detalhes |
| :--- | :--- | :--- |
| **Salas Dedicadas** | ✅ Implementado | 6 salas persistentes: 5 individuais (Gabriel, Bruna, Leonardo, Guilherme, Davidson) e 1 Sala de Reunião da Equipe. |
| **Comunicação em Tempo Real** | ✅ Implementado | Integração com Daily.co (WebRTC) para áudio e vídeo de baixa latência. |
| **Controles de Mídia** | ✅ Implementado | Botões de Microfone e Câmera 100% funcionais para controle local. |
| **Chat de Texto** | ✅ Implementado | Chat de texto específico para a sala ativa, com histórico em memória. |
| **Design Leve** | ✅ Implementado | Interface moderna, sem avatares ou mapas 2D pesados, priorizando velocidade. |
| **Identidade Visual** | ✅ Implementado | Uso das cores oficiais da Franca Assessoria (Verde e Azul Escuro). |

---

## 🎨 IDENTIDADE VISUAL

O design segue o Manual de Identidade Visual (MIV) da Franca Assessoria.

| Elemento | Cor | Código HEX |
| :--- | :--- | :--- |
| **Destaque / Interação** | Verde Principal | `#7DE08D` |
| **Textos / Header** | Azul Escuro | `#081534` |
| **Fundo** | Branco / Cinza Claro | `#FFFFFF` / `#f0f8f5` |

---

## ⚙️ CONFIGURAÇÃO E TECNOLOGIAS

O projeto foi construído utilizando o framework Next.js.

### Tecnologias

* **Frontend:** React (Next.js), TypeScript.
* **Estilização:** Tailwind CSS (com tema customizado para a Franca Assessoria).
* **Comunicação:** Daily.co (via `daily-js`) para WebRTC.

### Variáveis de Ambiente

O projeto requer uma chave de API para o serviço de WebRTC.

| Variável | Uso | Status de Configuração |
| :--- | :--- | :--- |
| `DAILY_API_KEY` | Chave de API secreta para o Daily.co. | **✅ Configurado (Diretamente no v0 / Vercel)** |

### Detalhes de Conexão

* **Domínio Daily.co:** `https://francaassessoria.daily.co`
* **Endpoint de Token:** `/api/daily-room` (O backend gera um *token* para a sala específica e retorna a `roomUrl` correta).

---

## 🚀 INSTRUÇÕES PARA DESENVOLVIMENTO

### Instalação

```bash
# Instalar dependências (usando pnpm ou npm/yarn)
pnpm install
# ou
npm install
