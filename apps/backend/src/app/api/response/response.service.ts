import { BadRequestException, Injectable } from '@nestjs/common';
import { ControlValueService } from '../control-value/control-value.service';
import { ControlValue } from '@test1/shared';
import { LoggerService } from '../../common/logger/loger.service';

@Injectable()
export class ResponseService {
  constructor(
    private loggerService: LoggerService,
    private controlValueService: ControlValueService
  ) {}

  public returnProperResponse = async (
    response: Record<string, any>,
    sendPartialControlValuesData?: {
      userId: string;
      importantControlValues: ControlValue[];
    }
  ) => {
    if (response.success === false) {
      throw new BadRequestException(response);
    }
    if (!sendPartialControlValuesData) {
      return response;
    }
    const { userId, importantControlValues } = sendPartialControlValuesData;
    return {
      ...response,
      partialControlValues: await this.controlValueService.getNewControlValues(
        userId,
        importantControlValues
      ),
    };
  };
}
