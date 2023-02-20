import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CategoryService } from '../category/category.service';
import { SubcategoryService } from '../subcategory/subcategory.service';

@Injectable()
export class TimeLogService {
  constructor(
    private prisma: PrismaService,
    private categoryService: CategoryService,
    private subcategoryService: SubcategoryService
  ) {}

  public async findAll(userId: string) {
    const allTimeLogs = await this.prisma.timeLog.findMany({
      where: { userId },
    });
    const allCategoriesIds = new Set();
    const allSubcategoriesIds = new Set();
    allTimeLogs.forEach((timeLog) => {
      allCategoriesIds.add(timeLog.categoryId);
      if (timeLog.subcategoryId) {
        allSubcategoriesIds.add(timeLog.subcategoryId);
      }
    });
    return { allTimeLogs, success: true };
  }

  public async findFirstTimeLogWhereNotEnded(userId: string) {
    return await this.prisma.timeLog.findFirst({
      where: { userId, endedAt: null },
    });
  }

  public async setTimeLogAsEnded(id: string) {
    return await this.prisma.timeLog.update({
      where: { id },
      data: { endedAt: new Date() },
    });
  }

  public async createNew(
    userId: string,
    categoryId?: string,
    subcategoryId?: string
  ) {
    return await this.prisma.timeLog.create({
      data: { userId, categoryId, subcategoryId },
    });
  }
}
