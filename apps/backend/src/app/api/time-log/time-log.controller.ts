import { Body, Controller, Post, SetMetadata, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwtAuth.guard';
import { UserDecorator } from '../../common/param-decorators/user.decorator';
import { User } from '@prisma/client';
import { TimeLogService } from './time-log.service';
import { FromToDatesDto } from './dto/fromToDates.dto';
import { CreateTimeLogDto } from './dto/createTimeLog.dto';
import { ControlValue } from '@test1/shared';
import { ControlValuesGuard } from '../../common/guards/checkControlValues.guard';
import { EditTimeLogDto } from './dto/editTimeLog.dto';
import { ResponseService } from '../response/response.service';
import { ImportantControlValuesDecorator } from '../../common/param-decorators/importantControlValues';

@Controller('time-log')
export class TimeLogController {
  constructor(
    private timeLogService: TimeLogService,
    private responseService: ResponseService
  ) {}

  @Post('find-extended')
  @SetMetadata('typesOfControlValuesToCheck', [ControlValue.TIME_LOGS])
  @UseGuards(JwtAuthGuard, ControlValuesGuard)
  async handleRequestGetAll(
    @UserDecorator() user: User,
    @ImportantControlValuesDecorator() importantControlValues: ControlValue[],
    @Body() fromToDatesDto: FromToDatesDto
  ) {
    const { periods, alreadyKnownCategories } = fromToDatesDto;
    const findFromToTimeLogsResult =
      await this.timeLogService.findMultiplePeriodsTimeLogsEnrichedWithCategories(
        user,
        periods,
        alreadyKnownCategories
      );
    return await this.responseService.returnProperResponse(
      findFromToTimeLogsResult,
      {
        userId: user.id,
        importantControlValues,
      }
    );
  }

  @Post('edit')
  @SetMetadata('typesOfControlValuesToCheck', [ControlValue.TIME_LOGS])
  @UseGuards(JwtAuthGuard, ControlValuesGuard)
  async handleRequestEditTimeLg(
    @UserDecorator() user: User,
    @ImportantControlValuesDecorator() importantControlValues: ControlValue[],
    @Body() editTimeLogDto: EditTimeLogDto
  ) {
    const { timeLogId, from, to } = editTimeLogDto;
    const editTimeLogResult = await this.timeLogService.editTimeLog(
      user,
      timeLogId,
      from,
      to
    );
    return await this.responseService.returnProperResponse(editTimeLogResult, {
      userId: user.id,
      importantControlValues,
    });
  }

  @Post('create')
  @SetMetadata('typesOfControlValuesToCheck', [ControlValue.TIME_LOGS])
  @UseGuards(JwtAuthGuard, ControlValuesGuard)
  async handleRequestCreateTimeLog(
    @UserDecorator() user: User,
    @ImportantControlValuesDecorator() importantControlValues: ControlValue[],
    @Body() createTimeLogDto: CreateTimeLogDto
  ) {
    const { categoryId, from, to } = createTimeLogDto;
    const createTimeLogResult = await this.timeLogService.createTimeLog(
      user,
      categoryId,
      from,
      to
    );
    return await this.responseService.returnProperResponse(
      createTimeLogResult,
      {
        userId: user.id,
        importantControlValues,
      }
    );
  }
}
