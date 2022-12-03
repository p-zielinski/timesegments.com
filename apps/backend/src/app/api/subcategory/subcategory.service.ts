import { Injectable } from '@nestjs/common';
import { Category, Prisma, User } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SubcategoryService {
  constructor(
    private prisma: PrismaService,
    private readonly configService: ConfigService
  ) {}

  public async createSubcategory(
    name: string,
    categoryId: string,
    user: User
  ): Promise<{ success: boolean; error?: string; category?: Category }> {
    //first check if category belongs to user
    if (
      (await this.countCategorySubcategories(categoryId)) >
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

  public async updateVisibilitySubcategory(
    categoryId: string,
    visible: boolean,
    user: User
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
    if (categoryWithUser.state) {
      return {
        success: false,
        error: `You cannot hide active category`,
      };
    }
    if (categoryWithUser.visible === visible) {
      const category = {};
      Object.keys(categoryWithUser).forEach((key) => {
        if (key !== 'user') {
          category[key] = categoryWithUser[key];
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
    categoryId: string,
    include: Prisma.CategoryInclude = null
  ) {
    return await this.prisma.subcategory.findFirst({
      where: { id: categoryId },
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
