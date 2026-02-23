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
      this.logger.error('WhatsApp credentials are not configured');
      return false;
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to,
          type: 'text',
          text: { body: text },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        this.logger.error(`Error sending WhatsApp message: ${JSON.stringify(data)}`);
        return false;
      }

      this.logger.log(`WhatsApp message sent to ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp message: ${error.message}`);
      return false;
    }
  }
}
