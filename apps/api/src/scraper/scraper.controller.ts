import { Controller, Get, Query } from '@nestjs/common';
import { DuunitoriService } from './duunitori/duunitori.service';
import { TyomarkkinatoriService } from './tyomarkkinatori/tyomarkkinatori.service';
import { JoblyService } from './jobly/jobly.service';

@Controller('scraper')
export class ScraperController {
  constructor(
    private readonly duunitoriService: DuunitoriService,
    private readonly tyomarkkinatoriService: TyomarkkinatoriService,
    private readonly joblyService: JoblyService,
  ) {}

  @Get('test-all')
  async testAll(
    @Query('q') q: string = 'developer',
    @Query('locations') locations: string = 'Oulu,Helsinki',
  ) {
    const locationList = locations.split(',');
    
    const duunitoriCount = await this.duunitoriService.scrapeJobs(q, locationList);
    const tyomarkkinatoriCount = await this.tyomarkkinatoriService.scrapeJobs(q, locationList);
    const joblyCount = await this.joblyService.scrapeJobs(q, locationList);

    return {
      message: 'Scrape completed for all sources',
      results: {
        duunitori: duunitoriCount,
        tyomarkkinatori: tyomarkkinatoriCount,
        jobly: joblyCount,
      },
    };
  }
}
