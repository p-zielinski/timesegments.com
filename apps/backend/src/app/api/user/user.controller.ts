import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { LoginOrRegisterDto } from './dto/loginOrRegister.dto';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { UserDecorator } from '../../common/paramDecorators/user.decorator';
import { User } from '.prisma/client/index';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('register')
  async handleRequestCreateNewUser(
    @Body() loginOrRegisterDto: LoginOrRegisterDto
  ) {
    const { email, password } = loginOrRegisterDto;
    return await this.userService.createNewUser(
      { email, plainPassword: password },
      { generateToken: true }
    );
  }

  @Post('login')
  async handleRequestLogin(@Body() loginOrRegisterDto: LoginOrRegisterDto) {
    const { email, password } = loginOrRegisterDto;
    return await this.userService.validateUser({
      email,
      password,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@UserDecorator() user: User) {
    return user;
  }
}
