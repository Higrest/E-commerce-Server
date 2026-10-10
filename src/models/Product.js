import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { Seller } from './Seller.js';
import { Category } from './Category.js';

export const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  stock_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  image_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

Seller.hasMany(Product, { foreignKey: 'seller_id', onDelete: 'CASCADE' });
Product.belongsTo(Seller, { foreignKey: 'seller_id' });

Category.hasMany(Product, { foreignKey: 'category_id', onDelete: 'RESTRICT' });
Product.belongsTo(Category, { foreignKey: 'category_id' });
