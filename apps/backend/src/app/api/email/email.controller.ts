import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/auth/jwtAuth.guard';
import { UserDecorator } from '../../common/param-decorators/user.decorator';
import { User } from '@prisma/client';
import { EmailService } from './email.service';
import { ValidateEmailDto } from './dto/validateEmail.dto';
import { ConfirmEmailDto } from './dto/confirmEmail.dto';
import { SendResetPasswordEmailDto } from './dto/sendResetPasswordEmail.dto';

@Controller('email')
export class EmailController {
  constructor(private emailService: EmailService) {}

  @UseGuards(JwtAuthGuard)
  @Post('resend-confirmation-email')
  async resendConfirmationEmail(@UserDecorator() user: User) {
    const resendConfirmationEmailResult =
      await this.emailService.sendConfirmationEmail(user);
    if (!resendConfirmationEmailResult.success) {
      throw new BadRequestException({
        error: resendConfirmationEmailResult?.error || 'Unknown error',
      });
    }
    return { success: true };
  }

  //todo add recaptcha guard
  @Post('send-reset-password-email')
  async sendResetPasswordEmail(
    @Body() sendResetPasswordEmailDto: SendResetPasswordEmailDto
  ) {
    const { email } = sendResetPasswordEmailDto;
    const sendResetPasswordEmailResult =
      await this.emailService.sendResetPasswordEmail(email);
    if (!sendResetPasswordEmailResult.success) {
      throw new BadRequestException({
        error: sendResetPasswordEmailResult?.error || 'Bad request',
      });
    }
    return sendResetPasswordEmailResult;
  }

  //todo add recaptcha guard
  @Post('validate-email')
  async validateEmail(@Body() validateEmailDto: ValidateEmailDto) {
    const { emailId, secretKey } = validateEmailDto;
    const validateEmailResult = await this.emailService.validateEmail(
      emailId,
      secretKey
    );
    if (!validateEmailResult.success) {
      throw new BadRequestException({
        error: validateEmailResult?.error || 'Bad request',
      });
    }
    return validateEmailResult;
  }

  //todo add recaptcha guard
  @Post('confirm-email')
  async confirmEmail(@Body() confirmEmailDto: ConfirmEmailDto) {
    const { emailId, secretKey } = confirmEmailDto;
    const confirmEmailResult = await this.emailService.confirmEmail(
      emailId,
      secretKey
    );
    if (!confirmEmailResult.success) {
      throw new BadRequestException({
        error: confirmEmailResult?.error,
      });
    }
    return confirmEmailResult;
  }
}
