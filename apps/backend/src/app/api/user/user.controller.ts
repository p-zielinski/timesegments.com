import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CreateNewUserDto } from './dto/createNewUser.dto';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  async handleRequestCreateNewUser(@Body() createNewUserDto: CreateNewUserDto) {
    const { email, password } = createNewUserDto;
    return await this.userService.createNewUser(
      { email, plainPassword: password },
      { generateToken: true }
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async test() {
    console.log('11');
  }
}
