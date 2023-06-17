import { SendMailClient } from 'zeptomail';
import { LoggerService } from '../../common/logger/loger.service';

const url = 'api.zeptomail.com/';
const sendMailClientToken = '<SEND_MAIL_TOKEN>';

const client = new SendMailClient({ url, token: sendMailClientToken });

const sendMailViaZeptoMail = (
  loggerService: LoggerService,
  templateKey,
  emailData: any
) => {
  if (!templateKey) {
    return false;
  }
  try {
    client.sendMailWithTemplate({
      template_key: '<template key>',
      bounce_address: '<BOUNCE_ADDRESS>',
      from: {
        address: 'support@TimeSegs.com',
        name: 'noreply',
      },
      to: [
        {
          email_address: emailData,
        },
      ],
    });
    return true;
  } catch (e) {
    loggerService.error(e);
    return false;
  }
};
