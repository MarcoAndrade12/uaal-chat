
import { Controller, Post, Get, Body, Param, Delete } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversation')
  createConversation(@Body('clientId') clientId: string, @Body('clientName') clientName?: string) {
    return this.chatService.createConversation(clientId, clientName);
  }

  @Get('conversations')
  findAll() {
    return this.chatService.findAll();
  }

  @Get('conversation/:id')
  getConversation(@Param('id') id: string) {
    return this.chatService.findConversation(id);
  }

  @Post('message')
  sendMessage(
    @Body('conversationId') conversationId: string,
    @Body('content') content: string,
    @Body('sender') sender: 'attendant' | 'ai' | 'client',
  ) {
    return this.chatService.sendMessage(conversationId, content, sender);
  }

  @Delete('conversation/:clientId')
  async resetConversation(@Param('clientId') clientId: string) {
    await this.chatService.resetConversationByClientId(clientId);
    return { message: 'Conversation reset successfully' };
  }
}
