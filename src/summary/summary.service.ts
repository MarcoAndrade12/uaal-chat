
import { Injectable, Logger } from '@nestjs/common';
import { ChatService } from '../chat/chat.service';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class SummaryService {
  private genAI: GoogleGenerativeAI;
  private readonly logger = new Logger(SummaryService.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async generateSummary(conversationId: string) {
    const messages = await this.chatService.getMessages(conversationId);
    if (!messages || messages.length === 0) {
      return { summary: 'No messages to summarize.' };
    }

    const transcript = messages
      .map((msg) => `${msg.sender}: ${msg.content}`)
      .join('\n');

    if (!this.genAI) {
      return { summary: 'Gemini API not configured.' };
    }

    // Models confirmed available in models.txt
    const modelsToTry = ["gemini-2.0-flash", "gemini-flash-latest", "gemini-pro-latest", "gemini-2.0-flash-lite"];

    for (const modelName of modelsToTry) {
        try {
            const model = this.genAI.getGenerativeModel({ model: modelName });
            const prompt = `Summarize the following conversation between a client and an AI (or attendant). Highlight key points and any resolution.\n\n${transcript}`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return { summary: text };
        } catch (error) {
            this.logger.warn(`Failed to generate summary with model ${modelName}: ${error.message}`);
        }
    }
    
    this.logger.error('All Gemini models failed to generate summary.');
    throw new Error('Failed to generate summary with all available models.');
  }
}
