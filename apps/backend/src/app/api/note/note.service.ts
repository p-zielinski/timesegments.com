import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { LoggerService } from '../../common/logger/loger.service';
import { User } from '@prisma/client';

@Injectable()
export class NoteService {
  constructor(
    private prisma: PrismaService,
    private loggerService: LoggerService
  ) {}

  async create(note: string, user: User) {
    return await this.prisma.note.create({
      data: {
        userId: user.id,
        note,
      },
    });
  }
}
