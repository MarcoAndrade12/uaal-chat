import { Controller, Get, Post, Body, Query, Res, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';
import type { Response } from 'express';

@Controller()
export class WhatsappController {
  private readonly logger = new Logger(WhatsappController.name);
  private readonly verifyToken: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly chatService: ChatService,
  ) {
    this.verifyToken = this.configService.get<string>('WHATSAPP_VERIFY_TOKEN') || '';
  }

  @Get('webhook')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    this.logger.log(`Webhook verification attempt: mode=${mode}, token=${token}`);

    if (mode === 'subscribe' && token === this.verifyToken) {
      this.logger.log('Webhook verified successfully');
      // Importante: Enviar o challenge como texto puro
      return res.status(HttpStatus.OK).set('Content-Type', 'text/plain').send(challenge);
    } else {
      this.logger.warn(`Webhook verification failed. Expected token: ${this.verifyToken}`);
      return res.sendStatus(HttpStatus.FORBIDDEN);
    }
  }

  @Post('webhook')
  async handleWebhook(@Body() body: any, @Res() res: Response) {
    if (body.object === 'whatsapp_business_account') {
      if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages) {
        for (const entry of body.entry) {
          for (const change of entry.changes) {
            const value = change.value;
            if (value.messages) {
              for (const message of value.messages) {
                const from = message.from; // Número do cliente
                const contact = value.contacts?.[0];
                const senderName = contact?.profile?.name || 'WhatsApp User';
                
                let text = '';
                if (message.type === 'text') {
                  text = message.text.body;
                } else {
                  text = `[Mídia/Outro recebido: ${message.type}]`;
                }

                this.logger.log(`Mensagem recebida de ${from}: ${text}`);

                try {
                  // AQUI está a lógica solicitada:
                  
                  // 1. Salvar no Banco (PostgreSQL)
                  // Primeiramente criamos/obtemos a conversa usando o número do WhatsApp como clientId
                  const conversation = await this.chatService.createConversation(from, senderName);
                  
                  // Depois salvamos a mensagem do cliente no banco
                  await this.chatService.sendMessage(conversation.id, text, 'client');

                  // 2. Chamar a IA se o status for 'IA' (isAiEnabled no nosso sistema)
                  // generateAIResponse já verifica internamente se conversation.isAiEnabled é true
                  if (conversation.isAiEnabled) {
                    this.logger.log(`Acionando resposta da IA para ${from}`);
                    this.chatService.generateAIResponse(conversation.id);
                  } else {
                    this.logger.log(`IA desativada para a conversa ${conversation.id}. Aguardando humano.`);
                  }

                } catch (error) {
                  this.logger.error(`Erro ao processar mensagem do WhatsApp: ${error.message}`);
                }
              }
            }
          }
        }
      }
      return res.sendStatus(HttpStatus.OK);
    }

    return res.sendStatus(HttpStatus.NOT_FOUND);
  }
}
