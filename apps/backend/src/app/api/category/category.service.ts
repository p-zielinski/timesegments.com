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

  public async disableCategory(categoryId: string, user: User) {
    const category = await this.findFirstUseId(categoryId, { user: true });
    if (!category || category?.user?.id !== user.id) {
      return {
        success: false,
        error: `Category not found, bad request`,
      };
    }
    console.log(await this.updateDisabled(categoryId, true));
    console.log(category);
  }

  private async countUserCategories(userId: string) {
    return await this.prisma.category.count({ where: { userId: userId } });
  }

  private async findFirstUseId(
    categoryId: string,
    include: Prisma.CategoryInclude = null
  ) {
    return await this.prisma.category.findFirst({
      where: { id: categoryId },
      include,
    });
  }

  private async updateDisabled(categoryId: string, state: boolean) {
    return await this.prisma.category.update({
      where: { id: categoryId },
      data: { disabled: state },
    });
  }
}
