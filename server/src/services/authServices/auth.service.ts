import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import mailService from './mail.service';
import tokenService from './token.service';
import UserDto from '../../dtos/user.dto';
import ApiError from '../../exceptions/apiError';
import { AuthDataType, LoginDataType } from '../../types/auth.types';
import { IUser } from '../../types/user.types';

const prisma: PrismaClient = new PrismaClient();

interface IAuthService {
  registration(authData: AuthDataType): Promise<any>;
  login(authData: LoginDataType): Promise<any>;
  logout(refreshToken: string): Promise<void>;
  activateAccount(activationLink: string): Promise<any>;
  refreshTokens(refreshToken: string): Promise<any>;
}

class AuthService implements IAuthService {
  // Функция для регистрации
  async registration({ email, password, name }: AuthDataType): Promise<any> {
    const candidate = await prisma.user.findFirst({
      where: { email: email },
    });

    if (candidate) {
      throw ApiError.BadRequest('Пользователь с таким email уже существует');
    }

    const hashPassword = await bcrypt.hash(password, 3);
    const activationLink = uuidv4();

    const user: IUser = await prisma.user.create({
      data: {
        email,
        password: hashPassword,
        name,
        isActivated: false,
        activationLink: activationLink,
      },
    });

    await mailService.sendActivationMail(email, activationLink);

    const userDto = new UserDto(user);
    const tokens = await tokenService.generateToken({ ...userDto });
    await tokenService.saveToken({
      userId: userDto.id,
      refreshToken: tokens.refreshToken,
    });

    return {
      ...tokens,
      user: userDto,
    };
  }

  // Функция для входа в аккаунт
  async login({ email, password }: LoginDataType): Promise<any> {
    const user = await prisma.user.findFirst({
      where: { email: email },
    });

    if (!user) {
      throw ApiError.BadRequest('Пользователь с таким email не найден');
    }

    const isPassEquals = await bcrypt.compare(password, user.password);
    if (!isPassEquals) {
      throw ApiError.BadRequest('Неверный логин или пароль');
    }

    const userDto = new UserDto(user);
    const tokens = await tokenService.generateToken({ ...userDto });
    await tokenService.saveToken({
      userId: userDto.id,
      refreshToken: tokens.refreshToken,
    });

    return {
      ...tokens,
      user: userDto,
    };
  }

  // Функция для выхода из аккаунта
  async logout(refreshToken: string): Promise<void> {
    return await tokenService.removeToken(refreshToken);
  }

  // Функция для обновления токенов
  async refreshTokens(refreshToken: string): Promise<any> {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }

    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);

    if (!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedError();
    }

    const user = await prisma.user.findFirst({
      where: {
        id: tokenFromDb.userId,
      },
    });
    const userDto = new UserDto(user!);
    const tokens = await tokenService.generateToken({ ...userDto });
    await tokenService.saveToken({
      userId: userDto.id,
      refreshToken: tokens.refreshToken,
    });

    return {
      ...tokens,
      user: userDto,
    };
  }

  // Функция для активации аккаунта
  async activateAccount(activationLink: string): Promise<any> {
    const user = await prisma.user.findFirst({
      where: {
        activationLink: activationLink,
      },
    });

    if (!user) {
      throw ApiError.BadRequest('Некорректная ссылка активации');
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isActivated: true,
      },
    });
  }
}

export default new AuthService();
