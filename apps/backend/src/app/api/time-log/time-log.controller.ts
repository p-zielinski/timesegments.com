import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/auth/jwtAuth.guard';
import { UserDecorator } from '../../common/param-decorators/user.decorator';
import { User } from '@prisma/client';
import { TimeLogService } from './time-log.service';
import { FromToDatesDto } from './dto/fromToDates.dto';

@Controller('time-log')
export class TimeLogController {
  constructor(private timeLogService: TimeLogService) {}

  @UseGuards(JwtAuthGuard)
  @Post('find')
  async handleRequestGetAll(
    @UserDecorator() user: User,
    @Body() fromToDatesDto: FromToDatesDto
  ) {
    const { from, to } = fromToDatesDto;
    console.log(from, to);
    return await this.timeLogService.findFromToTimeLogs(user, from, to);
  }
}
