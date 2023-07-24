import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TokenService } from './token.service';
import { UserDecorator } from '../../common/param-decorators/user.decorator';
import { Token, User } from '@prisma/client';
import { JwtAuthGuard } from '../../common/auth/jwtAuth.guard';
import { CurrentTokenDecorator } from '../../common/param-decorators/currentTokenDecorator';
import { RevokeSingleTokenDto } from './dto/revokeSingleToken.dto';

@UseGuards(JwtAuthGuard)
@Controller('token')
export class TokenController {
  constructor(private tokenService: TokenService) {}

  @Get('all')
  async handleRequestGetAllUserTokens(@UserDecorator() user: User) {
    return { tokens: await this.tokenService.findUsersTokens(user.id) };
  }

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

  @Post('revoke')
  async handleRequestRevokeToken(
    @UserDecorator() user: User,
    @Body() revokeSingleTokenDto: RevokeSingleTokenDto
  ) {
    const { tokenId } = revokeSingleTokenDto;
    const revokeSingleTokenStatus =
      await this.tokenService.invalidateSingleToken(tokenId, user);
    if (!revokeSingleTokenStatus.success) {
      throw new BadRequestException({
        error: revokeSingleTokenStatus.error,
      });
    }
    return { message: revokeSingleTokenStatus.message };
  }

  @Post('revoke-other')
  async handleRequestRevokeOtherTokens(
    @UserDecorator() user: User,
    @CurrentTokenDecorator() token: Token
  ) {
    const revokeSingleTokenStatus =
      await this.tokenService.invalidateUsersTokensButOne(token.id, user);
    return { message: revokeSingleTokenStatus.message };
  }
}
