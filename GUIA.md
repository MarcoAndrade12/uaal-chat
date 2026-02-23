# Guia do Sistema IA-Chat

Este guia explica como configurar e usar o novo sistema `ia-chat`.

## Configuração

1.  **Variáveis de Ambiente**:
    -   Copie `.env.example` para `.env` em `c:\Users\andra\Downloads\uaaldrive\ia-chat`.
    -   Preencha suas credenciais do PostgreSQL e a `GEMINI_API_KEY` (obtenha no Google AI Studio).

2.  **Dependências**:
    -   Execute `npm install` dentro da pasta `ia-chat` (já realizado).

3.  **Rodar a Aplicação**:
    -   Inicie o servidor de desenvolvimento: `npm run start:dev`

## Frontend (Interface Web)

Acesse o sistema pelo navegador em: `http://localhost:3000`

Selecione o perfil desejado:
-   **Cliente**: Inicia um chat com a IA.
-   **Atendente**: Visualiza conversas ativas e intervém.
-   **Admin**: Gerencia prompts e monitora conversas.

## Funcionalidades e Uso

### 1. Admin: Gerenciar Prompts
Use estes endpoints para definir o comportamento da IA.

-   **Criar Prompt**: `POST /prompts`
    ```json
    {
      "title": "Suporte Padrão",
      "content": "Você é um assistente de suporte útil da UaalDrive. Seja conciso.",
      "isActive": true
    }
    ```
-   **Listar Prompts**: `GET /prompts`

### 2. Chat: Cliente e IA
O chat opera via WebSocket (Socket.io) e HTTP.

-   **Criar Conversa**: `POST /chat/conversation`
    -   Corpo: `{ "clientId": "uuid-do-usuario" }`
    -   Retorna: `{ "id": "uuid-da-conversa", ... }`

-   **Conexão WebSocket**:
    -   Conecte em `http://localhost:3000` (ou sua porta).
    -   Evento `joinConversation`: `{ "conversationId": "..." }`
    -   Evento `sendMessage`:
        ```json
        {
          "conversationId": "...",
          "content": "Olá, preciso de ajuda",
          "sender": "client"
        }
        ```
    -   **Resposta da IA**: O servidor responderá automaticamente com um evento `message` onde `sender: "ai"`.

### 3. Intervenção do Atendente
Um atendente pode entrar na mesma sala e enviar mensagens.
-   Envie mensagem com `sender: "attendant"` via WebSocket.

### 4. Resumo
Gere um resumo de qualquer conversa.

-   **Obter Resumo**: `GET /summary/:conversationId`
    -   Retorna (exemplo): `{ "summary": "O usuário perguntou sobre X..." }`

## Banco de Dados
O sistema usa o mesmo banco de dados PostgreSQL do `uaaldrive-backend`.
-   Novas tabelas criadas: `chat_prompts`, `conversations`, `messages`.
-   É compatível com os `usuarios` existentes se você vincular (atualmente `clientId` é uma string, mas pode ser configurado como chave estrangeira `FK` para `usuarios`).
