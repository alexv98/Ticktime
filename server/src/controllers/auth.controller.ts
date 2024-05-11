import { Request, Response, NextFunction } from 'express';
import authService from '../services/authServices/auth.service';
import dotenv from 'dotenv';
import { validationResult } from 'express-validator';
import ApiError from '../exceptions/apiError';
import AuthService from '../services/authServices/auth.service';
dotenv.config();

interface IAuthController {
  registration(req: Request, res: Response, next: NextFunction): Promise<void>;
  login(req: Request, res: Response, next: NextFunction): Promise<void>;
  logout(req: Request, res: Response, next: NextFunction): Promise<void>;
  activateAccount(req: Request, res: Response, next: NextFunction): Promise<void>;
  refreshToken(req: Request, res: Response, next: NextFunction): Promise<void>;
}

class AuthController implements IAuthController {
  // Регистрация
  async registration(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка валидации', errors.array()));
      }
      const { email, password, name } = req.body;

      const userData = await authService.registration({ email, password, name });
      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: 15 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  // Авторизация
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const userData = await AuthService.login({ email, password });
      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: 15 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  // Выход из аккаунта
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.cookies;
      await authService.logout(refreshToken);
      res.clearCookie('refreshToken');
      res.status(200);
    } catch (e) {
      next(e);
    }
  }

  // Активация аккаунта
  async activateAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const activationLink = req.params.link;
      await authService.activateAccount(activationLink);
      res.redirect(process.env.CLIENT_URL!);
    } catch (e) {
      next(e);
    }
  }

  // Обновление токенов
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.cookies;
      const userData = await authService.refreshTokens(refreshToken);
      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: 15 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      res.json(userData);
    } catch (e) {
      next(e);
    }
  }
}

export default new AuthController();
