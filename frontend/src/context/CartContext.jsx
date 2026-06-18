import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load guest cart from local storage on mount
  useEffect(() => {
    if (!token) {
      const localCart = localStorage.getItem('guest_cart');
      if (localCart) {
        setCart(JSON.parse(localCart));
      } else {
        setCart([]);
      }
      setLoading(false);
    }
  }, [token]);

  // Sync or fetch cart when user logs in
  useEffect(() => {
    const fetchOrSyncCart = async () => {
      if (!token) return;
      
      setLoading(true);
      try {
        const localCartStr = localStorage.getItem('guest_cart');
        const localCartItems = localCartStr ? JSON.parse(localCartStr) : [];

        if (localCartItems.length > 0) {
          // Sync local guest items to server
          const response = await axios.post('/api/cart/sync', { items: localCartItems });
          setCart(response.data.items || []);
          localStorage.removeItem('guest_cart');
        } else {
          // Fetch existing server cart
          const response = await axios.get('/api/cart');
          setCart(response.data.items || []);
        }
      } catch (err) {
        console.error('Error loading cart from server:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrSyncCart();
  }, [token]);

  // Save guest cart to localStorage
  const saveGuestCart = (items) => {
    setCart(items);
    localStorage.setItem('guest_cart', JSON.stringify(items));
  };

  // Add to cart action
  const addToCart = async (product, quantity = 1) => {
    const qty = Number(quantity);
    
    if (token) {
      try {
        // Find if item already in cart to sum quantities correctly
        const existingItem = cart.find(item => item.product._id === product._id);
        const newQty = existingItem ? existingItem.quantity + qty : qty;
        
        const response = await axios.post('/api/cart', {
          productId: product._id,
          quantity: newQty
        });
        setCart(response.data.items || []);
      } catch (err) {
        console.error('Error adding to cart on server:', err);
      }
    } else {
      // Guest local storage mode
      const updatedCart = [...cart];
      const index = updatedCart.findIndex(item => item.product._id === product._id);

      if (index > -1) {
        updatedCart[index].quantity += qty;
      } else {
        updatedCart.push({ product, quantity: qty });
      }
      saveGuestCart(updatedCart);
    }
  };

  // Update item quantity
  const updateQuantity = async (productId, quantity) => {
    const qty = Math.max(1, Number(quantity));

    if (token) {
      try {
        const response = await axios.post('/api/cart', {
          productId,
          quantity: qty
        });
        setCart(response.data.items || []);
      } catch (err) {
        console.error('Error updating cart quantity on server:', err);
      }
    } else {
      const updatedCart = cart.map(item =>
        item.product._id === productId ? { ...item, quantity: qty } : item
      );
      saveGuestCart(updatedCart);
    }
  };

  // Remove item
  const removeFromCart = async (productId) => {
    if (token) {
      try {
        const response = await axios.delete(`/api/cart/${productId}`);
        setCart(response.data.items || []);
      } catch (err) {
        console.error('Error deleting item from cart on server:', err);
      }
    } else {
      const updatedCart = cart.filter(item => item.product._id !== productId);
      saveGuestCart(updatedCart);
    }
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    if (!token) {
      localStorage.removeItem('guest_cart');
    }
  };

  // Calculate cart counts & amounts
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);
  const cartOriginalSubtotal = cart.reduce((acc, item) => acc + (item.product?.originalPrice || item.product?.price || 0) * item.quantity, 0);
  const cartDiscount = cartOriginalSubtotal - cartSubtotal;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        cartCount,
        cartSubtotal,
        cartOriginalSubtotal,
        cartDiscount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
