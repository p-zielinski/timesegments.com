import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Category, Prisma, Subcategory, User } from '@prisma/client';
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
    name: string,
    subcategoryId: string,
    user: User
  ): Promise<{ success: boolean; error?: string; subcategory?: Subcategory }> {
    const categoryWithUser = await this.categoryService.findFirstUseId(
      subcategoryId,
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
      (await this.countCategorySubcategories(subcategoryId)) >
      this.configService.get<number>('MAX_NUMBER_OF_SUBCATEGORIES_PER_CATEGORY')
    ) {
      return {
        success: false,
        error: `Max number of subcategories per category ${subcategoryId} was exceeded`,
      };
    }
    const subcategory = await this.prisma.subcategory.create({
      data: { name: name, categoryId: subcategoryId, userId: user.id },
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
    const subcategoryWithUser = await this.findFirstUseId(subcategoryId, {
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
        error: `You cannot hide active category`,
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
  ): Promise<{
    success: boolean;
    error?: string;
    subcategory?: Subcategory;
    category?: Category;
  }> {
    const subcategoryWithUserAndCategory = await this.findFirstUseId(
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
    if (subcategoryWithUserAndCategory.active) {
      return {
        success: true,
        subcategory: {
          ...subcategoryWithUserAndCategory,
          user: undefined,
          category: undefined,
        } as Subcategory,
      };
    }
    const activeCategory = await this.categoryService.findActive(user.id);
    if (activeCategory?.id) {
      this.categoryService.setCategoryActiveState(activeCategory.id, false); //don't wait
    }
    const activeSubcategory = await this.findActive(user.id);
    if (activeSubcategory?.id) {
      this.setSubcategoryActiveState(activeSubcategory.id, false); //don't wait
    }
    const timeLogNotEndedId =
      await this.timeLogService.findFirstTimeLogWhereNotEnded(user.id);
    if (timeLogNotEndedId) {
      await this.timeLogService.setTimeLogAsEnded(timeLogNotEndedId);
    }
    await this.timeLogService.createNew(
      user.id,
      subcategoryWithUserAndCategory.category.id,
      subcategoryWithUserAndCategory.id
    );
    this.categoryService.setCategoryActiveState(
      subcategoryWithUserAndCategory.category.id,
      true
    ); //don't wait
    this.setSubcategoryActiveState(subcategoryWithUserAndCategory.id, true); //don't wait

    return {
      success: true,
      subcategory: {
        ...subcategoryWithUserAndCategory,
        user: undefined,
        category: undefined,
        active: true,
      } as Subcategory,
      category: { ...subcategoryWithUserAndCategory.category, active: true },
    };
  }

  public async updateNameSubcategory(
    subcategoryId: string,
    name: string,
    user: User
  ) {
    const subcategoryWithUser = await this.findFirstUseId(subcategoryId, {
      user: true,
    });
    if (!subcategoryWithUser || subcategoryWithUser?.user?.id !== user.id) {
      return {
        success: false,
        error: `Subcategory not found, bad request`,
      };
    }
    if (subcategoryWithUser.name === name) {
      return {
        success: true,
        subcategory: { ...subcategoryWithUser, user: undefined },
      };
    }
    const updatedSubcategory = await this.updateName(subcategoryId, name);
    if (updatedSubcategory.name !== name) {
      return {
        success: false,
        error: `Could not update name`,
      };
    }
    return { success: true, subcategory: updatedSubcategory };
  }

  public async findActive(userId: string) {
    return await this.prisma.subcategory.findFirst({
      where: { userId, active: true },
    });
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

  private async countCategorySubcategories(categoryId: string) {
    return await this.prisma.subcategory.count({ where: { categoryId } });
  }

  private async findFirstUseId(
    subcategoryId: string,
    include: Prisma.SubcategoryInclude = null
  ) {
    return await this.prisma.subcategory.findFirst({
      where: { id: subcategoryId },
      include,
    });
  }

  private async updateVisibility(subcategoryId: string, visible: boolean) {
    return await this.prisma.subcategory.update({
      where: { id: subcategoryId },
      data: { visible },
    });
  }

  private async updateName(subcategoryId: string, name: string) {
    return await this.prisma.subcategory.update({
      where: { id: subcategoryId },
      data: { name },
    });
  }
}
