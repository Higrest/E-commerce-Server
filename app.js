import express from 'express';
import cors from 'cors';
import authRouter from './src/modules/auth/auth.routes.js';
import orderRouter from './src/modules/orders/order.routes.js';
import productRouter from './src/modules/products/product.routes.js';

export const app = express();

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/orders', orderRouter);
app.use('/api/products', productRouter);

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
