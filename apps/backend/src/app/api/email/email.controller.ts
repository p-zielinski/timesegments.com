import {
  BadRequestException,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/auth/jwtAuth.guard';
import { UserDecorator } from '../../common/param-decorators/user.decorator';
import { User } from '@prisma/client';
import { EmailService } from './email.service';

@UseGuards(JwtAuthGuard)
@Controller('email')
export class EmailController {
  constructor(private emailService: EmailService) {}

  @Post('resend-confirmation-email')
  async resendConfirmationEmail(@UserDecorator() user: User) {
    const resendConfirmationEmailResult =
      await this.emailService.sentConfirmationEmail(user);
    if (!resendConfirmationEmailResult.success) {
      throw new BadRequestException({
        error: resendConfirmationEmailResult?.error || 'Unknown error',
      });
    }
    return { success: true };
  }
}
