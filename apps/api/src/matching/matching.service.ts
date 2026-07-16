import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JobPosting, JobPreference } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { AiMatchingService } from './ai-matching.service';

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly aiMatchingService: AiMatchingService,
  ) {}

  async matchAllPendingJobs(userId: string) {
    const preferences = await this.prisma.jobPreference.findUnique({
      where: { userId },
    });

    if (!preferences) {
      this.logger.warn(`No preferences found for user ${userId}`);
      return;
    }

    // Find jobs that haven't been matched for this user yet
    const unmatchedJobs = await this.prisma.jobPosting.findMany({
      where: {
        matches: {
          none: { userId },
        },
      },
    });

    this.logger.log(`Matching ${unmatchedJobs.length} jobs for user ${userId}`);

    for (const job of unmatchedJobs) {
      await this.calculateAndSaveMatch(job, preferences);
    }
  }

  private async calculateAndSaveMatch(job: JobPosting, preferences: JobPreference) {
    let score = 0;
    const matchReasons: string[] = [];

    // 1. Skill Matching
    const description = (job.description || '').toLowerCase();
    const title = job.title.toLowerCase();

    for (const skill of preferences.skills) {
      const skillLower = skill.toLowerCase();
      if (title.includes(skillLower) || description.includes(skillLower)) {
        // Higher weight for skills in title
        const points = title.includes(skillLower) ? 10 : 5;
        score += points;
        matchReasons.push(`Matched skill: ${skill} (+${points})`);
      }
    }

    // 2. Location Matching
    if (job.location) {
      const jobLocation = job.location.toLowerCase();
      const preferredLocation = preferences.locations.find(loc => 
        jobLocation.includes(loc.toLowerCase())
      );
      if (preferredLocation) {
        score += 10;
        matchReasons.push(`Preferred location: ${preferredLocation} (+10)`);
      }
    }

    // 3. Remote Work
    if (description.includes('remote') || description.includes('etätyö')) {
      score += 5;
      matchReasons.push('Remote work mentioned (+5)');
    }

    // 4. Seniority Check (Simple keyword check)
    const isSeniorJob = title.includes('senior') || title.includes('lead') || title.includes('sr.');
    const wantsSenior = preferences.seniorityLevel?.toLowerCase().includes('senior');
    
    if (isSeniorJob && !wantsSenior) {
      score -= 10;
      matchReasons.push('Senior role mismatch (-10)');
    }

    // 5. AI Analysis (Deeper check)
    let aiExplanation = '';
    const aiResult = await this.aiMatchingService.analyzeMatch(
      job.title,
      job.description || '',
      preferences.skills,
      preferences,
    );

    if (aiResult) {
      // Average the deterministic score with AI score for a more balanced result
      score = Math.round((score + aiResult.score) / 2);
      aiExplanation = `\n\n**AI Analysis:**\n${aiResult.explanation}\n\n**Pros:** ${aiResult.pros.join(', ')}\n**Cons:** ${aiResult.cons.join(', ')}`;
    }

    // Save the match
    const match = await this.prisma.jobMatch.create({
      data: {
        jobId: job.id,
        userId: preferences.userId,
        score,
        explanation: matchReasons.join('\n') + aiExplanation,
      },
    });

    // Trigger notification for high scores (e.g., > 40)
    if (score >= 40) {
      await this.notificationsService.notifyJobMatch(
        job.title,
        job.companyName,
        job.url,
        score,
        matchReasons.join('\n') + aiExplanation,
      );
    }
  }
}
