import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { LoggerService } from '../../common/logger/loger.service';
import { Note, Prisma, User } from '@prisma/client';
import { CategoryService } from '../category/category.service';
import { ConfigService } from '@nestjs/config';
import { ControlValue } from '@test1/shared';

@Injectable()
export class NoteService {
  constructor(
    private prisma: PrismaService,
    private loggerService: LoggerService,
    private categoryService: CategoryService,
    private readonly configService: ConfigService
  ) {}

  async createNote(
    text: string,
    userId: string,
    categoryId?: string
  ): Promise<{
    success: boolean;
    error?: string;
    note?: Note;
    controlValues?: Record<ControlValue, string>;
  }> {
    if (categoryId) {
      const categoryWithUserAndNotes =
        await this.categoryService.findIfNotDeleted(categoryId, {
          user: true,
          notes: true,
        });
      if (
        !categoryWithUserAndNotes ||
        categoryWithUserAndNotes?.user?.id !== userId
      ) {
        return {
          success: false,
          error: `Category not found, bad request`,
        };
      }
      const categoriesNotesLimit = this.configService.get<number>(
        'MAX_NUMBER_OF_NOTES_PER_CATEGORY'
      );
      if (categoryWithUserAndNotes.notes.length >= categoriesNotesLimit) {
        return {
          success: false,
          error: `The limit of notes for this category was reached`,
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
    return {
      success: true,
      note,
    };
  }

  async updateNote(noteId: string, text: string, user: User) {
    const noteWithUserAndCategoryId = await this.findOne(noteId, {
      user: true,
      category: { select: { id: true } },
    });
    if (
      !noteWithUserAndCategoryId ||
      noteWithUserAndCategoryId?.user?.id !== user.id
    ) {
      return {
        success: false,
        error: `Note not found, bad request`,
      };
    }
    if (noteWithUserAndCategoryId.text === text) {
      return {
        success: true,
        note: { ...noteWithUserAndCategoryId, user: undefined },
      };
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
    return {
      success: true,
      note: updatedNote,
    };
  }

  async deleteNote(noteId: string, user: User) {
    const noteWithUserAndCategoryId = await this.findOne(noteId, {
      user: true,
      category: { select: { id: true } },
    });
    if (
      !noteWithUserAndCategoryId ||
      noteWithUserAndCategoryId?.user?.id !== user.id
    ) {
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
    return {
      success: true,
      note: deletedNote,
    };
  }

  //@todo delete this method
  async getUsersAll(userId) {
    return await this.prisma.note.findMany({ where: { userId } });
  }

  private async findOne(noteId: string, include: Prisma.NoteInclude = null) {
    return await this.prisma.note.findFirst({
      where: { id: noteId },
      include,
    });
  }
}
