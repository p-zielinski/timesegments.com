import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class TimeLogService {
  constructor(private prisma: PrismaService) {
    (async () => {
      const date = '2023-01-29';

      console.log(
        await prisma.timeLog.findMany({
          where: {
            createdAt: {
              gte: new Date('2023-01-29').toISOString(),
              lte: new Date('2023-01-30'),
            },
          },
        })
      );
    })();
  }

  public async findFirstTimeLogWhereNotEnded(userId: string) {
    return await this.prisma.timeLog.findFirst({
      where: { userId, endedAt: null },
    });
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
