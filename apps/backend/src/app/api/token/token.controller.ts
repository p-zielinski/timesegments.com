import {
  BadRequestException,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TokenService } from './token.service';
import { UserDecorator } from '../../common/param-decorators/user.decorator';
import { Token, User } from '@prisma/client';
import { JwtAuthGuard } from '../../common/auth/jwtAuth.guard';
import { CurrentTokenDecorator } from '../../common/param-decorators/currentTokenDecorator';

@UseGuards(JwtAuthGuard)
@Controller('token')
export class TokenController {
  constructor(private tokenService: TokenService) {}

  @Post('revoke-current')
  async handleRequestRevokeCurrentToken(
    @UserDecorator() user: User,
    @CurrentTokenDecorator() currentToken: Token
  ) {
    const revokeSingleTokenStatus =
      await this.tokenService.invalidateSingleToken(currentToken.id, user);
    if (!revokeSingleTokenStatus.success) {
      throw new BadRequestException({
        error: revokeSingleTokenStatus.error,
      });
    }
    return { message: revokeSingleTokenStatus.message };
  }
}
