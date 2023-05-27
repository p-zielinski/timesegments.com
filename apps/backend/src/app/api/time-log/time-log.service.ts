import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CategoryService } from '../category/category.service';
import { DateTime } from 'luxon';
import { TimeLog, User } from '@prisma/client';
import { FromToDate, Timezones } from '@test1/shared';

@Injectable()
export class TimeLogService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => CategoryService))
    private categoryService: CategoryService
  ) {}

  public async findFromToTimeLogsEnrichedWithCategories(
    user: User,
    fromRaw: FromToDate,
    toRaw: FromToDate
  ) {
    //TODO LIMIT IT TO MAX 32 DAYS
    const findFromToTimeLogsResult = await this.findFromToTimeLogs(
      user,
      fromRaw,
      toRaw
    );
    const { success } = findFromToTimeLogsResult;
    if (!success || !findFromToTimeLogsResult.timeLogs) {
      return { ...findFromToTimeLogsResult, categories: [] };
    }
    const { timeLogs } = findFromToTimeLogsResult;
    const allCategoriesIdsFoundInTimeLogs = new Set();
    timeLogs.forEach((timeLog) => {
      if (typeof timeLog.categoryId === 'string') {
        allCategoriesIdsFoundInTimeLogs.add(timeLog.categoryId);
      }
    });
    const categories = await this.categoryService.findManyIfInIdList([
      ...allCategoriesIdsFoundInTimeLogs,
    ] as string[]);
    return { ...findFromToTimeLogsResult, categories };
  }

  public async endFirstNotFinishedTimeLogsFor(
    userId: string,
    categoryId: string
  ) {
    const result = await this.prisma.timeLog.findFirst({
      where: { userId, endedAt: null, categoryId },
      select: { id: true },
    });
    if (result.id) {
      return this.setTimeLogAsEnded(result.id);
    }
  }

  public async setTimeLogAsEnded(id: string) {
    return await this.prisma.timeLog.update({
      where: { id },
      data: { endedAt: new Date() },
    });
  }

  public async createNew(userId: string, categoryId?: string) {
    return await this.prisma.timeLog.create({
      data: { userId, categoryId },
    });
  }

  public async findFromToTimeLogs(
    user: User,
    fromRaw: FromToDate,
    toRaw: FromToDate
  ): Promise<
    { success: false; error: string } | { success: true; timeLogs: TimeLog[] }
  > {
    const usersTimezone = Timezones[user.timezone];
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
            startedAt: { gte: fromDateTime.toISO(), lte: toDateTime.toISO() },
          },
          {
            endedAt: { gte: fromDateTime.toISO(), lte: toDateTime.toISO() },
          },
        ],
      },
      orderBy: {
        startedAt: 'asc',
      },
    });
    if (results.length > 0) {
      return { success: true, timeLogs: results };
    }
    const result = await this.prisma.timeLog.findFirst({
      where: {
        userId: user.id,
        startedAt: { lte: toDateTime.toISO() },
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    return {
      success: true,
      timeLogs: [result],
    };
  }
}
