import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CategoryService } from '../category/category.service';
import { DateTime } from 'luxon';
import { Prisma, TimeLog, User } from '@prisma/client';
import {
  asyncMap,
  ControlValue,
  FromToDateTime,
  Timezones,
} from '@test1/shared';
import { uniqBy } from 'lodash';
import { ControlValueService } from '../control-value/control-value.service';

@Injectable()
export class TimeLogService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => CategoryService))
    private categoryService: CategoryService,
    private controlValueService: ControlValueService
  ) {}

  public async editTimeLog(
    user: User,
    timeLogId: string,
    from: FromToDateTime,
    to?: FromToDateTime
  ) {
    const timeLogWithUser = await this.findOne(timeLogId, { user: true });
    if (!timeLogWithUser || timeLogWithUser.user.id !== user.id) {
      return {
        success: false,
        error: 'Could not find time log, bad request',
      };
    }
    const startedAt = DateTime.fromObject(from, {
      zone: Timezones[user.timezone],
    }).toISO();
    const endedAt = to
      ? DateTime.fromObject(to, { zone: Timezones[user.timezone] }).toISO()
      : null;
    const updatedTimeLog = await this.prisma.timeLog.update({
      where: { id: timeLogId },
      data: { startedAt, endedAt },
    });
    return { success: true, timeLog: updatedTimeLog };
  }

  public async createTimeLog(
    user: User,
    categoryId: string,
    from: FromToDateTime,
    to?: FromToDateTime
  ) {
    const categoryWithUser = await this.categoryService.findIfNotDeleted(
      categoryId,
      {
        user: true,
      }
    );
    if (categoryWithUser.active && !to) {
      return {
        success: false,
        error: `Cannot create unfinished timelog with already active category`,
      };
    }
    if (!categoryWithUser || categoryWithUser?.user?.id !== user.id) {
      return {
        success: false,
        error: `Category not found, bad request`,
      };
    }
    const startedAt = DateTime.fromObject(from, {
      zone: Timezones[user.timezone],
    });
    const endedAt = to
      ? DateTime.fromObject(to, { zone: Timezones[user.timezone] })
      : null;
    if (endedAt?.toMillis() && endedAt.toMillis() <= startedAt.toMillis()) {
      return {
        success: false,
        error: `End date time must be later than start date time`,
      };
    }
    if (!endedAt) {
      await this.prisma.category.update({
        data: { active: true },
        where: {
          id: categoryWithUser.id,
        },
      });
    }
    const createdTimeLog = await this.prisma.timeLog.create({
      data: {
        userId: user.id,
        categoryId,
        startedAt: startedAt.toISO(),
        endedAt: endedAt.toISO(),
      },
    });
    return {
      success: true,
      timeLog: createdTimeLog,
      controlValues: this.controlValueService.getNewControlValues(user.id, [
        ControlValue.TIME_LOGS,
      ]),
    };
  }

  public async findFromToTimeLogsEnrichedWithCategories(
    user: User,
    from: number,
    to: number,
    alreadyKnownCategories: string[] = []
  ) {
    //TODO LIMIT IT TO MAX 366 DAYS
    const findFromToTimeLogsResult = await this.findFromToTimeLogs(
      user,
      from,
      to
    );
    const { success } = findFromToTimeLogsResult;
    if (!success || !findFromToTimeLogsResult.timeLogs) {
      return { ...findFromToTimeLogsResult, categories: [] };
    }
    const { timeLogs } = findFromToTimeLogsResult;
    const missingCategories = new Set();
    timeLogs.forEach((timeLog) => {
      if (
        typeof timeLog.categoryId === 'string' &&
        !alreadyKnownCategories.includes(timeLog.categoryId)
      ) {
        missingCategories.add(timeLog.categoryId);
      }
    });
    const categories = missingCategories.size
      ? await this.categoryService.findManyIfInIdList([
          ...missingCategories,
        ] as string[])
      : [];
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
    from: number,
    to: number
  ): Promise<
    { success: false; error: string } | { success: true; timeLogs: TimeLog[] }
  > {
    const activeCategoriesIds =
      await this.categoryService.getActiveCategoriesIds(user.id);
    const usersTimezone = Timezones[user.timezone];
    const fromDateTime = DateTime.fromMillis(from, { zone: usersTimezone });
    const toDateTime = DateTime.fromMillis(to, { zone: usersTimezone });
    const fromDateIso = fromDateTime.toISO();
    const toDateIso = toDateTime.toISO();
    if (!fromDateIso || !toDateIso) {
      return { success: false, error: 'Date not valid' };
    }
    if (fromDateTime.toMillis() > toDateTime.toMillis()) {
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
    const missingTimeLogsWithFollowingCategoryIds = activeCategoriesIds.filter(
      (categoryId) =>
        !results.map((result) => result.categoryId).includes(categoryId)
    );
    if (missingTimeLogsWithFollowingCategoryIds.length) {
      //multiple categories can be active for more than a day...
      const opportunisticResults = (
        await asyncMap(
          missingTimeLogsWithFollowingCategoryIds,
          async (categoryId) =>
            await this.prisma.timeLog.findFirst({
              where: {
                userId: user.id,
                startedAt: { lte: toDateTime.toISO() },
                categoryId,
              },
              orderBy: {
                startedAt: 'desc',
              },
            })
        )
      ).filter((timeLog) => timeLog);
      if (opportunisticResults.length > 0) {
        return {
          success: true,
          timeLogs: uniqBy(
            [...results, ...opportunisticResults],
            'id'
          ) as TimeLog[],
        };
      }
    }
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
      timeLogs: result ? [result] : [],
    };
  }

  public async findOne(
    timeLogId: string,
    include: Prisma.CategoryInclude = null
  ) {
    return await this.prisma.timeLog.findFirst({
      where: { id: timeLogId },
      include,
    });
  }
}
