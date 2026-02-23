import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { PromptsModule } from '../prompts/prompts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message]),
    PromptsModule,
  ],
  providers: [ChatService, WhatsappService],
  controllers: [ChatController, WhatsappController],
  exports: [ChatService],
})
export class ChatModule {}
