import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TokenService } from './token.service';
import { UserDecorator } from '../../common/param-decorators/user.decorator';
import { Token, User } from '@prisma/client';
import { RevokeSingleTokenDto } from './dto/revokeSingleToken.dto';
import { JwtAuthGuard } from '../../common/auth/jwtAuth.guard';
import { CurrentTokenDecorator } from '../../common/param-decorators/currentTokenDecorator';

@UseGuards(JwtAuthGuard)
@Controller('token')
export class TokenController {
  constructor(private tokenService: TokenService) {}

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
