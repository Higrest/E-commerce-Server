  import { Op } from 'sequelize';
  import { Product } from '../../models/Product.js';
  import { Category } from '../../models/Category.js';
  import { Seller } from '../../models/Seller.js';

  /**
   * Получить все товары маркетплейса (с фильтрацией и поиском для покупателей)
   */
  export const getAllProducts = async (req, res, next) => {
    try {
      const { search, category_id, sort } = req.query;
      const whereClause = {};

      // Фильтрация по поисковому запросу
      if (search) {
        whereClause.name = { [Op.iLike]: `%${search}%` }; // Работает в PostgreSQL
      }

      // Фильтрация по категории
      if (category_id) {
        whereClause.category_id = category_id;
      }

      // Настройка сортировки цены
      let orderClause = [['created_at', 'DESC']];
      if (sort === 'price-asc') orderClause = [['price', 'ASC']];
      if (sort === 'price-desc') orderClause = [['price', 'DESC']];

      const products = await Product.findAll({
        where: whereClause,
        order: orderClause,
        include: [
          { model: Category, attributes: ['name', 'slug'] },
          { model: Seller, attributes: ['store_name'] }
        ]
      });

      res.status(200).json({
        status: 'success',
        results: products.length,
        data: products
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Получить один товар по ID (Детальная страница)
   */
  export const getProductById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const product = await Product.findByPk(id, {
        include: [
          { model: Category, attributes: ['name', 'slug'] },
          { model: Seller, attributes: ['store_name', 'description'] }
        ]
      });

      if (!product) {
        return res.status(404).json({ status: 'fail', message: 'Товар не найден' });
      }

      res.status(200).json({
        status: 'success',
        data: product
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Создание нового товара (Только для одобренных продавцов)
   */
  export const createProduct = async (req, res, next) => {
    try {
      const { name, description, price, stock_quantity, category_id, image_url } = req.body;

      // Ищем профиль продавца, привязанный к текущему пользователю
      const seller = await Seller.findOne({ where: { user_id: req.user.id } });
      
      if (!seller || seller.approved_status !== 'approved') {
        return res.status(403).json({ 
          status: 'fail', 
          message: 'Ваш аккаунт продавца еще не одобрен администратором' 
        });
      }

      const newProduct = await Product.create({
        seller_id: seller.id,
        category_id,
        name,
        description,
        price,
        stock_quantity,
        image_url
      });

      res.status(201).json({
        status: 'success',
        data: { product: newProduct }
      });
    } catch (error) {
      res.status(400).json({ status: 'fail', message: error.message });
    }
  };

  /**
   * Редактирование товара (Только владелец товара)
   */
  export const updateProduct = async (req, res, next) => {
    try {
      const { id } = req.params;
      const seller = await Seller.findOne({ where: { user_id: req.user.id } });
      const product = await Product.findByPk(id);

      if (!product) {
        return res.status(404).json({ status: 'fail', message: 'Товар не найден' });
      }

      // Защита: Продавец может менять только свой товар
      if (product.seller_id !== seller.id) {
        return res.status(432).json({ status: 'fail', message: 'Вы не имеете прав на изменение этого товара' });
      }

      await product.update(req.body);

      res.status(200).json({
        status: 'success',
        data: { product }
      });
    } catch (error) {
      res.status(400).json({ status: 'fail', message: error.message });
    }
  };

  /**
   * Удаление товара (Владелец товара или Администратор)
   */
  export const deleteProduct = async (req, res, next) => {
    try {
      const { id } = req.params;
      const product = await Product.findByPk(id);

      if (!product) {
        return res.status(404).json({ status: 'fail', message: 'Товар не найден' });
      }

      // Если удаляет не админ, проверяем, является ли пользователь владельцем товара
      if (req.user.role !== 'admin') {
        const seller = await Seller.findOne({ where: { user_id: req.user.id } });
        if (!seller || product.seller_id !== seller.id) {
          return res.status(403).json({ status: 'fail', message: 'Вы можете удалять только свои товары' });
        }
      }

      await product.destroy();

      res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (error) {
      next(error);
    }
  };
