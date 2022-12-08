import { Injectable } from '@nestjs/common';
import { Category, Prisma, Subcategory, User } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import { ConfigService } from '@nestjs/config';
import { CategoryService } from '../category/category.service';

@Injectable()
export class SubcategoryService {
  constructor(
    private prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly categoryService: CategoryService
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
        error: `Category not found, bad request`,
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
      data: { name: name, categoryId: subcategoryId, userId:user.id },
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
  ) {
    const subcategoryWithUser = await this.findFirstUseId(subcategoryId, {
      user: true,
    });
    if (!subcategoryWithUser || subcategoryWithUser?.user?.id !== user.id) {
      return {
        success: false,
        error: `Category not found, bad request`,
      };
    }
    if (subcategoryWithUser.active) {
      return {
        success: false,
        error: `You cannot hide active category`,
      };
    }
    if (subcategoryWithUser.visible === visible) {
      const category = {};
      Object.keys(subcategoryWithUser).forEach((key) => {
        if (key !== 'user') {
          category[key] = subcategoryWithUser[key];
        }
      });
      return { success: true, category: category };
    }
    const updatedCategory = await this.updateVisibility(subcategoryId, visible);
    if (updatedCategory.visible !== visible) {
      return {
        success: false,
        error: `Could not update visibility`,
      };
    }
    return { success: true, category: updatedCategory };
  }

  public async updateNameSubcategory(
    subcategoryId: string,
    name: string,
    user: any
  ) {
    const categoryWithUser = await this.findFirstUseId(subcategoryId, {
      user: true,
    });
    if (!categoryWithUser || categoryWithUser?.user?.id !== user.id) {
      return {
        success: false,
        error: `Category not found, bad request`,
      };
    }
    if (categoryWithUser.name === name) {
      const category = {};
      Object.keys(categoryWithUser).forEach((key) => {
        if (key !== 'user') {
          category[key] = categoryWithUser[key];
        }
      });
      return { success: true, category: category };
    }
    const updatedCategory = await this.updateName(subcategoryId, name);
    if (updatedCategory.name !== name) {
      return {
        success: false,
        error: `Could not update visibility`,
      };
    }
    return { success: true, category: updatedCategory };
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
