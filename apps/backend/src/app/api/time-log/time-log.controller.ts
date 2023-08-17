import {
  BadRequestException,
  Body,
  Controller,
  Post,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwtAuth.guard';
import { UserDecorator } from '../../common/param-decorators/user.decorator';
import { User } from '@prisma/client';
import { TimeLogService } from './time-log.service';
import { FromToDatesDto } from './dto/fromToDates.dto';
import { CreateTimeLogDto } from './dto/createTimeLog.dto';
import { ControlValue } from '@test1/shared';
import { ControlValueService } from '../control-value/control-value.service';
import { ControlValuesGuard } from '../../common/guards/checkControlValues.guard';
import { EditTimeLogDto } from './dto/editTimeLog.dto';

@Controller('time-log')
export class TimeLogController {
  constructor(
    private timeLogService: TimeLogService,
    private controlValueService: ControlValueService
  ) {}

  @Post('find-extended')
  @SetMetadata('typesOfControlValuesToCheck', [ControlValue.TIME_LOGS])
  @UseGuards(JwtAuthGuard, ControlValuesGuard)
  async handleRequestGetAll(
    @UserDecorator() user: User,
    @Body() fromToDatesDto: FromToDatesDto
  ) {
    const { periods, alreadyKnownCategories } = fromToDatesDto;
    const findFromToTimeLogsResult =
      await this.timeLogService.findMultiplePeriodsTimeLogsEnrichedWithCategories(
        user,
        periods,
        alreadyKnownCategories
      );
    return {
      ...findFromToTimeLogsResult,
      partialControlValues:
        await this.controlValueService.getPartialControlValues(user.id, [
          ControlValue.TIME_LOGS,
        ]),
    };
  }

  @Post('edit')
  @SetMetadata('typesOfControlValuesToCheck', [ControlValue.TIME_LOGS])
  @UseGuards(JwtAuthGuard, ControlValuesGuard)
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
    return {
      ...editTimeLogResult,
      partialControlValues: await this.controlValueService.getNewControlValues(
        user.id,
        [ControlValue.TIME_LOGS]
      ),
    };
  }

  @Post('create')
  @SetMetadata('typesOfControlValuesToCheck', [ControlValue.TIME_LOGS])
  @UseGuards(JwtAuthGuard, ControlValuesGuard)
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
    return {
      ...createTimeLogResult,
      partialControlValues: await this.controlValueService.getNewControlValues(
        user.id,
        [ControlValue.TIME_LOGS]
      ),
    };
  }
}
