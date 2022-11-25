import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
//https://github.com/prisma/prisma-examples/tree/latest/typescript/rest-nestjs
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {
    (async () => {
      console.log(this.prisma.User.create({ password: 'aaa', name: 'sdsd' }));
    })();
  }
}
