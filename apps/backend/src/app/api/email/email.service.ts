import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { Email, User } from '@prisma/client';
import { EmailStatus, EmailType, getDuration, Timezones } from '@test1/shared';
import { PrismaService } from '../../prisma.service';
import { nanoid } from 'nanoid';
import { SendMailClient } from 'zeptomail';
import { emailsSpec } from './utils/emailsSpec';
import { LoggerService } from '../../common/logger/loger.service';
import { ConfigService } from '@nestjs/config';
import { DateTime } from 'luxon';
import { hashString } from '../../common/hashString';
import { TokenService } from '../token/token.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class EmailService {
  constructor(
    private prisma: PrismaService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private loggerService: LoggerService,
    private tokenService: TokenService,
    private jwtService: JwtService
  ) {}

  public async sendResetPasswordEmail(email: string) {
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      return { success: false, error: 'Could not find user with that email' };
    }
    return await this.sendEmail(user, EmailType.RESET_PASSWORD);
  }

  public async changeEmail(emailId, secretKey, newEmail, userAgent) {
    const validationResult = await this.validateEmail(emailId, secretKey);
    if (!validationResult.success) {
      return {
        success: false,
        error: 'Provided parameters did not pass validation',
      };
    }
    const { email } = validationResult;
    try {
      await this.userService.updateUser(email.user.id, {
        email: newEmail,
        emailConfirmed: false,
      });
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
    await this.removeEmailRecordInDatabase(email.id);
    await this.sendEmail(email.user, EmailType.EMAIL_CONFIRMATION);
    const token = await this.tokenService.generateToken(
      email.user.id,
      userAgent
    );
    return {
      success: true,
      token: this.jwtService.sign({
        userId: email.user.id,
        tokenId: token.id,
      }),
    };
  }

  public async changePassword(emailId, secretKey, newPassword, userAgent) {
    const validationResult = await this.validateEmail(emailId, secretKey);
    if (!validationResult.success) {
      return {
        success: false,
        error: 'Provided parameters did not pass validation',
      };
    }
    const { email } = validationResult;
    await this.userService.updateUser(email.user.id, {
      password: await hashString(
        newPassword,
        this.configService.get<number>('SALT_ROUNDS')
      ),
    });
    await this.removeEmailRecordInDatabase(email.id);
    const token = await this.tokenService.generateToken(
      email.user.id,
      userAgent
    );
    return {
      success: true,
      token: this.jwtService.sign({
        userId: email.user.id,
        tokenId: token.id,
      }),
    };
  }

  public async confirmEmail(emailId, secretKey) {
    const validationResult = await this.validateEmail(emailId, secretKey);
    if (!validationResult.success) {
      return {
        success: false,
        error: 'Provided parameters did not pass validation',
      };
    }
    const { email } = validationResult;
    await this.userService.updateUser(email.user.id, { emailConfirmed: true });
    await this.removeEmailRecordInDatabase(email.id);
    return { success: true };
  }

  public async validateEmail(emailId, secretKey) {
    const email = await this.prisma.email.findFirst({
      where: { id: emailId },
      include: {
        user: true,
      },
    });
    if (!email) {
      return { success: false };
    }
    if ((email.secretKey && !secretKey) || secretKey !== email.secretKey) {
      return { success: false };
    }
    const { validFor } = emailsSpec[email.type];
    const emailSentAt = DateTime.fromJSDate(email.updatedAt).setZone(
      Timezones[email.user.timezone]
    );
    const now = DateTime.now().setZone(Timezones[email.user.timezone]);
    if (now.toMillis() - emailSentAt.toMillis() > validFor) {
      return { success: false, error: 'Email has expired' };
    }
    return { success: true, email };
  }

  public async sendConfirmationEmail(user: User) {
    if (user.emailConfirmed) {
      return {
        success: false,
        error: 'Your email was already confirmed',
      };
    }
    return await this.sendEmail(user, EmailType.EMAIL_CONFIRMATION);
  }

  public async sendChangeEmailAddressEmail(user: User) {
    return await this.sendEmail(user, EmailType.CHANGE_EMAIL_ADDRESS);
  }

  public async sendEmail(user, emailType) {
    if (!user.email) {
      return {
        success: false,
        error: 'You have not provided an email address ever before!',
      };
    }
    const createEmailRecordInDatabaseResult =
      await this.createEmailRecordInDatabase(user, emailType);
    if (!createEmailRecordInDatabaseResult.success) {
      return createEmailRecordInDatabaseResult;
    }
    const { emailDbRecord } = createEmailRecordInDatabaseResult;
    const result = await this.sendEmailFromDatabaseRecord(user, emailDbRecord);
    this.updateStatusOfEmailRecordInDatabase(
      emailDbRecord.id,
      result.success ? EmailStatus.SENT : EmailStatus.FAILED
    );
    return result;
  }

  private canEmailBeSent(email, userTimezone) {
    if (!email || email.status !== EmailStatus.SENT) {
      return true;
    }
    const emailSentAt = DateTime.fromJSDate(email.updatedAt).setZone(
      Timezones[userTimezone]
    );
    const now = DateTime.now().setZone(Timezones[userTimezone]);
    return now.toMillis() - emailSentAt.toMillis() >= 1000 * 60 * 60;
  }

  private async createEmailRecordInDatabase(user: User, emailType: EmailType) {
    const alreadySentEmail = await this.findEmail(user.id, emailType);
    const canEmailBeSent = this.canEmailBeSent(alreadySentEmail, user.timezone);
    if (!canEmailBeSent) {
      const emailSentAt = DateTime.fromJSDate(
        alreadySentEmail.updatedAt
      ).setZone(Timezones[user.timezone]);
      return {
        success: false,
        error: `Email was already sent ${emailSentAt.toLocaleString({
          weekday: 'short',
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })}, please check spam folder.`,
      };
    }
    if (emailsSpec[emailType]?.unique && alreadySentEmail) {
      await this.removeEmailRecordInDatabase(alreadySentEmail.id);
    }
    return {
      success: true,
      emailDbRecord: await this.prisma.email.create({
        data: { userId: user.id, type: emailType, secretKey: this.createKey() },
      }),
    };
  }

  private async updateStatusOfEmailRecordInDatabase(
    emailId: string,
    status: EmailStatus
  ) {
    return await this.prisma.email.update({
      where: { id: emailId },
      data: { status },
    });
  }

  private async sendEmailFromDatabaseRecord(user: User, email: Email) {
    const name = user.name || user.email;
    const emailSpec = emailsSpec[email.type];
    const { templateKey, validFor: validForMs } = emailSpec;
    if (!templateKey) {
      throw new Error(`missing template key for type: ${email.type}`);
    }
    const url = new URL(
      '/email',
      this.configService.get<string>('FRONTEND_URL')
    );
    url.searchParams.set('emailId', email.id);
    url.searchParams.set('secretKey', email.secretKey);
    return await this.sendMailViaZeptoMail(templateKey, user.email, {
      url,
      name,
      validFor:
        validForMs > 0 && validForMs < Infinity
          ? getDuration(validForMs)
          : undefined,
    });
  }

  private async sendMailViaZeptoMail(
    templateKey: string,
    emailAddress: string,
    data: any
  ) {
    const client = new SendMailClient({
      url: 'api.zeptomail.com/',
      token: this.configService.get<string>('SEND_MAIL_TOKEN'),
    });
    try {
      const response = await client.sendMailWithTemplate({
        template_key: templateKey,
        bounce_address: 'bounce@mail.timesegs.com',
        from: {
          address: 'support@timesegs.com',
          name: 'TimeSegs.com',
        },
        to: [
          {
            email_address: {
              address: emailAddress,
              name: data.name || emailAddress,
            },
          },
        ],
        merge_info: { ...data },
      });
      this.loggerService.debug(response);
      return { success: true };
    } catch (error) {
      this.loggerService.error(error);
      return {
        success: false,
        error: error?.message ?? typeof error === 'string' ?? 'Unknown error',
      };
    }
  }

  //fake commit
  public async removeEmailRecordInDatabase(id) {
    return await this.prisma.email.delete({ where: { id } });
  }

  public async findEmail(userId: string, emailType: EmailType) {
    const where = {
      userId,
      type: emailType,
    };
    return await this.prisma.email.findFirst({
      where,
    });
  }

  private createKey() {
    return nanoid(Math.floor(Math.random() * 11) + 50);
  }
}
