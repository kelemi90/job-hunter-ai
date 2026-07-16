import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DiscordProvider } from './providers/discord.provider';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly discordProvider: DiscordProvider,
  ) {}

  async notifyJobMatch(jobTitle: string, company: string, url: string, score: number, explanation: string) {
    const discordWebhook = this.configService.get<string>('DISCORD_WEBHOOK_URL');
    
    if (discordWebhook) {
      const content = `**Company:** ${company}\n\n**Reasoning:**\n${explanation}`;
      await this.discordProvider.sendNotification(discordWebhook, jobTitle, content, url, score);
    } else {
      this.logger.warn('No Discord webhook configured, skipping notification');
    }
    
    // Future: Add Telegram, Email, etc.
  }
}
