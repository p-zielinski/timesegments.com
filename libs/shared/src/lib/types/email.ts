import { Prisma } from '@prisma/client';

const emailWithUser = Prisma.validator<Prisma.EmailArgs>()({
  include: { user: true },
});

export type EmailWithUser = Prisma.EmailGetPayload<typeof emailWithUser>;
