import express from 'express';
import cors from 'cors';
import authRouter from './src/modules/auth/auth.routes.js';
import orderRouter from './src/modules/orders/order.routes.js';
import productRouter from './src/modules/products/product.routes.js';
import adminRoutes from './src/modules/admin/admin.routes.js';
import { User } from './src/models/User.js';
import { Seller } from './src/models/Seller.js';

export const app = express();

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/orders', orderRouter);
app.use('/api/products', productRouter);
app.use('/api/admin', adminRoutes);

app.get('/api/users', async (req, res) => {
  const users = await User.findAll({
    attributes: { exclude: ['password'] },
    include: [{ model: Seller, attributes: ['id', 'store_name', 'description', 'approved_status'] }],
    order: [['id', 'ASC']]
  });

  res.status(200).json({ status: 'success', count: users.length, data: users });
});

app.get('/api/sellers', async (req, res) => {
  const sellers = await Seller.findAll({
    include: [{ model: User, attributes: ['id', 'name', 'email', 'role'] }],
    order: [['id', 'ASC']]
  });

  res.status(200).json({ status: 'success', count: sellers.length, data: sellers });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Бэкенд маркетплейса запущен!' });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: err.status || 'error',
    message: err.message || 'Внутренняя ошибка сервера',
  });
});
