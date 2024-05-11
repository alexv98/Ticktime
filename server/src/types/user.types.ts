import { Prisma } from '@prisma/client';

export type IUser = Prisma.UserGetPayload<{}>;
