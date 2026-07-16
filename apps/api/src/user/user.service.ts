import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createOrUpdateUser(email: string, name?: string) {
    return this.prisma.user.upsert({
      where: { email },
      update: { name },
      create: { email, name },
    });
  }

  async updatePreferences(userId: string, preferences: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.prisma.jobPreference.upsert({
      where: { userId },
      update: preferences,
      create: {
        ...preferences,
        userId,
      },
    });
  }

  async getUserWithPreferences(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { preferences: true },
    });
  }
}
