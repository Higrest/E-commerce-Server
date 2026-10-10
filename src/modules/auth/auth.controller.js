import jwt from 'jsonwebtoken';
import { User } from '../../models/User.js';
import { Seller } from '../../models/Seller.js';

const signToken = (id, role) => {
  return jwt.sign(
    { id, role }, 
    process.env.JWT_SECRET || 'super_secret_key_for_mini_marketplace_2026', 
    { expiresIn: '30d' }
  );
};

export const register = async (req, res, next) => {
  try {
    console.log('=== БЭКЕНД: Получен запрос на регистрацию ===');
    const { name, email, password, role, store_name, description } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Имя, email и пароль обязательны' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ status: 'fail', message: 'Этот email уже зарегистрирован' });
    }

    // Сопоставляем роль 'user' с 'customer' для базы данных
    let dbRole = role;
    if (!role || role === 'user') dbRole = 'customer';

    const newUser = await User.create({
      name,
      email,
      password,
      role: dbRole
    });

    if (newUser.role === 'seller') {
      if (!store_name) {
        return res.status(400).json({ status: 'fail', message: 'Для регистрации продавца необходимо указать название магазина' });
      }
      await Seller.create({
        user_id: newUser.id,
        store_name,
        description: description || ''
      });
    }

    const token = signToken(newUser.id, newUser.role);
    newUser.password = undefined;

    res.status(201).json({
      status: 'success',
      token,
      data: { user: newUser }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Пожалуйста, введите email и пароль' });
    }

    const user = await User.findOne({ where: { email } });
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ status: 'fail', message: 'Неверный email или пароль' });
    }

    const token = signToken(user.id, user.role);
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
