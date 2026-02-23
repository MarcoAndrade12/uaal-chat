
import { PartialType } from '@nestjs/mapped-types'; // Note: You might need to install @nestjs/mapped-types if not present, or just duplicate fields
import { CreateChatPromptDto } from './create-chat-prompt.dto';

// Since I didn't install @nestjs/mapped-types explicitly, I'll use a simple extension or partial logic if I can.
// But PartialType is standard in NestJS mapped-types. I'll stick to manual if mapped-types is missing, but it usually comes with common.
// Wait, mapped-types is separate package: @nestjs/mapped-types. I installed common, core, etc.
// Let's check package.json if I have it. If not, I'll install it or just make fields optional manually.

import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateChatPromptDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
