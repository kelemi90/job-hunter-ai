import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class DiscordProvider {
  private readonly logger = new Logger(DiscordProvider.name);

  async sendNotification(webhookUrl: string, title: string, content: string, url: string, score: number) {
    try {
      await axios.post(webhookUrl, {
        embeds: [
          {
            title: `New Job Match: ${title}`,
            description: content,
            url: url,
            color: this.getColorForScore(score),
            fields: [
              {
                name: 'Match Score',
                value: `${score}/100`,
                inline: true,
              },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      });
    } catch (error) {
      this.logger.error(`Failed to send Discord notification: ${error.message}`);
    }
  }

  private getColorForScore(score: number): number {
    if (score >= 80) return 3066993; // Green
    if (score >= 50) return 15105570; // Orange
    return 15158332; // Red
  }
}
