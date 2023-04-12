import { HttpException, HttpStatus } from '@nestjs/common';
import { Prisma, Token, User } from '@prisma/client';
import { prisma } from './prisma.service';

const isDate = (date: object) => {
  return date instanceof Date && !isNaN(date.valueOf());
};

export const generateToken = async (
  userId: string,
  expiresAt: string | Date
): Promise<Token> => {
  if (!!expiresAt && typeof expiresAt !== 'string' && !isDate(expiresAt)) {
    throw new HttpException({}, HttpStatus.BAD_REQUEST);
  }
  try {
    const token = await prisma.token.create({
      data: {
        userId: userId,
        expiresAt: expiresAt,
      },
    });
    if (!token?.id) {
      throw new HttpException({}, HttpStatus.BAD_REQUEST);
    }
    return token;
  } catch (e) {
    // this.loggerService.error(e.message);
    throw new HttpException({}, HttpStatus.BAD_REQUEST);
  }
};

export const deleteUsersTokensButOne = async (tokenId: string, user: User) => {
  const tokens = await findUsersTokens(user.id);
  const tokensToDelete = tokens
    .map((token) => token.id)
    .filter((_tokenId) => _tokenId !== tokenId);
  if (tokensToDelete.length > 0) {
    await deleteManyTokens(tokensToDelete);
  }
  return {
    success: true,
    message: `Other tokens were successfully deleted`,
  };
};

export const deleteSingleToken = async (tokenId: string, user: User) => {
  const token = await findOneToken(tokenId, { user: true });
  if (!token || token?.user?.id !== user.id) {
    return {
      success: false,
      error: `Token not found, bad request`,
    };
  }
  const deleteResult = await deleteOneToken(tokenId);
  if (!deleteResult?.id) {
    return {
      success: false,
      error: `Could not delete token`,
    };
  }
  return {
    success: true,
    message: `Token "${tokenId}" was deleted`,
  };
};

export const findUsersTokens = async (userId: string) => {
  return (
    (
      (await prisma.user.findFirst({
        where: { id: userId },
        include: { tokens: true },
      })) || {}
    )?.tokens || []
  );
};

export const findOneToken = (
  tokenId: string,
  include: Prisma.TokenInclude = null
) => {
  return prisma.token.findFirst({
    where: { id: tokenId },
    include,
  });
};

export const deleteOneToken = async (tokenId: string) => {
  return await prisma.token.delete({
    where: { id: tokenId },
  });
};

export const deleteManyTokens = async (
  tokenIds: string[]
): Promise<{ count?: number }> => {
  return await prisma.token.deleteMany({
    where: { id: { in: tokenIds } },
  });
};
