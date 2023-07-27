import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class ControlValueService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    (async () => {
      await this.cacheManager.set('key', 'value', 10000);
      await new Promise((r) => setTimeout(r, 2000));
      console.log(await this.cacheManager.get('key'));
    })();
  }
}
