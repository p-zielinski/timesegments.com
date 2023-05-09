import { Injectable, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { LoggerService } from '../../common/logger/loger.service';
import { Prisma, User } from '@prisma/client';
import { CheckControlValueGuard } from '../../common/check-control-value/checkControlValue.guard';

@Injectable()
export class NoteService {
  constructor(
    private prisma: PrismaService,
    private loggerService: LoggerService
  ) {}

  async createNote(note: string, favorite: boolean, userId: string) {
    return await this.prisma.note.create({
      data: {
        userId,
        note,
        favorite,
      },
    });
  }

  @UseGuards(CheckControlValueGuard)
  async updateNote(
    noteId: string,
    note: string,
    favorite: boolean,
    user: User
  ) {
    const noteWithUser = await this.findOne(noteId, {
      user: true,
    });
    if (!noteWithUser || noteWithUser?.user?.id !== user.id) {
      return {
        success: false,
        error: `Note not found, bad request`,
      };
    }
    const updatedNote = await this.prisma.note.update({
      where: { id: noteId },
      data: { note, favorite },
    });
    if (updatedNote.favorite !== favorite || updatedNote.note !== note) {
      return {
        success: false,
        error: `Could not update note`,
      };
    }
    return { success: true, note: updatedNote };
  }

  @UseGuards(CheckControlValueGuard)
  async deleteNote(noteId: string, user: User) {
    const noteWithUser = await this.findOne(noteId, {
      user: true,
    });
    if (!noteWithUser || noteWithUser?.user?.id !== user.id) {
      return {
        success: false,
        error: `Note not found, bad request`,
      };
    }
    const deletedNote = await this.prisma.note.delete({
      where: { id: noteId },
    });
    if (deletedNote.id !== noteId) {
      return {
        success: false,
        error: `Could not delete note`,
      };
    }
    return { success: true, note: deletedNote };
  }

  async getUsersAll(userId) {
    return await this.prisma.note.findMany({ where: { userId } });
  }

  private async findOne(
    noteId: string,
    include: Prisma.CategoryInclude = null
  ) {
    return await this.prisma.note.findFirst({
      where: { id: noteId },
      include,
    });
  }
}
