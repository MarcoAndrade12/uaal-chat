import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { PromptsService } from '../prompts/prompts.service';
import { WhatsappService } from './whatsapp.service';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class ChatService {
  private genAI: GoogleGenerativeAI;
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private promptsService: PromptsService,
    private configService: ConfigService,
    private whatsappService: WhatsappService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    } else {
        this.logger.warn('GEMINI_API_KEY not found in configuration');
    }
  }

  async createConversation(clientId: string, clientName?: string): Promise<Conversation> {
    // Check if active conversation exists
    const existing = await this.conversationRepository.findOne({
      where: { clientId, status: 'active' },
    });
    if (existing) {
        // Update name if provided and missing
        if (clientName && !existing.clientName) {
            existing.clientName = clientName;
            return this.conversationRepository.save(existing);
        }
        return existing;
    }

    const conversation = this.conversationRepository.create({
      clientId,
      clientName,
      status: 'active',
    });
    return this.conversationRepository.save(conversation);
  }

  async findAll() {
    return this.conversationRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findConversation(id: string) {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
      relations: ['messages'],
      order: {
        messages: {
          createdAt: {
             direction: 'ASC',
          }
        } as any,
      },
    });
    if (conversation && conversation.messages) {
        conversation.messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }
    
    if (!conversation) {
      throw new NotFoundException(`Conversation #${id} not found`);
    }
    return conversation;
  }

  async sendMessage(conversationId: string, content: string, sender: 'client' | 'ai' | 'attendant') {
    const conversation = await this.findConversation(conversationId);
    
    const message = this.messageRepository.create({
      conversation,
      content,
      sender,
    });
    
    // If attendant sends a message, disable AI
    if (sender === 'attendant') {
        conversation.isAiEnabled = false;
        await this.conversationRepository.save(conversation);
    }

    const savedMessage = await this.messageRepository.save(message);
    return savedMessage;
  }

  async getMessages(conversationId: string) {
    const conversation = await this.findConversation(conversationId);
    return conversation.messages;
  }

  async generateAIResponse(conversationId: string): Promise<Message | null> {
    if (!this.genAI) {
        this.logger.warn('Google Gemini not initialized');
        return null;
    }

    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['messages'],
    });

    if (!conversation || !conversation.isAiEnabled) return null; // Stop if disabled

    // Find active prompt
    const promptConfig = await this.promptsService.findActive();
    let systemInstruction = promptConfig ? promptConfig.content : 'You are a helpful assistant.';

    // Inject Client Name if available
    if (conversation.clientName) {
        systemInstruction = systemInstruction.replace(/\[NOME DO CLIENTE\]/g, conversation.clientName);
        // Also append a generic instruction to use the name
        systemInstruction += `\n\nO nome do cliente é: ${conversation.clientName}. Use-o sempre que possível.`;
    }

    // Construct history for Gemini
    // Note: Gemini API handles history slightly differently (user/model roles)
    // We'll limit history to last few turns to avoid token limits if needed, or pass full history if small.
    // Simplifying: we'll use generateContent with system instruction + history context in prompt or chatSession
    
    // Models confirmed available in models.txt
    const modelsToTry = ["gemini-2.0-flash", "gemini-flash-latest", "gemini-pro-latest", "gemini-2.0-flash-lite"];
    
    for (const modelName of modelsToTry) {
        try {
            const model = this.genAI.getGenerativeModel({ model: modelName });
            
            // Construct the full prompt context including history
            let fullPrompt = `${systemInstruction}\n\n`;
            conversation.messages.forEach(msg => {
                const role = msg.sender === 'client' ? 'User' : (msg.sender === 'ai' ? 'Model' : 'System');
                fullPrompt += `${role}: ${msg.content}\n`;
            });
            fullPrompt += `Model: `;

            const result = await model.generateContent(fullPrompt);
            const response = await result.response;
            const text = response.text();

            if (text) {
                const aiMsg = await this.sendMessage(conversationId, text, 'ai');
                // Send via WhatsApp
                await this.whatsappService.sendMessage(conversation.clientId, text);
                return aiMsg;
            }
        } catch (error) {
            this.logger.warn(`Failed to generate content with model ${modelName}: ${error.message}`);
            // Continue to next model
        }
    }
    
    this.logger.error('All Gemini models failed to generate response.');
    return null;
  }
}
