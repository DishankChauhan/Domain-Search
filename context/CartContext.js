import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  // Load cart from storage on app start
  useEffect(() => {
    loadCart();
  }, []);

  // Save cart to storage whenever items change
  useEffect(() => {
    saveCart();
  }, [items]);

  const loadCart = async () => {
    try {
      const cartData = await AsyncStorage.getItem('domainCart');
      if (cartData) {
        const parsedData = JSON.parse(cartData);
        setItems(parsedData);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const saveCart = async () => {
    try {
      await AsyncStorage.setItem('domainCart', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const addToCart = (domain) => {
    setItems(prevItems => {
      // Check if domain already exists
      const existingItem = prevItems.find(item => item.id === domain.id);
      if (existingItem) {
        return prevItems; // Don't add duplicates
      }
      return [...prevItems, domain];
    });
  };

  const removeFromCart = (domainId) => {
    setItems(prevItems => prevItems.filter(item => item.id !== domainId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const isInCart = (domainId) => {
    return items.some(item => item.id === domainId);
  };

  const count = items.length;
  const total = items.reduce((sum, item) => sum + parseFloat(item.price), 0);

  const value = {
    items,
    count,
    total,
    addToCart,
    removeFromCart,
    clearCart,
    isInCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 