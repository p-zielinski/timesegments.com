import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ControlValue } from '@test1/shared';
import { nanoid } from 'nanoid';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ControlValueService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService
  ) {}

  environment = this.configService.get<string>('ENVIRONMENT');

  public async getAllUserControlValues(
    userId: string
  ): Promise<Record<ControlValue, string>> {
    const controlValues = await this.cacheManager.get(
      this.environment + userId
    );
    if (controlValues instanceof Object) {
      return controlValues as Record<ControlValue, string>;
    }
    const newControlValue = Object.fromEntries(
      Object.values(ControlValue).map((value) => [value, nanoid()])
    );
    await this.cacheManager.set(this.environment + userId, newControlValue);
    return newControlValue as Record<ControlValue, string>;
  }

  public async getNewControlValues(
    userId: string,
    types: ControlValue[]
  ): Promise<Record<ControlValue, string>> {
    const controlValues = await this.getAllUserControlValues(userId);
    const newControlValue = Object.fromEntries(
      types.map((controlValueType) => [controlValueType, nanoid()])
    );
    await this.cacheManager.set(this.environment + userId, {
      ...controlValues,
      ...newControlValue,
    });
    return newControlValue as Record<ControlValue, string>;
  }

  public async getPartialControlValues(
    userId: string,
    types: ControlValue[]
  ): Promise<Record<ControlValue, string>> {
    const controlValues = await this.getAllUserControlValues(userId);
    const partialControlValue = {};
    types.forEach(
      (controlValueType) =>
        (partialControlValue[controlValueType] =
          controlValues[controlValueType])
    );
    return partialControlValue as Record<ControlValue, string>;
  }
}
