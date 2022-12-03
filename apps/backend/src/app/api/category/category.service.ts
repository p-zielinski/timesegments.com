import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ConfigService } from '@nestjs/config';
import { User, Category, Prisma } from '@prisma/client';

@Injectable()
export class CategoryService {
  constructor(
    private prisma: PrismaService,
    private readonly configService: ConfigService
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
}
