import {
  registerDecorator,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { ValidationOptions } from 'joi';

@ValidatorConstraint({ async: true })
export class IsScheduleToken implements ValidatorConstraintInterface {
  constructor(private readonly configService: ConfigService) {}

  validate(value: any) {
    return value === this.configService.get<number>('SCHEDULE_TOKEN');
  }

  defaultMessage(args: ValidationArguments): string {
    return `Provided '${args.property}' value is not valid`;
  }
}

export function ScheduleToken(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsScheduleToken,
    });
  };
}
