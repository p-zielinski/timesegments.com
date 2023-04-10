import { PrismaClient, TimeLog, User } from '@prisma/client';
import { FromToDate, Timezones } from '@test1/shared';
import { DateTime } from 'luxon';
import { findManyCategoriesIfInIdList } from './category.service';
import { findManySubcategoriesIfInIdList } from './subcategory.service';

const prisma = new PrismaClient();

export const findFromToTimeLogsEnrichedWithCategoriesAndSubcategories = async (
  user: User,
  fromRaw: FromToDate,
  toRaw: FromToDate
) => {
  //TODO LIMIT IT TO MAX 32 DAYS
  const findFromToTimeLogsResult = await findFromToTimeLogs(
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
  const categories = await findManyCategoriesIfInIdList([
    ...allCategoriesIdsFoundInTimeLogs,
  ] as string[]);
  const subcategories = await findManySubcategoriesIfInIdList([
    ...allSubcategoriesIdsFoundInTimeLogs,
  ] as string[]);
  return { ...findFromToTimeLogsResult, categories, subcategories };
};

export const findFirstTimeLogWhereNotEnded = async (userId: string) => {
  return await prisma.timeLog.findFirst({
    where: { userId, endedAt: null },
  });
};

export const setTimeLogAsEnded = async (id: string) => {
  return await prisma.timeLog.update({
    where: { id },
    data: { endedAt: new Date() },
  });
};

export const createNewTimeLog = async (
  userId: string,
  categoryId?: string,
  subcategoryId?: string
) => {
  return await prisma.timeLog.create({
    data: { userId, categoryId, subcategoryId },
  });
};

const findFromToTimeLogs = async (
  user: User,
  fromRaw: FromToDate,
  toRaw: FromToDate
): Promise<
  { success: false; error: string } | { success: true; timeLogs: TimeLog[] }
> => {
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
  const results = await prisma.timeLog.findMany({
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
  const result = await prisma.timeLog.findFirst({
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
    timeLogs:
      !result ||
      !result.endedAt ||
      DateTime.fromJSDate(result.endedAt).ts < fromDateTime.ts
        ? []
        : [result],
  };
};
