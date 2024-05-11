import jwt, { Secret } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { SaveTokenProps, TokenBodyProps } from '../../types/token.types';

dotenv.config();

const prisma: PrismaClient = new PrismaClient();

interface ITokenService {
  generateToken(payload: TokenBodyProps): Promise<{ refreshToken: string; accessToken: string }>;
  validateAccessToken(token: string): any;
  validateRefreshToken(token: string): any;
  saveToken(payload: SaveTokenProps): Promise<string>;
  removeToken(userId: string): Promise<void>;
  findToken(token: string): Promise<any> | null;
}

const jwtAccessSecret: Secret | undefined = process.env.JWT_ACCESS_SECRET;
const jwtRefreshSecret: Secret | undefined = process.env.JWT_REFRESH_SECRET;

class TokenService implements ITokenService {
  // Функция для генерации токенов
  async generateToken(payload: TokenBodyProps) {
    if (!jwtAccessSecret || !jwtRefreshSecret) {
      throw new Error('JWT access or refresh secret is not defined');
    }

    const accessToken = jwt.sign(payload, jwtAccessSecret, {
      expiresIn: '15m',
    });
    const refreshToken = jwt.sign(payload, jwtRefreshSecret, {
      expiresIn: '15d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  // Функция для проверки access-токена
  validateAccessToken(token: string) {
    try {
      if (!jwtAccessSecret || !jwtRefreshSecret) {
        throw new Error('JWT access or refresh secret is not defined');
      }

      return jwt.verify(token, jwtAccessSecret);
    } catch (e) {
      return null;
    }
  }

  // Функция для проверки refresh-токена
  validateRefreshToken(token: string) {
    try {
      if (!jwtAccessSecret || !jwtRefreshSecret) {
        throw new Error('JWT access or refresh secret is not defined');
      }

      return jwt.verify(token, jwtRefreshSecret);
    } catch (e) {
      return null;
    }
  }

  // Функция для обновления/создания refresh-токена
  async saveToken({ userId, refreshToken }: SaveTokenProps) {
    const candidate = await prisma.token.findFirst({
      where: {
        userId,
      },
    });

    if (candidate) {
      await prisma.token.update({
        where: {
          id: candidate.id,
        },
        data: {
          refreshToken: refreshToken,
        },
      });
      return refreshToken;
    }

    // Если заходит впервые...
    const token = await prisma.token.create({
      data: {
        userId: userId,
        refreshToken: refreshToken,
      },
    });
    return token.refreshToken;
  }

  // Функция для удаления refresh-токена из БД
  async removeToken(refreshToken: string) {
    await prisma.token.delete({
      where: {
        refreshToken,
      },
    });
  }

  // Функция для поиска токена
  async findToken(refreshToken: string) {
    return prisma.token.findFirst({
      where: {
        refreshToken,
      },
    });
  }
}
export default new TokenService();
