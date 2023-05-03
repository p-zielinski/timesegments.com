import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { LoggerService } from '../../common/logger/loger.service';

@Injectable()
export class NoteService {
  constructor(
    private prisma: PrismaService,
    private loggerService: LoggerService
  ) {}

  async create(note: string, userId: string) {
    return await this.prisma.note.create({
      data: {
        userId,
        note,
      },
    });
  }

  async getUsersAll(userId) {
    return await this.prisma.note.findMany({ where: { userId } });
  }
}
