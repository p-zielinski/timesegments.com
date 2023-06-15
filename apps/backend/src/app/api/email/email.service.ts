import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from '@prisma/client';

@Injectable()
export class EmailService {
  constructor(private userService: UserService) {}

  public resendConfirmationEmail(user: User) {}
}
