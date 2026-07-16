import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DuunitoriService } from '../scraper/duunitori/duunitori.service';
import { TyomarkkinatoriService } from '../scraper/tyomarkkinatori/tyomarkkinatori.service';
import { JoblyService } from '../scraper/jobly/jobly.service';
import { MatchingService } from '../matching/matching.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly duunitoriService: DuunitoriService,
    private readonly tyomarkkinatoriService: TyomarkkinatoriService,
    private readonly joblyService: JoblyService,
    private readonly matchingService: MatchingService,
    private readonly prisma: PrismaService,
  ) {}

  // Run Monday, Wednesday, Friday at 08:00
  @Cron('0 8 * * 1,3,5')
  async handleJobMarketAnalysis() {
    this.logger.log('Starting scheduled job market analysis...');

    try {
      // 1. Get all users and their preferences
      const users = await this.prisma.user.findMany({
        include: { preferences: true },
      });

      for (const user of users) {
        if (!user.preferences) continue;

        const { skills, locations } = user.preferences;
        
        // 2. Scrape jobs from all sources
        this.logger.log(`Scraping jobs for user ${user.email}...`);
        
        // We use a general search query based on skills, or a default one
        const searchQuery = skills[0] || 'developer';
        
        await Promise.all([
          this.duunitoriService.scrapeJobs(searchQuery, locations),
          this.tyomarkkinatoriService.scrapeJobs(searchQuery, locations),
          this.joblyService.scrapeJobs(searchQuery, locations),
        ]);

        // 3. Run matching and notifications
        this.logger.log(`Running matching and notifications for user ${user.email}...`);
        await this.matchingService.matchAllPendingJobs(user.id);
      }

      this.logger.log('Scheduled job market analysis completed successfully.');
    } catch (error) {
      this.logger.error(`Scheduled analysis failed: ${error.message}`);
    }
  }

  // Optional: A shorter interval for testing during development
  // @Cron(CronExpression.EVERY_HOUR)
  // async hourlyCheck() { ... }
}
