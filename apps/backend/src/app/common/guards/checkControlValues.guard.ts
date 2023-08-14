import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ControlValue } from '@test1/shared';
import { ControlValueService } from '../../api/control-value/control-value.service';

@Injectable()
export class ControlValuesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private controlValueService: ControlValueService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const typesOfControlValuesToCheck = this.reflector.get<ControlValue[]>(
      'typesOfControlValuesToCheck',
      context.getHandler()
    );

    if (!typesOfControlValuesToCheck) {
      throw new HttpException(
        { error: `Types of control values to check were not defined` },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    const request = context.switchToHttp().getRequest();
    const { user } = request;
    if (!user) {
      throw new HttpException(
        { error: `User was not defined` },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    const requestControlValues = request?.body?.controlValues || {};
    const userControlValues =
      await this.controlValueService.getAllUserControlValues(user.id);
    const typesOfControlValuesWithIncorrectValues: ControlValue[] = [];
    typesOfControlValuesToCheck.forEach((key) => {
      if (userControlValues[key] !== requestControlValues[key]) {
        typesOfControlValuesWithIncorrectValues.push(key);
      }
    });
    if (typesOfControlValuesWithIncorrectValues.length === 0) {
      return true;
    }
    throw new HttpException(
      {
        error: `Control values were incorrect.`,
        typesOfControlValuesWithIncorrectValues,
      },
      HttpStatus.CONFLICT
    );
  }
}
