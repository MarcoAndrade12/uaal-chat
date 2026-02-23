import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PromptsService } from './prompts.service';
import { CreateChatPromptDto } from './dto/create-chat-prompt.dto';
import { UpdateChatPromptDto } from './dto/update-chat-prompt.dto';

@Controller('prompts')
export class PromptsController {
  constructor(private readonly promptsService: PromptsService) {}

  @Post()
  create(@Body() createChatPromptDto: CreateChatPromptDto) {
    return this.promptsService.create(createChatPromptDto);
  }

  @Get()
  findAll() {
    return this.promptsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.promptsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChatPromptDto: UpdateChatPromptDto) {
    return this.promptsService.update(id, updateChatPromptDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.promptsService.remove(id);
  }
}
