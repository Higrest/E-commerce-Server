import bcrypt from 'bcryptjs';
import { sequelize } from './src/config/db.js';
import './src/models/User.js';
import './src/models/Seller.js';
import { User } from './src/models/User.js';
import { Seller } from './src/models/Seller.js';

async function resetDemoUsers() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    await Seller.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });

    const normalUser = await User.create({
      name: 'Обычный пользователь',
      email: 'user@example.com',
      password: '123456',
      role: 'user'
    });

    const sellerUser = await User.create({
      name: 'Продавец',
      email: 'seller@example.com',
      password: '123456',
      role: 'seller'
    });

    await Seller.create({
      user_id: sellerUser.id,
      store_name: 'Mini Market Store',
      description: 'Основной демонстрационный магазин',
      approved_status: 'approved'
    });

    const users = await User.findAll({ attributes: ['id', 'name', 'email', 'role'] });
    const sellers = await Seller.findAll({ attributes: ['id', 'user_id', 'store_name', 'approved_status'] });

    console.log('=== Сброс пользователей выполнен ===');
    console.log('Users:', JSON.stringify(users, null, 2));
    console.log('Sellers:', JSON.stringify(sellers, null, 2));

    console.log('Записи в БД после очистки:');
    console.log('User count:', await User.count());
    console.log('Seller count:', await Seller.count());

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Ошибка при очистке пользователей:', error);
    process.exit(1);
  }
}

resetDemoUsers();
