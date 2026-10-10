import { createOrderService, updateOrderStatusService } from './order.service.js';
import { Order } from '../../models/Order.js';
import { OrderItem } from '../../models/OrderItem.js';
import { Product } from '../../models/Product.js';

/**
 * Создание нового заказа (Checkout)
 */
export const createOrder = async (req, res, next) => {
  try {
    const { items, shipping_address } = req.body;
    const userId = req.user.id; // Доступно благодаря middleware 'protect'

    if (!items || items.length === 0) {
      return res.status(400).json({ status: 'fail', message: 'Корзина пуста' });
    }

    if (!shipping_address) {
      return res.status(400).json({ status: 'fail', message: 'Пожалуйста, укажите адрес доставки' });
    }

    // Вызываем сервис создания заказа с транзакцией
    const newOrder = await createOrderService(userId, items, shipping_address);

    res.status(201).json({
      status: 'success',
      data: { order: newOrder }
    });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

/**
 * Получение истории заказов текущего покупателя
 */
export const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const orders = await Order.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Получение детальной информации о конкретном заказе (для трекера)
 */
export const getOrderDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          include: [{ model: Product, attributes: ['name', 'image_url'] }]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ status: 'fail', message: 'Заказ не найден' });
    }

    // Защита данных: обычный покупатель может смотреть только свой заказ
    if (req.user.role === 'customer' && order.user_id !== req.user.id) {
      return res.status(403).json({ status: 'fail', message: 'У вас нет прав на просмотр этого заказа' });
    }

    res.status(200).json({
      status: 'success',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Изменение статуса заказа продавцом или админом
 */
export const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ status: 'fail', message: 'Пожалуйста, укажите новый статус заказа' });
    }

    // Вызываем сервис валидации машины статусов заказа
    const updatedOrder = await updateOrderStatusService(id, status);

    res.status(200).json({
      status: 'success',
      data: { order: updatedOrder }
    });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

/**
 * Отмена заказа покупателем
 */
export const cancelMyOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Покупатель может переводить заказ только в статус cancelled самостоятельно
    const updatedOrder = await updateOrderStatusService(id, 'cancelled');

    res.status(200).json({
      status: 'success',
      data: { order: updatedOrder }
    });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};
