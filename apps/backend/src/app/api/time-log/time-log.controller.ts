import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/auth/jwtAuth.guard';
import { UserDecorator } from '../../common/param-decorators/user.decorator';
import { User } from '@prisma/client';
import { TimeLogService } from './time-log.service';
import { FromToDatesDto } from './dto/fromToDates.dto';
import { CreateTimeLogDto } from './dto/createTimeLog.dto';
import { EditTimeLogDto } from './dto/editTimeLog.dto';

@Controller('time-log')
export class TimeLogController {
  constructor(private timeLogService: TimeLogService) {}

  @UseGuards(JwtAuthGuard)
  @Post('find-extended')
  async handleRequestGetAll(
    @UserDecorator() user: User,
    @Body() fromToDatesDto: FromToDatesDto
  ) {
    const { from, to } = fromToDatesDto;
    const findFromToTimeLogsResult =
      await this.timeLogService.findFromToTimeLogsEnrichedWithCategories(
        user,
        from,
        to
      );
    if (findFromToTimeLogsResult.success === false) {
      throw new BadRequestException({
        error: findFromToTimeLogsResult.error,
      });
    }
    return findFromToTimeLogsResult;
  }

  @UseGuards(JwtAuthGuard)
  @Post('edit')
  async handleRequestEditTimeLg(
    @UserDecorator() user: User,
    @Body() editTimeLogDto: EditTimeLogDto
  ) {
    const { timeLogId, from, to } = editTimeLogDto;
    const editTimeLogResult = await this.timeLogService.editTimeLog(
      user,
      timeLogId,
      from,
      to
    );
    if (editTimeLogResult.success === false) {
      throw new BadRequestException({
        error: editTimeLogResult.error,
      });
    }
    return editTimeLogResult;
  }

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async handleRequestCreateTimeLog(
    @UserDecorator() user: User,
    @Body() createTimeLogDto: CreateTimeLogDto
  ) {
    const { categoryId, from, to } = createTimeLogDto;
    const createTimeLogResult = await this.timeLogService.createTimeLog(
      user,
      categoryId,
      from,
      to
    );
    if (createTimeLogResult.success === false) {
      throw new BadRequestException({
        error: createTimeLogResult.error,
      });
    }
    return createTimeLogResult;
  }
}
