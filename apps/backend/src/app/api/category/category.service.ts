import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ConfigService } from '@nestjs/config';
import { Category, Prisma, User } from '@prisma/client';
import { SubcategoryService } from '../subcategory/subcategory.service';
import { TimeLogService } from '../time-log/time-log.service';

@Injectable()
export class CategoryService {
  constructor(
    private prisma: PrismaService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => SubcategoryService))
    private readonly subcategoryService: SubcategoryService,
    private readonly timeLogService: TimeLogService
  ) {}

  public async createCategory(
    user: User,
    name: string,
    color: string
  ): Promise<{ success: boolean; error?: string; category?: Category }> {
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
    return { success: true, category };
  }

  public async updateVisibilityCategory(
    categoryId: string,
    visible: boolean,
    user: User
  ): Promise<{ success: boolean; error?: string; category?: Category }> {
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
        error: `You cannot hide active category`,
      };
    }
    if (categoryWithUser.visible === visible) {
      return {
        success: true,
        category: { ...categoryWithUser, user: undefined } as Category,
      };
    }
    const updatedCategory = await this.updateVisibility(categoryId, visible);
    if (updatedCategory.visible !== visible) {
      return {
        success: false,
        error: `Could not update visibility`,
      };
    }
    return { success: true, category: updatedCategory };
  }

  public async updateExpandSubcategoriesCategory(
    categoryId: string,
    expandSubcategories: boolean,
    user: User
  ): Promise<{ success: boolean; error?: string; category?: Category }> {
    const categoryWithUser = await this.findIfNotDeleted(categoryId, {
      user: true,
    });
    if (!categoryWithUser || categoryWithUser?.user?.id !== user.id) {
      return {
        success: false,
        error: `Category not found, bad request`,
      };
    }
    if (categoryWithUser.expandSubcategories === expandSubcategories) {
      return {
        success: true,
        category: { ...categoryWithUser, user: undefined } as Category,
      };
    }
    const updatedCategory = await this.updateExpandSubcategories(
      categoryId,
      expandSubcategories
    );
    if (updatedCategory.expandSubcategories !== expandSubcategories) {
      return {
        success: false,
        error: `Could not update expandSubcategories`,
      };
    }
    return { success: true, category: updatedCategory };
  }

  public async setCategoryActive(
    categoryId: string,
    user: User
  ): Promise<
    { success: true; category?: Category } | { success: false; error: string }
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
    const timeLogNotEnded =
      await this.timeLogService.findFirstTimeLogWhereNotEnded(user.id);
    if (!timeLogNotEnded) {
      await this.timeLogService.createNew(user.id, categoryWithUser.id);
      return {
        success: true,
        category: await this.setCategoryActiveState(categoryWithUser.id, true),
      };
    }
    if (timeLogNotEnded.categoryId === categoryWithUser.id) {
      await this.timeLogService.setTimeLogAsEnded(timeLogNotEnded.id);
      if (timeLogNotEnded.subcategoryId) {
        await this.timeLogService.createNew(user.id, categoryWithUser.id);
        await this.subcategoryService.setSubcategoryActiveState(
          timeLogNotEnded.subcategoryId,
          false
        );
        return {
          success: true,
          category: { ...categoryWithUser, user: undefined } as Category,
        };
      }
      await this.setCategoryActiveState(timeLogNotEnded.categoryId, false);
      return {
        success: true,
        category: {
          ...categoryWithUser,
          active: false,
          user: undefined,
        } as Category,
      };
    }
    await this.setCategoryActiveState(timeLogNotEnded.categoryId, false);
    if (timeLogNotEnded.subcategoryId) {
      await this.subcategoryService.setSubcategoryActiveState(
        timeLogNotEnded.subcategoryId,
        false
      );
    }
    await this.timeLogService.setTimeLogAsEnded(timeLogNotEnded.id);
    await this.timeLogService.createNew(user.id, categoryWithUser.id);
    return {
      success: true,
      category: await this.setCategoryActiveState(
        categoryWithUser.id,
        timeLogNotEnded.categoryId !== categoryWithUser.id
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
    return { success: true, category: updatedCategory };
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

  private async updateVisibility(categoryId: string, visible: boolean) {
    return await this.prisma.category.update({
      where: { id: categoryId },
      data: { visible },
    });
  }

  private async updateExpandSubcategories(
    categoryId: string,
    expandSubcategories: boolean
  ) {
    return await this.prisma.category.update({
      where: { id: categoryId },
      data: { expandSubcategories },
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
}
