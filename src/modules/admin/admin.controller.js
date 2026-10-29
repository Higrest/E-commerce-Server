import { Product } from '../../models/Product.js';
import { User } from '../../models/User.js';
import { Seller } from '../../models/Seller.js';
import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/AppError.js';

export const getProductsByStatus = catchAsync(async (req, res) => {
  const status = req.query.status || 'pending';
  const products = await Product.findAll({ where: { status } });
  res.json(products);
});

export const getAllUsers = catchAsync(async (req, res) => {
  const users = await User.findAll({
    attributes: { exclude: ['password'] },
    include: [{
      model: Seller,
      attributes: ['id', 'store_name', 'description', 'approved_status']
    }],
    order: [['id', 'ASC']]
  });

  res.status(200).json({
    status: 'success',
    count: users.length,
    data: users
  });
});

export const getAllSellers = catchAsync(async (req, res) => {
  const sellers = await Seller.findAll({
    include: [{
      model: User,
      attributes: ['id', 'name', 'email', 'role']
    }],
    order: [['id', 'ASC']]
  });

  res.status(200).json({
    status: 'success',
    count: sellers.length,
    data: sellers
  });
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