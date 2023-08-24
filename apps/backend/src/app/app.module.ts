import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AppService } from './app.service';
import { UserService } from './api/user/user.service';
import { PrismaService } from './prisma.service';
import { PrismaModule } from 'nestjs-prisma';
import { PrismaClient } from '@prisma/client';
import { UserController } from './api/user/user.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ValidationSchema } from '../configs/validationSchema';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './api/token/token.service';
import { LoggerService } from './common/logger/loger.service';
import { CategoryController } from './api/category/category.controller';
import { CategoryService } from './api/category/category.service';
import { TimeLogService } from './api/time-log/time-log.service';
import { TokenController } from './api/token/token.controller';
import { TimeLogController } from './api/time-log/time-log.controller';
import { NoteController } from './api/note/note.controller';
import { NoteService } from './api/note/note.service';
import { EmailService } from './api/email/email.service';
import { EmailController } from './api/email/email.controller';
import { ControlValueService } from './api/control-value/control-value.service';
import * as redisStore from 'cache-manager-redis-store';
import { ResponseService } from './api/response/response.service';

@Module({
  imports: [
    PrismaModule.forRoot({
      isGlobal: true,
    }),
    ConfigModule.forRoot({
      validationSchema: ValidationSchema,
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { noTimestamp: true },
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get<string>('REDIS_HOST'),
        username: configService.get<string>('REDIS_USERNAME'),
        password: configService.get<string>('REDIS_PASSWORD'),
        port: configService.get<number>('REDIS_PORT'),
        ttl: 1000 * 60 * 60 * 24 * 7, //milliseconds
        tls: configService.get<boolean>('REDIS_TLS'),
      }),
      isGlobal: true,
    }),
  ],
  controllers: [
    UserController,
    CategoryController,
    TokenController,
    TimeLogController,
    NoteController,
    EmailController,
  ],
  providers: [
    LoggerService,
    AppService,
    PrismaService,
    UserService,
    PrismaClient,
    TokenService,
    CategoryService,
    TimeLogService,
    NoteService,
    EmailService,
    ControlValueService,
    ResponseService,
  ],
})
export class AppModule {}
