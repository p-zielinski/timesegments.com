import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Token } from '@prisma/client';

export const CurrentTokenDecorator = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Token => {
    const request = ctx.switchToHttp().getRequest();
    return request.user.currentToken;
  }
);