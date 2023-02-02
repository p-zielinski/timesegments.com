/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { RemovePasswordKeyFromResponse } from './app/common/interceptor/removePasswordKeyFromResponse.interceptor';
import { RemoveSuccessKeyFromResponse } from './app/common/interceptor/removeSuccessKeyFromResponse.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3333;
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalInterceptors(new RemovePasswordKeyFromResponse());
  app.useGlobalInterceptors(new RemoveSuccessKeyFromResponse());
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
