import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { hashString } from '../../common/hashString';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { checkHashedString } from '../../common/checkHashedString';
import { TokenService } from '../token/token.service';
import { CategoryService } from '../category/category.service';
import { TimeLogService } from '../time-log/time-log.service';
import { Prisma, TimeLog, Timezone, User } from '@prisma/client';
import {
  CategoriesSortOption,
  ControlValue,
  DatePeriod,
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
import { ControlValueService } from '../control-value/control-value.service';

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
    private emailService: EmailService,
    private controlValueService: ControlValueService
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
    if (now.ts - confirmationEmailUpdatedAt.ts < 1000 * 60 * 60) {
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
    extend: MeExtendedOption[]
  ): Promise<{
    user: User;
    limits: Limits;
    timeLogs?: TimeLog[];
    controlValues: Record<ControlValue, string>;
    fetchedPeriods: DatePeriod[];
  }> {
    let timeLogs;
    const fetchedPeriods = [];
    const include: Prisma.UserInclude = {};
    if (extend.includes(MeExtendedOption.CATEGORIES)) {
      include.categories = {
        where: { deleted: false },
        include: extend.includes(MeExtendedOption.CATEGORIES_NOTES)
          ? { notes: true }
          : undefined,
      };
    }

    if (extend.includes(MeExtendedOption.NOTES)) {
      include.notes = true; //to be changed
    }

    if (extend.includes(MeExtendedOption.TODAYS_TIMELOGS)) {
      const endOfDay = DateTime.now()
        .setZone(Timezones[user.timezone])
        .set({ hour: 24, minute: 0, second: 0, millisecond: 0 });
      const beginningOfToday = endOfDay.minus({ days: 1 });
      const findFromToTimeLogsResult =
        await this.timeLogService.findFromToTimeLogs(
          user,
          beginningOfToday.ts,
          endOfDay.ts
        );
      if (findFromToTimeLogsResult.success === false) {
        this.loggerService.error(
          `Could not find today's time logs for user: ${user.id}`
        );
      } else {
        timeLogs = findFromToTimeLogsResult?.timeLogs;
        fetchedPeriods.push({ from: beginningOfToday.ts, to: endOfDay.ts });
      }
    }

    const limits: { categoriesLimit?: number; categoriesNotesLimit?: number } =
      {};
    if (extend.includes(MeExtendedOption.CATEGORIES_LIMIT)) {
      limits.categoriesLimit = this.configService.get<number>(
        'MAX_NUMBER_OF_CATEGORIES_PER_USER'
      );
    }
    if (extend.includes(MeExtendedOption.NOTES_PER_CATEGORY_LIMIT)) {
      limits.categoriesNotesLimit = this.configService.get<number>(
        'MAX_NUMBER_OF_NOTES_PER_CATEGORY'
      );
    }
    return {
      controlValues: await this.controlValueService.getAllUserControlValues(
        user.id
      ),
      user: extend.includes(MeExtendedOption.CATEGORIES)
        ? await this.prisma.user.findFirst({
            where: { id: user.id },
            include,
          })
        : undefined,
      limits: Object.keys(limits).length ? limits : undefined,
      timeLogs,
      fetchedPeriods,
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
          controlValues: this.controlValueService.getNewControlValues(user.id, [
            ControlValue.USER,
          ]),
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
          controlValues: this.controlValueService.getNewControlValues(user.id, [
            ControlValue.USER,
          ]),
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
          controlValues: this.controlValueService.getNewControlValues(user.id, [
            ControlValue.NOTES,
          ]),
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
