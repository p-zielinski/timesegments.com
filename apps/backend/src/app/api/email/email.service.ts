import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { Email, User } from '@prisma/client';
import { EmailStatus, EmailType, Timezones } from '@test1/shared';
import { PrismaService } from '../../prisma.service';
import { nanoid } from 'nanoid';
import { SendMailClient } from 'zeptomail';
import { emailsSpec } from './utils/emailsSpec';
import { LoggerService } from '../../common/logger/loger.service';
import { ConfigService } from '@nestjs/config';
import { DateTime } from 'luxon';

const sendMailURL = 'api.zeptomail.com/';
const sendMailToken = '<SEND_MAIL_TOKEN>';

@Injectable()
export class EmailService {
  constructor(
    private prisma: PrismaService,
    private readonly configService: ConfigService,
    private userService: UserService,
    private loggerService: LoggerService
  ) {}

  public async sentConfirmationEmail(user: User) {
    const createEmailRecordInDatabaseResult =
      await this.createEmailRecordInDatabase(
        user,
        EmailType.EMAIL_CONTINUATION
      );
    if (!createEmailRecordInDatabaseResult.success) {
      return createEmailRecordInDatabaseResult;
    }
    const { emailDbRecord } = createEmailRecordInDatabaseResult;
    const result = await this.sendEmailFromDatabaseRecord(user, emailDbRecord);
    this.updateStatusOfEmailRecordInDatabase(
      emailDbRecord.id,
      result ? EmailStatus.SENT : EmailStatus.FAILED
    );
    return result;
  }

  private canEmailBeSent(email, userTimezone) {
    if (email.status !== EmailStatus.SENT) {
      return true;
    }
    const emailCreatedAt = DateTime.fromISO(email.updatedAt, {
      zone: Timezones[userTimezone],
    });
    const now = DateTime.now().setZone(Timezones[userTimezone]);
    return now.ts - emailCreatedAt.ts >= 1000 * 60 * 60;
  }

  private async createEmailRecordInDatabase(user: User, emailType: EmailType) {
    const alreadySentEmail = await this.findEmail(user.id, emailType);
    const canEmailBeSent = this.canEmailBeSent(alreadySentEmail, user.timezone);
    if (!canEmailBeSent) {
      const emailSentAt = DateTime.fromISO(alreadySentEmail.updatedAt, {
        zone: Timezones[user.timezone],
      });
      return {
        success: false,
        error: `Email was already sent ${emailSentAt.toLocaleString({
          weekday: 'short',
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })}`,
      };
    }
    if (emailsSpec[emailType]?.unique && alreadySentEmail) {
      await this.removeEmailRecordInDatabase(alreadySentEmail.id);
    }
    return {
      success: true,
      emailDbRecord: await this.prisma.email.create({
        data: { userId: user.id, type: emailType, key: this.createKey() },
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
    const { templateKey } = emailSpec;
    if (!templateKey) {
      throw new Error(`missing template key for type: ${email.type}`);
    }
    const url = new URL(
      '/email',
      this.configService.get<string>('FRONTEND_URL')
    );
    url.searchParams.set('userId', user.id);
    url.searchParams.set('type', email.type);
    url.searchParams.set('key', email.key);
    return await this.sendMailViaZeptoMail(templateKey, user.email, {
      url,
      name,
    });
  }

  private async sendMailViaZeptoMail(
    templateKey: string,
    emailAddress: string,
    data: any
  ) {
    const client = new SendMailClient({
      url: sendMailURL,
      token: sendMailToken,
    });
    try {
      const response = await client.sendMail({
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
              ...data,
            },
          },
        ],
      });
      this.loggerService.debug(response);
      return { success: true };
    } catch (error) {
      this.loggerService.error(error);
      return { success: false, error: error.message };
    }
  }

  private async removeEmailRecordInDatabase(id) {
    return await this.prisma.email.delete({ where: { id } });
  }

  private async findEmail(userId: string, emailType: EmailType) {
    const where = {
      userId,
      type: emailType,
    };
    return await this.prisma.email.findFirst({
      where,
    });
  }

  private createKey() {
    return nanoid(50);
  }
}
