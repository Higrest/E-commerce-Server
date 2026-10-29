import { Product } from '../../models/Product.js';
import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/AppError.js';

export const getProductsByStatus = catchAsync(async (req, res) => {
  const status = req.query.status || 'pending';
  const products = await Product.findAll({ where: { status } });
  res.json(products);
});

export const approveProduct = catchAsync(async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) throw new AppError('Товар не найден', 404);
  await product.update({ status: 'approved', rejectReason: null });
  res.json(product);
});

export const rejectProduct = catchAsync(async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) throw new AppError('Товар не найден', 404);
  await product.update({ status: 'rejected', rejectReason: req.body.reason });
  res.json(product);
});