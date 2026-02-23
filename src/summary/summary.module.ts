
import { Module } from '@nestjs/common';
import { SummaryService } from './summary.service';
import { SummaryController } from './summary.controller';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [ChatModule],
  controllers: [SummaryController],
  providers: [SummaryService],
})
export class SummaryModule {}
