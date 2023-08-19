import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Token } from '@prisma/client';

export const ImportantControlValuesDecorator = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Token => {
    const request = ctx.switchToHttp().getRequest();
    return request.importantControlValues;
  }
);
