import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';
import { TyomarkkinatoriResponse, TyomarkkinatoriJob } from './tyomarkkinatori.types';

@Injectable()
export class TyomarkkinatoriService {
  private readonly logger = new Logger(TyomarkkinatoriService.name);
  // Using the public search endpoint which doesn't require KIPA subscription for basic search
  private readonly baseUrl = 'https://paikat.te-palvelut.fi/tpt-api/tyopaikat';

  constructor(private readonly prisma: PrismaService) {}

  async scrapeJobs(searchQuery: string, locations: string[]): Promise<number> {
    this.logger.log(`Starting Työmarkkinatori scrape for: "${searchQuery}"`);
    
    let savedCount = 0;

    try {
      // The public API uses different parameters than the P67 interface
      for (const location of locations) {
        const url = `${this.baseUrl}?hakusana=${encodeURIComponent(searchQuery)}&kunta=${encodeURIComponent(location)}&ilmoitettuPvm=1`;
        
        this.logger.debug(`Fetching Työmarkkinatori: ${url}`);
        const response = await axios.get(url);
        
        // Handle both possible structures (direct array or wrapped)
        const jobs = Array.isArray(response.data) ? response.data : response.data.results || [];

        for (const job of jobs) {
          const saved = await this.saveJob(job);
          if (saved) savedCount++;
        }
      }
    } catch (error) {
      this.logger.error(`Failed to scrape Työmarkkinatori: ${error.message}`);
    }

    return savedCount;
  }

  private async saveJob(job: any): Promise<boolean> {
    try {
      // Normalize field names from TE-palvelut API
      const externalId = job.id || job.ilmoitusnumero;
      const title = job.otsikko || job.title;
      const companyName = job.tyonantajanNimi || job.employerName;
      const location = job.kunnat ? job.kunnat.join(', ') : job.municipality;
      const description = job.kuvaus || job.description;
      const url = job.linkki || `https://tyomarkkinatori.fi/henkiloasiakkaat/avoimet-tyopaikat/${externalId}`;
      const publishedAt = job.julkaisuaika ? new Date(job.julkaisuaika) : new Date();

      const existingJob = await this.prisma.jobPosting.findUnique({
        where: { externalId: String(externalId) },
      });

      if (existingJob) return false;

      await this.prisma.jobPosting.create({
        data: {
          externalId: String(externalId),
          source: 'Tyomarkkinatori',
          title,
          companyName,
          location,
          description,
          url,
          publishedAt,
        },
      });

      return true;
    } catch (error) {
      this.logger.error(`Failed to save Työmarkkinatori job: ${error.message}`);
      return false;
    }
  }
}
