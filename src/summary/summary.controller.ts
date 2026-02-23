
import { Controller, Get, Param } from '@nestjs/common';
import { SummaryService } from './summary.service';

@Controller('summary')
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  @Get(':conversationId')
  getSummary(@Param('conversationId') conversationId: string) {
    return this.summaryService.generateSummary(conversationId);
  }
}
