import { sequelize } from './src/config/db.js';
import { User } from './src/models/User.js';

const email = process.argv[2];
const user = await User.findOne({ where: { email } });

if (!user) {
  console.log('Пользователь не найден');
  process.exit(1);
}

await user.update({ role: 'admin' });
console.log('Готово:', user.email, 'теперь admin');
await sequelize.close();