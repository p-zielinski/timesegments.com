import { Injectable, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { LoggerService } from '../../common/logger/loger.service';
import { Note, Prisma, User } from '@prisma/client';
import { CheckControlValueGuard } from '../../common/check-control-value/checkControlValue.guard';
import { CategoryService } from '../category/category.service';

@Injectable()
export class NoteService {
  constructor(
    private prisma: PrismaService,
    private loggerService: LoggerService,
    private categoryService: CategoryService
  ) {}

  async createNote(
    text: string,
    userId: string,
    categoryId?: string
  ): Promise<{ success: boolean; error?: string; note?: Note }> {
    if (categoryId) {
      const categoryWithUser = await this.categoryService.findIfNotDeleted(
        categoryId,
        {
          user: true,
        }
      );
      if (!categoryWithUser || categoryWithUser?.user?.id !== userId) {
        return {
          success: false,
          error: `Category not found, bad request`,
        };
      }
    }
    const note = await this.prisma.note.create({
      data: {
        userId,
        text,
        categoryId,
      },
    });
    if (!note?.id) {
      return {
        success: false,
        error: `Could not create category`,
      };
    }
    return { success: true, note };
  }

  @UseGuards(CheckControlValueGuard)
  async updateNote(noteId: string, text: string, user: User) {
    const noteWithUser = await this.findOne(noteId, {
      user: true,
    });
    if (!noteWithUser || noteWithUser?.user?.id !== user.id) {
      return {
        success: false,
        error: `Note not found, bad request`,
      };
    }
    if (noteWithUser.text === text) {
      return { success: true, note: { ...noteWithUser, user: undefined } };
    }
    const updatedNote = await this.prisma.note.update({
      where: { id: noteId },
      data: { text },
    });
    if (updatedNote.text !== text) {
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
