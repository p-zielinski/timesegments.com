import { Body, Controller, Post } from '@nestjs/common';
import { CreateNewUserDto } from './dto/createNewUser.dto';
import { UserService } from './user.service';

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
}
