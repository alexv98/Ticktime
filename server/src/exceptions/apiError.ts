import { ValidationError } from 'express-validator';

interface CustomError {
  msg: string;
  location?: string;
  param?: string;
}

export default class ApiError extends Error {
  statusCode: number;
  errors: CustomError[];

  constructor(statusCode: number, message: string, errors: CustomError[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }

  static UnauthorizedError() {
    return new ApiError(401, 'Пользователь не авторизован');
  }

  static BadRequest(message: string, errors?: ValidationError[]) {
    return new ApiError(400, message, errors ? errors.map((error) => ({ msg: error.msg })) : []);
  }
}
