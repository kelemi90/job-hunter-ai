import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Ollama } from 'ollama';

@Injectable()
export class OllamaMatchingService implements OnModuleInit {
  private readonly logger = new Logger(OllamaMatchingService.name);
  private ollama: Ollama;
  private modelName: string;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('OLLAMA_HOST') || 'http://localhost:11434';
    this.modelName = this.configService.get<string>('OLLAMA_MODEL') || 'llama3.1';
    this.ollama = new Ollama({ host });
    this.logger.log(`Ollama Matching Service initialized with host: ${host} and model: ${this.modelName}`);
  }

  async analyzeMatch(jobTitle: string, jobDescription: string, userSkills: string[], preferences: any) {
    try {
      const prompt = `
        Analyze the match between a job posting and a candidate's profile.
        
        Job Title: ${jobTitle}
        Job Description: ${jobDescription.substring(0, 2000)}
        
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
        
        IMPORTANT: Return ONLY the JSON object. No other text.
      `;

      const response = await this.ollama.generate({
        model: this.modelName,
        prompt: prompt,
        format: 'json',
        stream: false,
      });

      return JSON.parse(response.response);
    } catch (error) {
      this.logger.error(`Error during Ollama analysis: ${error.message}`);
      return null;
    }
  }

  private anonymizePreferences(preferences: any): any {
    const sanitizedPreferences = { ...preferences };
    delete sanitizedPreferences.id;
    delete sanitizedPreferences.userId;
    delete sanitizedPreferences.cvText;
    delete sanitizedPreferences.createdAt;
    delete sanitizedPreferences.updatedAt;
    return sanitizedPreferences;
  }
}
