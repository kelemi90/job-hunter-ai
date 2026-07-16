import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { DiscordProvider } from './providers/discord.provider';

@Module({
  providers: [NotificationsService, DiscordProvider],
  exports: [NotificationsService],
})
export class NotificationsModule {}
