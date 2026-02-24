# Guia do Sistema IA-Chat (WhatsApp Edition)

Este guia explica como configurar e usar o sistema `ia-chat` integrado à API oficial do WhatsApp da Meta.

## Configuração para Produção (Render.com)

1.  **Variáveis de Ambiente**:
    Configure as seguintes variáveis no painel do Render:
    -   `DATABASE_URL`: URL de conexão do PostgreSQL (com SSL ativado).
    -   `GEMINI_API_KEY`: Sua chave do Google Gemini.
    -   `WHATSAPP_ACCESS_TOKEN`: Token de acesso permanente da Meta.
    -   `WHATSAPP_PHONE_NUMBER_ID`: ID do número de telefone comercial.
    -   `WHATSAPP_VERIFY_TOKEN`: Token para validação do webhook (ex: `mchat-uaal_te5te-Marco$1201`).

2.  **Configuração do Webhook na Meta**:
    -   **Callback URL**: `https://seu-app.onrender.com/webhook`
    -   **Verify Token**: O mesmo definido em `WHATSAPP_VERIFY_TOKEN`.
    -   **Campos**: Inscreva-se em `messages`.

## Fluxo de Uso

### 1. Interação do Cliente
Tudo acontece via WhatsApp. Quando o cliente envia uma mensagem:
-   O sistema identifica o número de telefone.
-   Cria ou recupera uma conversa automática.
-   A IA Gemini responde diretamente no WhatsApp do cliente.

### 2. Painel de Atendimento (HTTP API)
Você pode usar a API para gerenciar as conversas ou intervir como humano.

-   **Listar Conversas**: `GET /chat/conversations`
-   **Ver Mensagens**: `GET /chat/conversation/:id`
-   **Responder Manualmente**: `POST /chat/message`
    ```json
    {
      "conversationId": "uuid-da-conversa",
      "content": "Olá, sou um atendente humano. Como posso ajudar?",
      "sender": "attendant"
    }
    ```
    *Nota: Ao enviar como `attendant`, a IA será desativada para esta conversa automaticamente.*

### 3. Resumos de Conversa
-   **Obter Resumo**: `GET /summary/:conversationId`
    -   Gera um resumo inteligente usando IA sobre os pontos principais do atendimento.

### 4. Gestão de Prompts (Comportamento da IA)
-   **Atualizar Regras**: `POST /prompts`
    -   Aqui você define como a IA deve se comportar (ex: "Seja um vendedor cortês").

## Comandos Úteis
-   `npm run build`: Compila o projeto.
-   `npm start`: Inicia o servidor em produção (usado pelo Render).
-   `node test-whatsapp.js`: Script local para simular o recebimento de mensagens.
