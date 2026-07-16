import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiMatchingService {
  private readonly logger = new Logger(AiMatchingService.name);
  private readonly openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async analyzeMatch(jobTitle: string, jobDescription: string, userSkills: string[], preferences: any) {
    if (!this.openai) {
      this.logger.warn('OpenAI API key not configured, skipping AI analysis');
      return null;
    }

    try {
      const prompt = `
        Analyze the match between a job posting and a candidate's profile.
        
        Job Title: ${jobTitle}
        Job Description: ${jobDescription.substring(0, 2000)} // Truncate to save tokens
        
        Candidate CV Content: ${preferences.cvText ? preferences.cvText.substring(0, 4000) : 'Not provided'}
        Candidate Skills: ${userSkills.join(', ')}
        Candidate Preferences: ${JSON.stringify(this.anonymizePreferences(preferences))}
        
        Provide a response in JSON format:
        {
          "score": number (0-100),
          "explanation": "string (a concise explanation of why it matches or doesn't)",
          "pros": ["string"],
          "cons": ["string"]
        }
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content;
      return content ? JSON.parse(content) : null;
    } catch (error) {
      this.logger.error(`AI Analysis failed: ${error.message}`);
      return null;
    }
  }

  private anonymizePreferences(preferences: any): any {
    // Create a copy to avoid modifying the original object
    const sanitizedPreferences = { ...preferences };

    // Remove any potentially sensitive or unnecessary fields
    delete sanitizedPreferences.id;
    delete sanitizedPreferences.userId;
    delete sanitizedPreferences.cvText; // Remove from JSON to avoid redundancy and save tokens
    delete sanitizedPreferences.createdAt;
    delete sanitizedPreferences.updatedAt;
    // Add any other fields that should not be sent to OpenAI

    return sanitizedPreferences;
  }
}
