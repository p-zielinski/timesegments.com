import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class TimeLogService {
  constructor(private prisma: PrismaService) {}

  public async findFirstUsersNotEnded(userId: string) {
    return (
      await this.prisma.timeLog.findFirst({
        where: { userId, endedAt: null },
        select: { id: true },
      })
    )?.id;
  }

  public async setTimeLogAsEnded(id: string) {
    return await this.prisma.timeLog.update({
      where: { id },
      data: { endedAt: new Date() },
    });
  }

  public async createNew(
    userId: string,
    categoryId?: string,
    subcategoryId?: string
  ) {
    return await this.prisma.timeLog.create({
      data: { userId, categoryId, subcategoryId },
    });
  }
}
