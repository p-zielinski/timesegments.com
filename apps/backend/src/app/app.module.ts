import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
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

//nx g @nrwl/nest:service --project backend --directory app/api

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
  ],
  controllers: [AppController, UserController],
  providers: [
    LoggerService,
    JwtStrategy,
    AppService,
    PrismaService,
    UserService,
    PrismaClient,
    TokenService,
  ],
})
export class AppModule {}
