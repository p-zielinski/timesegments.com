import { Module } from '@nestjs/common';

import { AppService } from './app.service';
import { UserService } from './api/user/user.service';
import { PrismaService } from './prisma.service';
import { PrismaModule } from 'nestjs-prisma';
import { PrismaClient } from '@prisma/client';
import { UserController } from './api/user/user.controller';
import { ConfigModule } from '@nestjs/config';
import { ValidationSchema } from '../configs/validationSchema';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './common/auth/jwt.strategy';
import { TokenService } from './api/token/token.service';
import { LoggerService } from './common/logger/loger.service';
import { CategoryController } from './api/category/category.controller';
import { SubcategoryController } from './api/subcategory/subcategory.controller';
import { SubcategoryService } from './api/subcategory/subcategory.service';
import { CategoryService } from './api/category/category.service';
import { TimeLogService } from './api/time-log/time-log.service';
import { TokenController } from './api/token/token.controller';
import { TimeLogController } from './api/time-log/time-log.controller';

@Module({
  imports: [
    PrismaModule.forRoot({
      isGlobal: true,
    }),
    ConfigModule.forRoot({
      validationSchema: ValidationSchema,
    }),
    JwtModule.register({
      secret: process.env['JWT' + '_SECRET'],
      signOptions: { noTimestamp: true },
    }),
  ],
  controllers: [
    UserController,
    CategoryController,
    SubcategoryController,
    TokenController,
    TimeLogController,
  ],
  providers: [
    LoggerService,
    JwtStrategy,
    AppService,
    PrismaService,
    UserService,
    PrismaClient,
    TokenService,
    SubcategoryService,
    CategoryService,
    TimeLogService,
  ],
})
export class AppModule {}
