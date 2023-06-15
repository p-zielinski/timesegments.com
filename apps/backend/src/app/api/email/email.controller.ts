import {
  BadRequestException,
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/auth/jwtAuth.guard';

@UseGuards(JwtAuthGuard)
@Controller('email')
export class EmailController {
  @Get('resend-confirmation-email')
  resendConfirmationEmail() {
    throw new BadRequestException({
      error: 'We have sent you a confirmation email at ',
    });
    return { success: true };
  }
}
