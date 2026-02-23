
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateChatPromptDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
