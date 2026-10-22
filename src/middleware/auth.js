import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Seller } from '../models/Seller.js';

// Хелпер для создания кастомных ошибок, если еще не создан AppError.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware для аутентификации пользователя (Проверка JWT)
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Получаем токен из заголовков запроса
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Вы не авторизованы. Пожалуйста, войдите в систему.', 401));
    }

    // 2. Верификация токена
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key_for_mini_marketplace_2026');

    // 3. Проверяем, существует ли еще пользователь, которому принадлежит токен
    const currentUser = await User.findByPk(decoded.id, {
      include: decoded.role === 'seller' ? [{ model: Seller }] : []
    });

    if (!currentUser) {
      return next(new AppError('Пользователь, принадлежащий этому токену, больше не существует.', 401));
    }

    // 4. Сохраняем данные пользователя в объект запроса для следующих middleware
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Неверный токен. Пожалуйста, войдите заново.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Время действия токена истекло. Пожалуйста, войдите заново.', 401));
    }
    next(error);
  }
};

/**
 * Middleware для ограничения доступа на основе Ролей (RBAC)
 * @param  {...string} roles - Список разрешенных ролей, например: 'admin', 'seller'
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // req.user берется из предыдущего middleware 'protect'
    if (!roles.includes(req.user.role)) {
      return next(new AppError('У вас нет прав для выполнения этого действия.', 403));
    }
    next();
  };
};
export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return next(new AppError('Нет доступа', 403));
  }
  next();
};
