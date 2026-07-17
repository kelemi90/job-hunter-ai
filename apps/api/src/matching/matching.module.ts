import { Module } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { AiMatchingService } from './ai-matching.service';
import { OllamaMatchingService } from './ollama-matching.service';
import { MatchingController } from './matching.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  providers: [MatchingService, AiMatchingService, OllamaMatchingService],
  controllers: [MatchingController],
  exports: [MatchingService],
})
export class MatchingModule {}
