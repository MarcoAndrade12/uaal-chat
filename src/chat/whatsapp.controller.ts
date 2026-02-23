import { Controller, Get, Post, Body, Query, Res, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';
import type { Response } from 'express';

@Controller('chat/whatsapp')
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
    if (mode === 'subscribe' && token === this.verifyToken) {
      this.logger.log('Webhook verified');
      return res.status(HttpStatus.OK).send(challenge);
    } else {
      this.logger.error('Webhook verification failed');
      return res.sendStatus(HttpStatus.FORBIDDEN);
    }
  }

  @Post('webhook')
  async handleWebhook(@Body() body: any, @Res() res: Response) {
    // Log body for debugging
    // this.logger.debug(`Received WhatsApp webhook: ${JSON.stringify(body)}`);

    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.value.messages) {
            for (const message of change.value.messages) {
              if (message.type === 'text') {
                const from = message.from; // Phone number
                const text = message.text.body;
                const contact = change.value.contacts?.[0];
                const senderName = contact?.profile?.name || 'WhatsApp User';

                this.logger.log(`Received message from ${from}: ${text}`);

                // Process conversation and AI response
                try {
                  // 1. Create or get conversation (clientId is the phone number)
                  const conversation = await this.chatService.createConversation(from, senderName);
                  
                  // 2. Save client message
                  await this.chatService.sendMessage(conversation.id, text, 'client');

                  // 3. Trigger AI response asnychronously
                  // We don't await this to respond to Meta quickly (avoid timeouts)
                  this.chatService.generateAIResponse(conversation.id);

                } catch (error) {
                  this.logger.error(`Error processing WhatsApp message: ${error.message}`);
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
