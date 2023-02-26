import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CategoryService } from '../category/category.service';
import { SubcategoryService } from '../subcategory/subcategory.service';
import { DateTime } from 'luxon';
import { User } from '@prisma/client';

@Injectable()
export class TimeLogService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => CategoryService))
    private categoryService: CategoryService,
    @Inject(forwardRef(() => SubcategoryService))
    private subcategoryService: SubcategoryService
  ) {}

  public async findFromTo(
    user: User,
    fromRaw: {
      year: 2023;
      month: 2;
      day: 12;
    },
    toRaw = {
      year: 2023,
      month: 2,
      day: 12,
    }
  ) {
    const fromTime = DateTime.fromObject(
      { ...fromRaw, hour: 0, minute: 0, second: 0 },
      { zone: 'Poland' }
    );
    const toTime = DateTime.fromObject(
      { ...toRaw, hour: 24, minute: 0, second: 0 },
      { zone: 'Poland' }
    );
    console.log(fromTime.toISO());
    console.log(toTime.toISO());
    console.log(
      await this.prisma.timeLog.findMany({
        where: {
          userId: user.id,
          OR: [
            {
              createdAt: { gte: fromTime.toISO(), lte: toTime.toISO() },
            },
            {
              endedAt: { gte: fromTime.toISO(), lte: toTime.toISO() },
            },
          ],
        },
      })
    );
  }

  public async findAll(userId: string) {
    //TODO delete it
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
    const allCategories = await this.categoryService.findManyIfInIdList([
      ...allCategoriesIds,
    ] as string[]);
    const allSubcategories = await this.subcategoryService.findManyIfInIdList([
      ...allSubcategoriesIds,
    ] as string[]);
    return { allTimeLogs, allCategories, allSubcategories, success: true };
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
