import { body } from 'express-validator';

export const validationMiddleware = [
  body('email').isEmail().withMessage('Неверный логин'),
  body('password')
    .isLength({ min: 6, max: 30 })
    .withMessage('Пароль должен содержать как минимум 6 символов'),
];
