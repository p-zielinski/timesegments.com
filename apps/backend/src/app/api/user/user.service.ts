import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { hashString } from '../../common/hashString';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { checkHashedString } from '../../common/checkHashedString';
import { TokenService } from '../token/token.service';
import { CategoryService } from '../category/category.service';
import { TimeLogService } from '../time-log/time-log.service';
import {
  Category,
  Note,
  Prisma,
  TimeLog,
  Timezone,
  Token,
  User,
} from '@prisma/client';
import {
  CategoriesSortOption,
  EmailType,
  findKeyOfValueInObject,
  Limits,
  MeExtendedOption,
  NotesSortOption,
  Timezones,
} from '@test1/shared';
import { LoggerService } from '../../common/logger/loger.service';
import { DateTime } from 'luxon';
import { EmailService } from '../email/email.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly configService: ConfigService,
    private jwtService: JwtService,
    private readonly tokenService: TokenService,
    private readonly categoryService: CategoryService,
    private readonly timeLogService: TimeLogService,
    private loggerService: LoggerService,
    private emailService: EmailService
  ) {}

  public async changeEmailAddress(user: User, newEmail: string) {
    if (user.emailConfirmed) {
      return {
        success: false,
        error:
          'Your email has been already confirmed. Please refresh the page.',
      };
    }
    const confirmationEmail = await this.emailService.findEmail(
      user.id,
      EmailType.EMAIL_CONFIRMATION
    );
    if (!confirmationEmail) {
      return await this.changeEmailAddressAndSendConfirmationEmail(
        user,
        newEmail
      );
    }
    const confirmationEmailUpdatedAt = DateTime.fromJSDate(
      confirmationEmail.updatedAt
    ).setZone(Timezones[user.timezone]);
    const now = DateTime.now().setZone(Timezones[user.timezone]);
    if (
      now.toMillis() - confirmationEmailUpdatedAt.toMillis() <
      1000 * 60 * 60
    ) {
      return {
        success: false,
        error: 'You have changed your email recently, please try again later',
      };
    }
    return await this.changeEmailAddressAndSendConfirmationEmail(
      user,
      newEmail,
      confirmationEmail.id
    );
  }

  private async changeEmailAddressAndSendConfirmationEmail(
    user: User,
    newEmail: string,
    emailIdToDelete?: string
  ) {
    try {
      await this.updateUser(user.id, { email: newEmail });
    } catch (error) {
      if (error?.meta?.target?.includes('email')) {
        return { success: false, error: 'This email is already taken' };
      }
      return {
        success: false,
        error:
          typeof error?.message === 'string'
            ? error?.message?.trim()
            : error?.message ?? 'Unknown error',
      };
    }
    if (emailIdToDelete) {
      await this.emailService.removeEmailRecordInDatabase(emailIdToDelete);
    }
    return await this.emailService.sendEmail(
      user,
      EmailType.EMAIL_CONFIRMATION
    );
  }

  public async getMeExtended(
    user: User,
    extend: MeExtendedOption[],
    currentToken: Token
  ): Promise<{
    user: User;
    categories?: Category[];
    notes?: Note[];
    limits?: Limits;
    timeLogs?: TimeLog[];
    fetchedFrom?: number;
    currentToken?: Token;
  }> {
    const timeLogs = [],
      include: Prisma.UserInclude = {};
    let fetchedFrom = undefined;

    if (extend.includes(MeExtendedOption.TODAYS_TIMELOGS)) {
      const endOfDay = DateTime.now()
        .setZone(Timezones[user.timezone])
        .set({ hour: 24, minute: 0, second: 0, millisecond: 0 });
      const beginningOfToday = endOfDay.minus({ days: 1 });
      const findFromToTimeLogsResult =
        await this.timeLogService.findFromToTimeLogs(
          user,
          beginningOfToday.toMillis(),
          endOfDay.toMillis()
        );
      if (findFromToTimeLogsResult.success === false) {
        this.loggerService.error(
          `Could not find today's time logs for user: ${user.id}`
        );
      } else {
        findFromToTimeLogsResult?.timeLogs.forEach((timeLog) =>
          timeLogs.push(timeLog)
        );
        fetchedFrom = beginningOfToday.toMillis();
      }
    }

    if (extend.includes(MeExtendedOption.CATEGORIES)) {
      include.categories = {
        where: { deleted: false },
        include: extend.includes(MeExtendedOption.CATEGORIES_NOTES)
          ? { notes: { where: { NOT: { categoryId: null } } } }
          : undefined,
      };
    }

    if (!extend.includes(MeExtendedOption.CATEGORIES)) {
      if (
        extend.includes(MeExtendedOption.CATEGORIES_NOTES) &&
        extend.includes(MeExtendedOption.NOTES)
      ) {
        include.notes = true;
      } else if (extend.includes(MeExtendedOption.NOTES)) {
        include.notes = { where: { categoryId: null } };
      } else if (extend.includes(MeExtendedOption.CATEGORIES_NOTES)) {
        include.notes = { where: { NOT: { categoryId: null } } };
      }
    }

    const userWithNotesAndCategoriesAndCategoriesNotes = Object.keys(include)
      .length
      ? await this.prisma.user.findFirst({
          where: { id: user.id },
          include,
        })
      : user;

    const { categories, notes } = extractCategoriesAndNotesFromExtendedUser(
      userWithNotesAndCategoriesAndCategoriesNotes
    );

    return {
      currentToken: extend.includes(MeExtendedOption.CURRENT_TOKEN)
        ? currentToken
        : undefined,
      user,
      categories: extend.includes(MeExtendedOption.CATEGORIES)
        ? categories
        : undefined,
      notes:
        extend.includes(MeExtendedOption.NOTES) ||
        extend.includes(MeExtendedOption.CATEGORIES_NOTES)
          ? notes
          : undefined,
      limits: getLimits(extend, this.configService),
      timeLogs: extend.includes(MeExtendedOption.TODAYS_TIMELOGS)
        ? timeLogs
        : undefined,
      fetchedFrom: extend.includes(MeExtendedOption.TODAYS_TIMELOGS)
        ? fetchedFrom
        : undefined,
    };
  }

  public async createNewUser(
    data: {
      email: string;
      plainPassword: string;
      timezone: Timezones;
      userAgent: string;
    },
    options?: { generateToken: boolean }
  ): Promise<
    | { success: false; error: string }
    | { success: true; user: User; token?: string }
  > {
    try {
      const newUser = await this.prisma.user.create({
        data: {
          email: data.email,
          password: await hashString(
            data.plainPassword,
            this.configService.get<number>('SALT_ROUNDS')
          ),
          timezone: findKeyOfValueInObject(
            Timezones,
            data.timezone
          ) as Timezone,
        },
      });
      await this.emailService.sendEmail(newUser, EmailType.EMAIL_CONFIRMATION);
      if (!options?.generateToken) {
        return { success: true, user: newUser };
      }
      const token = await this.tokenService.generateToken(
        newUser.id,
        data.userAgent
      );
      return {
        success: true,
        token: this.jwtService.sign({
          userId: newUser.id,
          tokenId: token.id,
        }),
        user: newUser,
      };
    } catch (error) {
      if (error?.meta?.target?.includes('email')) {
        return { success: false, error: 'This email is already taken' };
      }
      return {
        success: false,
        error:
          typeof error?.message === 'string'
            ? error?.message?.trim()
            : error?.message ?? 'Unknown error',
      };
    }
  }

  public async validateUser(data: {
    password: string;
    email: string;
    userAgent: string;
  }): Promise<
    | { success: false; error: string }
    | { success: true; token: string; user: User }
  > {
    const requestedUser = await this.prisma.user.findFirst({
      where: { email: data.email },
    });
    const VALIDATION_ERROR = {
      success: false,
      error: 'Email or password does not match',
    } as { success: false; error: string };
    if (
      !requestedUser?.password ||
      !(await checkHashedString(data.password, requestedUser.password))
    ) {
      return VALIDATION_ERROR;
    }
    const token = await this.tokenService.generateToken(
      requestedUser.id,
      data.userAgent
    );
    return {
      success: true,
      token: this.jwtService.sign({
        userId: requestedUser.id,
        tokenId: token.id,
      }),
      user: requestedUser,
    };
  }

  async setName(user: User, name: string) {
    if (user.name === name) {
      return { success: true, name };
    }
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: { name },
        select: { name: true },
      });
      if (updatedUser.name === name) {
        return {
          success: true,
          name,
        };
      }
    } catch (error) {
      this.loggerService.error(error);
    }

    return {
      success: false,
      error: `Could not update name to: ${name}`,
    };
  }

  async changePassword(
    user: User,
    currentPassword: string,
    newPassword: string
  ) {
    if (currentPassword === newPassword) {
      return { success: true };
    }
    if (!(await checkHashedString(currentPassword, user.password))) {
      return {
        success: false,
        error: `Wrong password`,
      };
    }
    try {
      const updatedUser = await this.updateUser(user.id, {
        password: await hashString(
          newPassword,
          this.configService.get<number>('SALT_ROUNDS')
        ),
      });
      if (updatedUser) {
        return { success: true };
      }
    } catch (error) {
      this.loggerService.error(error);
    }

    return {
      success: false,
      error: `Could not update password, please try again`,
    };
  }

  async initializeEmailChange(user: User, currentEmail: string) {
    if (currentEmail !== user.email) {
      return {
        success: false,
        error: `Invalid email address, please try again`,
      };
    }
    //send email
    return { success: true };
  }

  async changeTimezone(user: User, _timezone: Timezones) {
    const timezone = findKeyOfValueInObject(Timezones, _timezone) as Timezone;
    if (user.timezone === timezone) {
      return { success: true, timezone };
    }
    if (!timezone)
      return {
        success: false,
        error: `Invalid timezone: ${_timezone}`,
      };
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: { timezone },
        select: { timezone: true },
      });
      if (updatedUser.timezone === timezone) {
        return {
          success: true,
          timezone,
        };
      }
    } catch (error) {
      this.loggerService.error(error);
    }

    return {
      success: false,
      error: `Could not update timezone to: ${timezone}`,
    };
  }

  async setSortingCategories(
    user: User,
    sortingCategories: CategoriesSortOption
  ) {
    if (user.sortingCategories === sortingCategories) {
      return { success: true, sortingCategories };
    }
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: { sortingCategories },
        select: { sortingCategories: true },
      });
      if (updatedUser.sortingCategories === sortingCategories) {
        return { success: true, sortingCategories };
      }
    } catch (error) {
      this.loggerService.error(error);
    }

    return {
      success: false,
      error: `Could not update sortingCategories to: ${CategoriesSortOption}`,
    };
  }

  async setSortingNotes(user: User, sortingNotes: NotesSortOption) {
    if (user.sortingNotes === sortingNotes) {
      return { success: true, sortingNotes };
    }
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: { sortingNotes },
        select: { sortingNotes: true },
      });
      if (updatedUser.sortingNotes === sortingNotes) {
        return {
          success: true,
          sortingNotes,
        };
      }
    } catch (error) {
      this.loggerService.error(error);
    }

    return {
      success: false,
      error: `Could not update sortingCategories to: ${CategoriesSortOption}`,
    };
  }

  public async updateUser(userId: string, data: Prisma.UserUpdateInput) {
    return await this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  public async findUserByEmail(email: string) {
    return await this.prisma.user.findFirst({ where: { email } });
  }
}

const getLimits = (
  meExtendedOptions: MeExtendedOption[],
  configService: ConfigService
) => {
  if (!meExtendedOptions.includes(MeExtendedOption.LIMITS)) {
    return undefined;
  }
  return {
    categoriesLimit: configService.get<number>(
      'MAX_NUMBER_OF_CATEGORIES_PER_USER'
    ),
    categoriesNotesLimit: configService.get<number>(
      'MAX_NUMBER_OF_NOTES_PER_CATEGORY'
    ),
    notesLimit: configService.get<number>('MAX_NUMBER_OF_NOTES_PER_USER'),
  };
};

const extractCategoriesAndNotesFromExtendedUser = (userExtended) => {
  const categoriesWithNotes = userExtended.categories;
  const notes = [
    ...(userExtended.notes || []),
    ...(userExtended?.categories?.map?.((category) => category.notes)?.flat() ||
      []),
  ];
  const categories =
    categoriesWithNotes?.map((category) => {
      delete category.notes;
      return category;
    }) || [];
  return { categories, notes };
};
