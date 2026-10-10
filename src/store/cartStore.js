import { getStorageItem, setStorageItem } from '../utils/storage.js';
import api from '../api/api.js';

const CART_KEY = 'marketplace_cart';

export const createCartStore = (set, get) => ({
  cartItems: getStorageItem(CART_KEY, []),
  isCartLoading: false,
  cartError: null,

  addToCart: (product, quantity = 1) => {
    const { cartItems } = get();
    const existingItem = cartItems.find((item) => item.product_id === product.id);
    
    let updatedItems;
    if (existingItem) {
      updatedItems = cartItems.map((item) =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      updatedItems = [...cartItems, { product_id: product.id, product, quantity }];
    }

    set({ cartItems: updatedItems });
    setStorageItem(CART_KEY, updatedItems);
  },

  removeFromCart: (productId) => {
    const { cartItems } = get();
    const updatedItems = cartItems.filter((item) => item.product_id !== productId);
    
    set({ cartItems: updatedItems });
    setStorageItem(CART_KEY, updatedItems);
  },

  updateQuantity: (productId, quantity) => {
    if (quantity < 1) return;
    const { cartItems } = get();
    const updatedItems = cartItems.map((item) =>
      item.product_id === productId ? { ...item, quantity } : item
    );

    set({ cartItems: updatedItems });
    setStorageItem(CART_KEY, updatedItems);
  },

  clearCart: () => {
    set({ cartItems: [] });
    setStorageItem(CART_KEY, []);
  },

  checkout: async (shippingAddress) => {
    set({ isCartLoading: true, cartError: null });
    try {
      const { cartItems, clearCart } = get();
      const items = cartItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity
      }));

      const response = await api.post('/orders', { items, shipping_address: shippingAddress });
      clearCart();
      set({ isCartLoading: false });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Ошибка при оформлении заказа';
      set({ cartError: message, isCartLoading: false });
      throw error;
    }
  }
});
