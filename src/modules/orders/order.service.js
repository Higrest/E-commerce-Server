import { sequelize } from '../../config/db.js';
import { Order } from '../../models/Order.js';
import { OrderItem } from '../../models/OrderItem.js';
import { Product } from '../../models/Product.js';

const ALLOWED_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: []
};

export const createOrderService = async (userId, items, shippingAddress) => {
  const transaction = await sequelize.transaction();

  try {
    let totalPrice = 0;
    const itemsToCreate = [];

    for (const item of items) {
      const product = await Product.findByPk(item.product_id, { transaction });

      if (!product) {
        throw new Error(`Товар с ID ${item.product_id} не найден`);
      }

      if (product.stock_quantity < item.quantity) {
        throw new Error(`Недостаточно товара ${product.name} на складе. Доступно: ${product.stock_quantity}`);
      }

      product.stock_quantity -= item.quantity;
      await product.save({ transaction });

      const itemPrice = product.price * item.quantity;
      totalPrice += itemPrice;

      itemsToCreate.push({
        product_id: product.id,
        quantity: item.quantity,
        price: product.price
      });
    }

    const newOrder = await Order.create({
      user_id: userId,
      total_price: totalPrice,
      shipping_address: shippingAddress,
      status: 'pending',
      payment_status: 'unpaid'
    }, { transaction });

    for (const orderItem of itemsToCreate) {
      orderItem.order_id = newOrder.id;
      await OrderItem.create(orderItem, { transaction });
    }

    await transaction.commit();
    return newOrder;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const updateOrderStatusService = async (orderId, newStatus) => {
  const transaction = await sequelize.transaction();

  try {
    const order = await Order.findByPk(orderId, { transaction });
    if (!order) {
      throw new Error('Заказ не найден');
    }

    const currentStatus = order.status.toLowerCase();
    const targetStatus = newStatus.toLowerCase();

    if (currentStatus === targetStatus) {
      await transaction.rollback();
      return order;
    }

    const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(targetStatus)) {
      throw new Error(`Невозможный переход из статуса ${order.status} в статус ${newStatus}`);
    }

    if (targetStatus === 'cancelled') {
      const orderItems = await OrderItem.findAll({ where: { order_id: order.id }, transaction });
      for (const item of orderItems) {
        const product = await Product.findByPk(item.product_id, { transaction });
        if (product) {
          product.stock_quantity += item.quantity;
          await product.save({ transaction });
        }
      }
    }

    order.status = targetStatus;
    await order.save({ transaction });

    await transaction.commit();
    return order;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
