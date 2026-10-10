import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { Order } from './Order.js';
import { Product } from './Product.js';
import { Seller } from './Seller.js';

export const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
    },
  },
});

Order.hasMany(OrderItem, { foreignKey: 'order_id', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

Product.hasMany(OrderItem, { foreignKey: 'product_id', onDelete: 'RESTRICT' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id' });

Seller.hasMany(OrderItem, { foreignKey: 'seller_id', onDelete: 'RESTRICT' });
OrderItem.belongsTo(Seller, { foreignKey: 'seller_id' });
