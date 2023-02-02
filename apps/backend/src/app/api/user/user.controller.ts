import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LoginOrRegisterDto } from './dto/loginOrRegister.dto';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { UserDecorator } from '../../common/paramDecorators/user.decorator';
import { User } from '@prisma/client';
import { MeExtendedDto } from './dto/meExtendedDto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('register')
  async handleRequestCreateNewUser(
    @Body() loginOrRegisterDto: LoginOrRegisterDto
  ) {
    const { email, password } = loginOrRegisterDto;
    const registerStatus = await this.userService.createNewUser(
      { email, plainPassword: password },
      { generateToken: true }
    );
    if (!registerStatus.success) {
      throw new BadRequestException({
        error: registerStatus.error,
      });
    }
    return registerStatus;
  }

  @Post('login')
  async handleRequestLogin(@Body() loginOrRegisterDto: LoginOrRegisterDto) {
    const { email, password } = loginOrRegisterDto;
    const loginStatus = await this.userService.validateUser({
      email,
      password,
    });
    if (!loginStatus.success) {
      throw new BadRequestException({
        error: loginStatus.error,
      });
    }
    return loginStatus;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async handleRequestGetMe(@UserDecorator() user: User) {
    return { user };
  }

  @UseGuards(JwtAuthGuard)
  @Post('me-extended')
  async handleRequestMeExtended(
    @UserDecorator() user: User,
    @Body() meExtendedDto: MeExtendedDto
  ) {
    const { extend } = meExtendedDto;
    return await this.userService.getMeExtended(user.id, extend);
  }

  @UseGuards(JwtAuthGuard)
  @Post('cancel-all-active')
  async handleRequestCancelAllActive(@UserDecorator() user: User) {
    return this.userService.cancelAllActive(user.id);
  }
}
