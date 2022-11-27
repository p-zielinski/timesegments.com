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

//nx g @nrwl/nest:service --project backend --directory app/api

@Module({
  imports: [
    PrismaModule.forRoot({
      isGlobal: true,
    }),
    ConfigModule.forRoot({
      validationSchema: ValidationSchema,
    }),
  ],
  controllers: [AppController, UserController],
  providers: [AppService, PrismaService, UserService, PrismaClient],
})
export class AppModule {}
