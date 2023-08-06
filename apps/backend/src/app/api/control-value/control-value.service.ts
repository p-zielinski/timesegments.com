import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ControlValue } from '@test1/shared';
import { nanoid } from 'nanoid';

@Injectable()
export class ControlValueService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  public async getAllUserControlValues(
    userId: string
  ): Promise<Record<ControlValue, string>> {
    const controlValues = await this.cacheManager.get(userId);
    if (controlValues instanceof Object) {
      return controlValues as Record<ControlValue, string>;
    }
    const newControlValue = Object.fromEntries(
      Object.values(ControlValue).map((value) => [value, nanoid()])
    );
    await this.cacheManager.set(userId, newControlValue);
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
    await this.cacheManager.set(userId, {
      ...controlValues,
      ...newControlValue,
    });
    return newControlValue as Record<ControlValue, string>;
  }
}