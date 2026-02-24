import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly accessToken: string;
  private readonly phoneNumberId: string;
  private readonly apiUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.accessToken = this.configService.get<string>('WHATSAPP_ACCESS_TOKEN') || '';
    this.phoneNumberId = this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID') || '';
    this.apiUrl = `https://graph.facebook.com/v22.0/${this.phoneNumberId}/messages`;
  }

  async sendMessage(to: string, text: string): Promise<boolean> {
    if (!this.accessToken || !this.phoneNumberId) {
      this.logger.error('WhatsApp credentials are not configured (check WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID)');
      return false;
    }

    // Sanitize: remove any non-numeric characters (like + or spaces)
    const cleanTo = to.replace(/\D/g, '');

    try {
      this.logger.log(`Tentando enviar mensagem via WhatsApp para ${cleanTo}...`);
      
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanTo,
        type: 'text',
        text: { body: text },
      };

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        this.logger.error(`Error sending WhatsApp message to ${cleanTo}: Status ${response.status} - ${JSON.stringify(data)}`);
        // Check for specific common errors
        if (data.error?.code === 100) {
            this.logger.warn('Dica: Verifique se o número do ID do Telefone (Phone Number ID) está correto e se o destinatário é permitido (se for conta de teste).');
        } else if (data.error?.code === 190) {
            this.logger.warn('Dica: O seu Token de Acesso (WHATSAPP_ACCESS_TOKEN) pode ter expirado ou incorreto.');
        }
        return false;
      }

      this.logger.log(`WhatsApp message sent successfully to ${cleanTo}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp message: ${error.message}`);
      return false;
    }
  }
}
