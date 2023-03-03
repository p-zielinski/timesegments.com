import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CategoryService } from '../category/category.service';
import { SubcategoryService } from '../subcategory/subcategory.service';
import { DateTime } from 'luxon';
import { TimeLog, User } from '@prisma/client';
import { FromToDate, Timezones } from '@test1/shared';
import { findValueOfEnum } from '../../common/findValueOfEnum';

@Injectable()
export class TimeLogService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => CategoryService))
    private categoryService: CategoryService,
    @Inject(forwardRef(() => SubcategoryService))
    private subcategoryService: SubcategoryService
  ) {}

  public async findFromToTimeLogsEnrichedWithCategoriesAndSubcategories(
    user: User,
    fromRaw: FromToDate,
    toRaw: FromToDate
  ) {
    const findFromToTimeLogsResult = await this.findFromToTimeLogs(
      user,
      fromRaw,
      toRaw
    );
    const { success } = findFromToTimeLogsResult;
    if (!success || !findFromToTimeLogsResult.timeLogs) {
      return { ...findFromToTimeLogsResult, categories: [], subcategories: [] };
    }
    const { timeLogs } = findFromToTimeLogsResult;
    const allCategoriesIdsFoundInTimeLogs = new Set();
    const allSubcategoriesIdsFoundInTimeLogs = new Set();
    timeLogs.forEach((timeLog) => {
      if (typeof timeLog.categoryId === 'string') {
        allCategoriesIdsFoundInTimeLogs.add(timeLog.categoryId);
      }
      if (timeLog.subcategoryId) {
        allSubcategoriesIdsFoundInTimeLogs.add(timeLog.subcategoryId);
      }
    });
    const categories = await this.categoryService.findManyIfInIdList([
      ...allCategoriesIdsFoundInTimeLogs,
    ] as string[]);
    const subcategories = await this.subcategoryService.findManyIfInIdList([
      ...allSubcategoriesIdsFoundInTimeLogs,
    ] as string[]);
    return { ...findFromToTimeLogsResult, categories, subcategories };
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

  private async findFromToTimeLogs(
    user: User,
    fromRaw: FromToDate,
    toRaw: FromToDate
  ): Promise<
    { success: false; error: string } | { success: true; timeLogs: TimeLog[] }
  > {
    const usersTimezone = findValueOfEnum(Timezones, user.timezone);
    const fromDateTime = DateTime.fromObject(
      { ...fromRaw, hour: 0, minute: 0, second: 0 },
      { zone: usersTimezone }
    );
    const toDateTime = DateTime.fromObject(
      { ...toRaw, hour: 24, minute: 0, second: 0 },
      { zone: usersTimezone }
    );
    const fromDateIso = fromDateTime.toISO();
    const toDateIso = toDateTime.toISO();
    if (!fromDateIso || !toDateIso) {
      return { success: false, error: 'Date not valid' };
    }
    if (fromDateTime.ts > toDateTime.ts) {
      return { success: false, error: 'Date not valid' };
    }
    const results = await this.prisma.timeLog.findMany({
      where: {
        userId: user.id,
        OR: [
          {
            createdAt: { gte: fromDateTime.toISO(), lte: toDateTime.toISO() },
          },
          {
            endedAt: { gte: fromDateTime.toISO(), lte: toDateTime.toISO() },
          },
        ],
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    if (results.length > 0) {
      return { success: true, timeLogs: results };
    }
    const result = await this.prisma.timeLog.findFirst({
      where: {
        userId: user.id,
        createdAt: { lte: toDateTime.toISO() },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      timeLogs:
        !result ||
        !result.endedAt ||
        DateTime.fromJSDate(result.endedAt).ts < fromDateTime.ts
          ? []
          : [result],
    };
  }
}
