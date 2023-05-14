import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Category, Prisma, Subcategory, TimeLog, User } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import { ConfigService } from '@nestjs/config';
import { CategoryService } from '../category/category.service';
import { TimeLogService } from '../time-log/time-log.service';

@Injectable()
export class SubcategoryService {
  constructor(
    private prisma: PrismaService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => CategoryService))
    private readonly categoryService: CategoryService,
    private readonly timeLogService: TimeLogService
  ) {}

  public async createSubcategory(
    user: User,
    categoryId: string,
    name: string,
    color: string
  ): Promise<{ success: boolean; error?: string; subcategory?: Subcategory }> {
    const categoryWithUser = await this.categoryService.findIfNotDeleted(
      categoryId,
      {
        user: true,
      }
    );
    if (!categoryWithUser || categoryWithUser?.user?.id !== user.id) {
      return {
        success: false,
        error: `Subcategory not found, bad request`,
      };
    }
    if (
      (await this.countCategorySubcategories(categoryId)) >
      this.configService.get<number>('MAX_NUMBER_OF_SUBCATEGORIES_PER_CATEGORY')
    ) {
      return {
        success: false,
        error: `Max number of subcategories per category ${categoryId} was exceeded`,
      };
    }
    const subcategory = await this.prisma.subcategory.create({
      data: {
        name: name,
        categoryId: categoryId,
        userId: user.id,
        color: color ? color : null,
      },
    });
    if (!subcategory?.id) {
      return {
        success: false,
        error: `Could not create subcategory`,
      };
    }
    return { success: true, subcategory };
  }

  public async updateVisibilitySubcategory(
    subcategoryId: string,
    visible: boolean,
    user: User
  ): Promise<{ success: boolean; error?: string; subcategory?: Subcategory }> {
    const subcategoryWithUser = await this.findIfNotDeleted(subcategoryId, {
      user: true,
    });
    if (!subcategoryWithUser || subcategoryWithUser?.user?.id !== user.id) {
      return {
        success: false,
        error: `Subcategory not found, bad request`,
      };
    }
    if (subcategoryWithUser.active) {
      return {
        success: false,
        error: `You cannot hide active subcategory`,
      };
    }
    if (subcategoryWithUser.visible === visible) {
      return {
        success: true,
        subcategory: { ...subcategoryWithUser, user: undefined } as Subcategory,
      };
    }
    const updatedSubcategory = await this.updateVisibility(
      subcategoryId,
      visible
    );
    if (updatedSubcategory.visible !== visible) {
      return {
        success: false,
        error: `Could not update visibility`,
      };
    }
    return { success: true, subcategory: updatedSubcategory };
  }

  public async setSubcategoryActive(
    subcategoryId: string,
    user: User
  ): Promise<
    | {
        success: true;
        subcategory: Subcategory;
        category: Category;
        timeLogs: TimeLog[];
      }
    | { success: false; error: string }
  > {
    const subcategoryWithUserAndCategory = await this.findIfNotDeleted(
      subcategoryId,
      {
        user: true,
        category: true,
      }
    );
    if (
      !subcategoryWithUserAndCategory ||
      subcategoryWithUserAndCategory?.user?.id !== user.id
    ) {
      return {
        success: false,
        error: `Subcategory not found, bad request`,
      };
    }
    const timeLogNotEnded =
      await this.timeLogService.findFirstTimeLogWhereNotEnded(user.id);
    if (!timeLogNotEnded) {
      const newTimeLog = await this.timeLogService.createNew(
        user.id,
        subcategoryWithUserAndCategory.category.id,
        subcategoryWithUserAndCategory.id
      );
      const category = await this.categoryService.setCategoryActiveState(
        subcategoryWithUserAndCategory.category.id,
        true
      );
      return {
        success: true,
        category,
        subcategory: await this.setSubcategoryActiveState(
          subcategoryWithUserAndCategory.id,
          true
        ),
        timeLogs: [newTimeLog],
      };
    }
    if (
      timeLogNotEnded.categoryId === subcategoryWithUserAndCategory.category.id
    ) {
      const timeLogJustEnded = await this.timeLogService.setTimeLogAsEnded(
        timeLogNotEnded.id
      );
      if (timeLogNotEnded.subcategoryId === subcategoryWithUserAndCategory.id) {
        const category = await this.categoryService.setCategoryActiveState(
          subcategoryWithUserAndCategory.category.id,
          false
        );
        return {
          success: true,
          category,
          subcategory: await this.setSubcategoryActiveState(
            subcategoryWithUserAndCategory.id,
            false
          ),
          timeLogs: [timeLogJustEnded],
        };
      }
      if (timeLogNotEnded.subcategoryId) {
        await this.setSubcategoryActiveState(
          timeLogNotEnded.subcategoryId,
          false
        );
      }
      const newTimeLog = await this.timeLogService.createNew(
        user.id,
        subcategoryWithUserAndCategory.category.id,
        subcategoryWithUserAndCategory.id
      );
      return {
        success: true,
        category: subcategoryWithUserAndCategory.category,
        subcategory: await this.setSubcategoryActiveState(
          subcategoryWithUserAndCategory.id,
          true
        ),
        timeLogs: [timeLogJustEnded, newTimeLog],
      };
    }
    const timeLogJustEnded = await this.timeLogService.setTimeLogAsEnded(
      timeLogNotEnded.id
    );
    await this.categoryService.setCategoryActiveState(
      timeLogNotEnded.categoryId,
      false
    );
    if (timeLogNotEnded.subcategoryId) {
      await this.setSubcategoryActiveState(
        timeLogNotEnded.subcategoryId,
        false
      );
    }
    const newTimeLog = await this.timeLogService.createNew(
      user.id,
      subcategoryWithUserAndCategory.category.id,
      subcategoryWithUserAndCategory.id
    );
    return {
      success: true,
      category: await this.categoryService.setCategoryActiveState(
        subcategoryWithUserAndCategory.category.id,
        true
      ),
      subcategory: await this.setSubcategoryActiveState(
        subcategoryWithUserAndCategory.id,
        true
      ),
      timeLogs: [timeLogJustEnded, newTimeLog],
    };
  }

  public async updateSubcategory(
    user: User,
    subcategoryId: string,
    name: string,
    color?: string
  ) {
    const subcategoryWithUser = await this.findIfNotDeleted(subcategoryId, {
      user: true,
    });
    if (!subcategoryWithUser || subcategoryWithUser?.user?.id !== user.id) {
      return {
        success: false,
        error: `Subcategory not found, bad request`,
      };
    }
    if (
      subcategoryWithUser.name === name &&
      subcategoryWithUser.color === color
    ) {
      return {
        success: true,
        subcategory: { ...subcategoryWithUser, user: undefined },
      };
    }
    const updatedSubcategory = await this.updateNameAndColor(
      subcategoryId,
      name,
      color
    );
    return { success: true, subcategory: updatedSubcategory };
  }

  async setSubcategoryAsDeleted(subcategoryId: string, user: User) {
    const subcategoryWithUser = await this.findIfNotDeleted(subcategoryId, {
      user: true,
    });
    if (!subcategoryWithUser || subcategoryWithUser?.user?.id !== user.id) {
      return {
        success: false,
        error: `Subcategory not found, bad request`,
      };
    }
    if (subcategoryWithUser.active || subcategoryWithUser.visible) {
      return {
        success: false,
        error: `Category cannot be deleted, bad request`,
      };
    }
    const updatedSubcategory = await this.updateDeleted(subcategoryId, true);
    return { success: true, subcategory: updatedSubcategory };
  }

  public async setSubcategoryActiveState(
    subcategoryId: string,
    active: boolean
  ) {
    return await this.prisma.subcategory.update({
      where: { id: subcategoryId },
      data: { active },
    });
  }

  public async findManyIfInIdList(subcategoriesIds: string[]) {
    return await this.prisma.subcategory.findMany({
      where: { id: { in: subcategoriesIds } },
    });
  }

  private async countCategorySubcategories(categoryId: string) {
    return await this.prisma.subcategory.count({ where: { categoryId } });
  }

  private async findIfNotDeleted(
    subcategoryId: string,
    include: Prisma.SubcategoryInclude = null
  ) {
    return await this.prisma.subcategory.findFirst({
      where: { id: subcategoryId, deleted: false },
      include,
    });
  }

  private async updateVisibility(subcategoryId: string, visible: boolean) {
    return await this.prisma.subcategory.update({
      where: { id: subcategoryId },
      data: { visible },
    });
  }

  private async updateDeleted(subcategoryId: string, deleted: boolean) {
    return await this.prisma.subcategory.update({
      where: { id: subcategoryId },
      data: { deleted },
    });
  }

  private async updateNameAndColor(
    subcategoryId: string,
    name: string,
    color?: string
  ) {
    return await this.prisma.subcategory.update({
      where: { id: subcategoryId },
      data: { name, color: color ?? null },
    });
  }
}
