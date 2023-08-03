import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ConfigService } from '@nestjs/config';
import { Category, Prisma, TimeLog, User } from '@prisma/client';
import { TimeLogService } from '../time-log/time-log.service';
import { ControlValue } from '@test1/shared';

@Injectable()
export class CategoryService {
  constructor(
    private prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly timeLogService: TimeLogService
  ) {}

  public async updateCategoryShowRecentNotes(
    categoryId: string,
    showRecentNotes: boolean,
    user: User
  ): Promise<{
    success: boolean;
    error?: string;
    category?: Category;
    controlValues?: Record<ControlValue, string>;
  }> {
    const categoryWithUser = await this.findIfNotDeleted(categoryId, {
      user: true,
    });
    if (!categoryWithUser || categoryWithUser?.user?.id !== user.id) {
      return {
        success: false,
        error: `Category not found, bad request`,
      };
    }
    if (categoryWithUser.showRecentNotes === showRecentNotes) {
      return {
        success: true,
        category: { ...categoryWithUser, user: undefined } as Category,
      };
    }
    const updatedCategory = await this.updateShowRecentNotes(
      categoryId,
      showRecentNotes
    );
    if (updatedCategory.showRecentNotes !== showRecentNotes) {
      return {
        success: false,
        error: `Could not update expandSubcategories`,
      };
    }
    return {
      success: true,
      category: updatedCategory,
    };
  }

  public async createCategory(
    user: User,
    name: string,
    color: string
  ): Promise<{
    success: boolean;
    error?: string;
    category?: Category;
    controlValues?: Record<ControlValue, string>;
  }> {
    if (
      (await this.countUserCategories(user.id)) >
      this.configService.get<number>('MAX_NUMBER_OF_CATEGORIES_PER_USER')
    ) {
      return {
        success: false,
        error: `Max number of categories per user was exceeded`,
      };
    }
    const category = await this.prisma.category.create({
      data: { name, userId: user.id, color },
    });
    if (!category?.id) {
      return {
        success: false,
        error: `Could not create category`,
      };
    }
    return {
      success: true,
      category,
    };
  }

  public async setCategoryActive(
    categoryId: string,
    user: User
  ): Promise<
    | {
        success: true;
        category?: Category;
        timeLog: TimeLog;
      }
    | { success: false; error: string }
  > {
    const categoryWithUser = await this.findIfNotDeleted(categoryId, {
      user: true,
    });
    if (!categoryWithUser || categoryWithUser?.user?.id !== user.id) {
      return {
        success: false,
        error: `Category not found, bad request`,
      };
    }
    if (categoryWithUser.active === true) {
      return {
        success: true,
        category: await this.setCategoryActiveState(categoryWithUser.id, false),
        timeLog: await this.timeLogService.endFirstNotFinishedTimeLogsFor(
          user.id,
          categoryWithUser.id
        ),
      };
    }
    return {
      success: true,
      category: await this.setCategoryActiveState(categoryWithUser.id, true),
      timeLog: await this.timeLogService.createNew(
        user.id,
        categoryWithUser.id
      ),
    };
  }

  public async updateCategory(
    categoryId: string,
    name: string,
    color: string,
    user: User
  ) {
    const categoryWithUser = await this.findIfNotDeleted(categoryId, {
      user: true,
    });
    if (!categoryWithUser || categoryWithUser?.user?.id !== user.id) {
      return {
        success: false,
        error: `Category not found, bad request`,
      };
    }
    if (categoryWithUser.name === name && categoryWithUser.color === color) {
      return {
        success: true,
        category: { ...categoryWithUser, user: undefined } as Category,
      };
    }
    const updatedCategory = await this.updateNameAndColor(
      categoryId,
      name,
      color
    );
    return {
      success: true,
      category: updatedCategory,
    };
  }

  async setCategoryAsDeleted(categoryId: string, user: User) {
    const categoryWithUser = await this.findIfNotDeleted(categoryId, {
      user: true,
    });
    if (!categoryWithUser || categoryWithUser?.user?.id !== user.id) {
      return {
        success: false,
        error: `Category not found, bad request`,
      };
    }
    if (categoryWithUser.active) {
      return {
        success: false,
        error: `Category cannot be deleted, bad request`,
      };
    }
    const updatedCategory = await this.updateDeleted(categoryId, true);
    return {
      success: true,
      category: updatedCategory,
    };
  }

  public async findManyIfInIdList(categoriesIds: string[]) {
    return await this.prisma.category.findMany({
      where: { id: { in: categoriesIds } },
    });
  }

  public async findIfNotDeleted(
    categoryId: string,
    include: Prisma.CategoryInclude = null
  ) {
    return await this.prisma.category.findFirst({
      where: { id: categoryId, deleted: false },
      include,
    });
  }

  public async setCategoryActiveState(categoryId: string, active: boolean) {
    return await this.prisma.category.update({
      where: { id: categoryId },
      data: { active },
    });
  }

  private async countUserCategories(userId: string) {
    return await this.prisma.category.count({ where: { userId } });
  }

  private async updateDeleted(categoryId: string, deleted: boolean) {
    return await this.prisma.category.update({
      where: { id: categoryId },
      data: { deleted },
    });
  }

  private async updateNameAndColor(
    categoryId: string,
    name: string,
    color: string
  ) {
    return await this.prisma.category.update({
      where: { id: categoryId },
      data: { name, color },
    });
  }

  private async updateShowRecentNotes(
    categoryId: string,
    showRecentNotes: boolean
  ) {
    return await this.prisma.category.update({
      where: { id: categoryId },
      data: { showRecentNotes },
    });
  }

  public async getActiveCategoriesIds(userId: string) {
    return (
      await this.prisma.category.findMany({
        where: { userId, active: true },
        select: { id: true },
      })
    ).map((category) => category.id);
  }
}
