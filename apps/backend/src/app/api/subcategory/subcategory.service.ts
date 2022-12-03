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
    categoryId: string,
    user: User
  ): Promise<{ success: boolean; error?: string; subcategory?: Subcategory }> {
    const categoryWithUser = await this.categoryService.findFirstUseId(
      categoryId,
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
      (await this.countCategorySubcategories(categoryId)) >
      this.configService.get<number>('MAX_NUMBER_OF_SUBCATEGORIES_PER_CATEGORY')
    ) {
      return {
        success: false,
        error: `Max number of subcategories per category ${categoryId} was exceeded`,
      };
    }
    const subcategory = await this.prisma.subcategory.create({
      data: { name: name, categoryId },
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
    categoryId: string,
    visible: boolean,
    user: User
  ) {
    const subcategoryWithUser = await this.findFirstUseId(categoryId, {
      category: true,
    });
    console.log(subcategoryWithUser);
    if (!subcategoryWithUser || subcategoryWithUser?.user?.id !== user.id) {
      return {
        success: false,
        error: `Category not found, bad request`,
      };
    }
    if (subcategoryWithUser.state) {
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
    const updatedCategory = await this.updateVisibility(categoryId, visible);
    if (updatedCategory.visible !== visible) {
      return {
        success: false,
        error: `Could not update visibility`,
      };
    }
    return { success: true, category: updatedCategory };
  }

  public async updateNameSubcategory(
    categoryId: string,
    name: string,
    user: any
  ) {
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
      const category = {};
      Object.keys(categoryWithUser).forEach((key) => {
        if (key !== 'user') {
          category[key] = categoryWithUser[key];
        }
      });
      return { success: true, category: category };
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
