import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CategoryService } from '../category/category.service';
import { SubcategoryService } from '../subcategory/subcategory.service';
import { DateTime } from 'luxon';
import { User } from '@prisma/client';
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

  public async findFromToTimeLogs(
    user: User,
    fromRaw: FromToDate,
    toRaw: FromToDate
  ) {
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
      throw new Error('Date not valid');
    }
    if (fromDateTime.ts > toDateTime.ts) {
      throw new Error('From date is past to date');
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
      return results;
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
    if (
      !result ||
      !result.endedAt ||
      DateTime.fromJSDate(result.endedAt).ts < fromDateTime.ts
    ) {
      return [];
    }
    return [result];
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
