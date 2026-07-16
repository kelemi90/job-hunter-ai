import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';
import { DuunitoriResponse, DuunitoriJob } from './duunitori.types';

@Injectable()
export class DuunitoriService {
  private readonly logger = new Logger(DuunitoriService.name);
  private readonly baseUrl = 'https://duunitori.fi/api/v1/jobentries';

  constructor(private readonly prisma: PrismaService) {}

  async scrapeJobs(searchQuery: string, locations: string[]): Promise<number> {
    this.logger.log(`Starting scrape for query: "${searchQuery}" in locations: ${locations.join(', ')}`);
    
    let url = `${this.baseUrl}?search=${encodeURIComponent(searchQuery)}&format=json`;
    for (const location of locations) {
      url += `&alue=${encodeURIComponent(location)}`;
    }

    let savedCount = 0;
    let nextUrl: string | null = url;

    try {
      while (nextUrl) {
        this.logger.debug(`Fetching: ${nextUrl}`);
        const response = await axios.get<DuunitoriResponse>(nextUrl);
        const { results, next } = response.data;

        for (const job of results) {
          const saved = await this.saveJob(job);
          if (saved) savedCount++;
        }

        nextUrl = next;
        // Optional: Add a small delay to be respectful to the API
        if (nextUrl) await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      this.logger.error(`Failed to scrape Duunitori: ${error.message}`, error.stack);
      throw error;
    }

    this.logger.log(`Scrape finished. Saved ${savedCount} new jobs.`);
    return savedCount;
  }

  private async saveJob(job: DuunitoriJob): Promise<boolean> {
    try {
      const existingJob = await this.prisma.jobPosting.findUnique({
        where: { externalId: job.slug },
      });

      if (existingJob) {
        return false;
      }

      await this.prisma.jobPosting.create({
        data: {
          externalId: job.slug,
          source: 'Duunitori',
          title: job.heading,
          companyName: job.company_name,
          location: job.municipality_name,
          description: job.descr,
          url: `https://duunitori.fi/tyopaikat/tyo/${job.slug}`,
          publishedAt: new Date(job.date_posted),
        },
      });

      return true;
    } catch (error) {
      this.logger.error(`Failed to save job ${job.slug}: ${error.message}`);
      return false;
    }
  }
}
