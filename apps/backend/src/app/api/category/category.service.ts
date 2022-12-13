import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ConfigService } from '@nestjs/config';
import { User, Category, Prisma } from '@prisma/client';
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
    name: string,
    user: User
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
      data: { name: name, userId: user.id },
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
    const categoryWithUser = await this.findFirstUseId(categoryId, {
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

  public async setCategoryActive(
    categoryId: string,
    user: User
  ): Promise<{ success: boolean; error?: string; category?: Category }> {
    const categoryWithUser = await this.findFirstUseId(categoryId, {
      user: true,
    });
    if (!categoryWithUser || categoryWithUser?.user?.id !== user.id) {
      return {
        success: false,
        error: `Category not found, bad request`,
      };
    }
    const activeSubcategory = await this.subcategoryService.findActive(user.id);
    if (categoryWithUser.active && !activeSubcategory) {
      return {
        success: true,
        category: { ...categoryWithUser, user: undefined } as Category,
      };
    }
    if (categoryWithUser.active && activeSubcategory?.id) {
      this.subcategoryService.setSubcategoryActiveState(
        activeSubcategory.id,
        false
      ); //don't wait
      const timeLogNotEndedId =
        await this.timeLogService.findFirstTimeLogIdWhereNotEnded(user.id);
      if (timeLogNotEndedId) {
        await this.timeLogService.setTimeLogAsEnded(timeLogNotEndedId);
      }
      await this.timeLogService.createNew(user.id, categoryWithUser.id);
      return {
        success: true,
        category: { ...categoryWithUser, user: undefined } as Category,
      };
    }
    const activeCategory = await this.findActive(user.id);
    if (activeSubcategory) {
      this.subcategoryService.setSubcategoryActiveState(
        activeSubcategory.id,
        false
      ); //don't wait
    }
    if (activeCategory) {
      this.setCategoryActiveState(activeCategory.id, false);
      const timeLogNotEndedId =
        await this.timeLogService.findFirstTimeLogIdWhereNotEnded(user.id);
      if (timeLogNotEndedId) {
        await this.timeLogService.setTimeLogAsEnded(timeLogNotEndedId);
      }
    }
    this.setCategoryActiveState(categoryId, true); //don't wait
    await this.timeLogService.createNew(user.id, categoryId);
    return {
      success: true,
      category: { ...categoryWithUser, user: undefined } as Category,
    };
  }

  public async updateNameCategory(categoryId: string, name: string, user: any) {
    const categoryWithUser = await this.findFirstUseId(categoryId, {
      user: true,
    });
    if (!categoryWithUser || categoryWithUser?.user?.id !== user.id) {
      return {
        success: false,
        error: `Category not found, bad request`,
      };
    }
    if (categoryWithUser.name === name) {
      return {
        success: true,
        category: { ...categoryWithUser, user: undefined } as Category,
      };
    }
    const updatedCategory = await this.updateName(categoryId, name);
    if (updatedCategory.name !== name) {
      return {
        success: false,
        error: `Could not update visibility`,
      };
    }
    return { success: true, category: updatedCategory };
  }

  private async countUserCategories(userId: string) {
    return await this.prisma.category.count({ where: { userId } });
  }

  public async findFirstUseId(
    categoryId: string,
    include: Prisma.CategoryInclude = null
  ) {
    return await this.prisma.category.findFirst({
      where: { id: categoryId },
      include,
    });
  }

  private async updateVisibility(categoryId: string, visible: boolean) {
    return await this.prisma.category.update({
      where: { id: categoryId },
      data: { visible },
    });
  }

  private async updateName(categoryId: string, name: string) {
    return await this.prisma.category.update({
      where: { id: categoryId },
      data: { name },
    });
  }

  public async findActive(userId: string) {
    return await this.prisma.category.findFirst({
      where: { userId, active: true },
    });
  }

  public async setCategoryActiveState(categoryId: string, active: boolean) {
    return await this.prisma.category.update({
      where: { id: categoryId },
      data: { active },
    });
  }
}
