import { Module } from '@nestjs/common';
import { DuunitoriService } from './duunitori/duunitori.service';
import { TyomarkkinatoriService } from './tyomarkkinatori/tyomarkkinatori.service';
import { JoblyService } from './jobly/jobly.service';
import { ScraperController } from './scraper.controller';

@Module({
  controllers: [ScraperController],
  providers: [DuunitoriService, TyomarkkinatoriService, JoblyService],
  exports: [DuunitoriService, TyomarkkinatoriService, JoblyService],
})
export class ScraperModule {}
