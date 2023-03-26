import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { TokenService } from './token.service';
import { UserDecorator } from '../../common/param-decorators/user.decorator';
import { Token, User } from '@prisma/client';
import { RevokeSingleTokenDto } from './dto/revokeSingleToken.dto';
import { JwtAuthGuard } from '../../common/auth/jwtAuth.guard';
import { CurrentTokenDecorator } from '../../common/param-decorators/currentTokenDecorator';
import { Response } from 'express';
import { ReturnTokenSetCookieDto } from './dto/returnTokenSetCookie.dto';

@UseGuards(JwtAuthGuard)
@Controller('token')
export class TokenController {
  constructor(private tokenService: TokenService) {}

  @Post('return-token-set-cookie')
  returnCookie(
    @UserDecorator() user: User,
    @Res({ passthrough: true }) response: Response,
    @Headers() headers: Headers,
    @Body() returnTokenSetCookieDto: ReturnTokenSetCookieDto
  ) {
    const date = new Date();
    date.setDate(date.getDate() + returnTokenSetCookieDto.days);
    const cookieConfig = {
      maxAge: 1000 * 60 * 60 * 24 * (returnTokenSetCookieDto.days || 400),
      httpOnly: true,
      secure: true,
      sameSite: true,
    };
    response.cookie(
      'jwt_token',
      (headers as Partial<{ jwt_token: string }>).jwt_token,
      cookieConfig
    );
  }

  @Post('revoke')
  async handleRequestRevokeToken(
    @UserDecorator() user: User,
    @Body() revokeSingleTokenDto: RevokeSingleTokenDto
  ) {
    const { tokenId } = revokeSingleTokenDto;
    const revokeSingleTokenStatus = await this.tokenService.deleteSingleToken(
      tokenId,
      user
    );
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
      await this.tokenService.deleteUsersTokensButOne(token.id, user);
    return { message: revokeSingleTokenStatus.message };
  }
}
