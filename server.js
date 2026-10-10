import dotenv from 'dotenv';
import { app } from './app.js';
import { sequelize } from './src/config/db.js';

import './src/models/User.js';
import './src/models/Seller.js';
import './src/models/Category.js';
import './src/models/Product.js';
import './src/models/Order.js';
import './src/models/OrderItem.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('=== База данных успешно подключена (Sequelize) ===');
    
    await sequelize.sync({ force: false });
    console.log('=== Таблицы базы данных успешно синхронизированы ===');
    
    app.listen(PORT, () => {
      console.log(`=== Сервер маркетплейса запущен на порту: ${PORT} ===`);
    });
  } catch (error) {
    console.error('Критическая ошибка при запуске сервера:', error);
    process.exit(1);
  }
}

startServer();
