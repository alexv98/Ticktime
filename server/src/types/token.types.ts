import { Prisma } from '@prisma/client';

export type IToken = Prisma.TokenGetPayload<{}>;

export type SaveTokenProps = Omit<IToken, 'id'>;

export type TokenBodyProps = {
  email: string;
  id: number;
  isActivated: boolean;
};
