import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { Email, User } from '@prisma/client';
import { EmailType } from '@test1/shared';
import { PrismaService } from '../../prisma.service';
import { nanoid } from 'nanoid';
import { SendMailClient } from 'zeptomail';
import { emailSpec } from './emailSpec';
import { LoggerService } from '../../common/logger/loger.service';

const sendMailURL = 'api.zeptomail.com/';
const sendMailToken = '<SEND_MAIL_TOKEN>';

@Injectable()
export class EmailService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private loggerService: LoggerService
  ) {}

  public resendConfirmationEmail(user: User) {
    return { success: true };
  }

  private async createEmailRecordInDatabase(
    userId: string,
    emailType: EmailType
  ) {
    if (emailSpec[emailType]?.unique) {
      const alreadySentEmail = (await this.findEmail(
        userId,
        emailType,
        false
      )) as Email;
      if (alreadySentEmail) {
        await this.removeEmailRecordInDatabase(alreadySentEmail.id);
      }
    }
    return await this.prisma.email.create({
      data: { userId, type: emailType, key: this.createKey() },
    });
  }

  private sendEmailFromDatabaseRecord(user: User, email: Email) {
    const { email: emailAddress } = user;
    const name = user.name || emailAddress;

    //findTamplateBasedOnEmailType
  }

  private sendEmail(templateKey: string, emailAddress: string, data: any) {
    const client = new SendMailClient({
      url: sendMailURL,
      token: sendMailToken,
    });
    try {
      const response = client.sendMail({
        template_key: templateKey,
        bounce_address: '<BOUNCE_ADDRESS>',
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
        subject: 'Test Email',
      });
      console.log(response);
    } catch (error) {
      console.log(error);
      console.log('error');
    }
  }

  private async removeEmailRecordInDatabase(id) {
    return await this.prisma.email.delete({ where: { id } });
  }

  private async findEmail(
    userId: string,
    emailType: EmailType,
    findMany: boolean
  ) {
    const where = {
      userId,
      type: emailType,
    };
    if (findMany) {
      return await this.prisma.email.findMany({
        where,
      });
    }
    return await this.prisma.email.findFirst({
      where,
    });
  }

  private createKey() {
    return nanoid(50);
  }
}
