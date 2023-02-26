import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/auth/jwtAuth.guard';
import { UserDecorator } from '../../common/param-decorators/user.decorator';
import { User } from '@prisma/client';
import { TimeLogService } from './time-log.service';

@Controller('time-log')
export class TimeLogController {
  constructor(private timeLogService: TimeLogService) {}

  @UseGuards(JwtAuthGuard)
  @Get('get-all')
  async handleRequestGetAll(@UserDecorator() user: User) {
    return await this.timeLogService.findAll(user.id);
  }
}
