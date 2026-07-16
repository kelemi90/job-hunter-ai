import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { ScraperModule } from '../scraper/scraper.module';
import { MatchingModule } from '../matching/matching.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ScraperModule,
    MatchingModule,
  ],
  providers: [SchedulerService],
})
export class SchedulerModule {}
