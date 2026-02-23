import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromptsService } from './prompts.service';
import { PromptsController } from './prompts.controller';
import { ChatPrompt } from './entities/chat-prompt.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatPrompt])],
  providers: [PromptsService],
  controllers: [PromptsController],
  exports: [PromptsService], // Export if needed by ChatModule
})
export class PromptsModule {}
