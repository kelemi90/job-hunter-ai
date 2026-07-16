import { Controller, Post, Get, Param, Query } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('matching')
export class MatchingController {
  constructor(
    private readonly matchingService: MatchingService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('run/:userId')
  async runMatching(@Param('userId') userId: string) {
    await this.matchingService.matchAllPendingJobs(userId);
    return { message: 'Matching process completed' };
  }

  @Get('results/:userId')
  async getResults(
    @Param('userId') userId: string,
    @Query('minScore') minScore: string = '0',
  ) {
    return this.prisma.jobMatch.findMany({
      where: {
        userId,
        score: { gte: parseInt(minScore, 10) },
      },
      include: {
        job: true,
      },
      orderBy: {
        score: 'desc',
      },
    });
  }
}
