import Product from '../../models/Product.js';
import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/AppError.js';

export const getProductsByStatus = catchAsync(async (req, res) => {
  const status = req.query.status || 'pending';
  const products = await Product.find({ status });
  res.json(products);
});

export const approveProduct = catchAsync(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id, { status: 'approved', rejectReason: '' }, { new: true });
  if (!product) throw new AppError('Товар не найден', 404);
  res.json(product);
});

export const rejectProduct = catchAsync(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id, { status: 'rejected', rejectReason: req.body.reason }, { new: true });
  if (!product) throw new AppError('Товар не найден', 404);
  res.json(product);
});