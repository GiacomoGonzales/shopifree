'use client';

import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  currency: string;
  image: string;
  slug: string;
  quantity: number;
  variant?: { id: string; name: string; price: number };
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isCheckoutOpen: boolean;
  totalItems: number;
  totalPrice: number;
}

export interface CartContextType {
  state: CartState;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { item: Omit<CartItem, 'quantity'>; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { itemId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CHECKOUT' }
  | { type: 'CLOSE_CHECKOUT' }
  | { type: 'LOAD_CART'; payload: { items: CartItem[] } };

const initialState: CartState = { items: [], isOpen: false, isCheckoutOpen: false, totalItems: 0, totalPrice: 0 };

const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => (i.variant?.price || i.price) * i.quantity + sum, 0);
  return { totalItems, totalPrice };
};

const itemId = (productId: string, variantId?: string) => (variantId ? `${productId}-${variantId}` : productId);

const reducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { item, quantity } = action.payload;
      const id = itemId(item.productId, item.variant?.id);
      const idx = state.items.findIndex(i => i.id === id);
      const items = idx >= 0 ? state.items.map((i, k) => (k === idx ? { ...i, quantity: i.quantity + quantity } : i)) : [...state.items, { ...item, id, quantity }];
      return { ...state, items, ...calculateTotals(items) };
    }
    case 'REMOVE_ITEM': {
      const items = state.items.filter(i => i.id !== action.payload.itemId);
      return { ...state, items, ...calculateTotals(items) };
    }
    case 'UPDATE_QUANTITY': {
      const { itemId: id, quantity } = action.payload;
      if (quantity <= 0) return reducer(state, { type: 'REMOVE_ITEM', payload: { itemId: id } });
      const items = state.items.map(i => (i.id === id ? { ...i, quantity } : i));
      return { ...state, items, ...calculateTotals(items) };
    }
    case 'CLEAR_CART': return { ...state, items: [], totalItems: 0, totalPrice: 0 };
    case 'OPEN_CART': return { ...state, isOpen: true };
    case 'CLOSE_CART': return { ...state, isOpen: false };
    case 'TOGGLE_CART': return { ...state, isOpen: !state.isOpen };
    case 'LOAD_CART': return { ...state, items: action.payload.items, ...calculateTotals(action.payload.items) };
    case 'OPEN_CHECKOUT': return { ...state, isCheckoutOpen: true };
    case 'CLOSE_CHECKOUT': return { ...state, isCheckoutOpen: false };
    default: return state;
  }
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    console.warn('useCart must be used within a CartProvider');
    return { state: initialState, addItem: () => {}, removeItem: () => {}, updateQuantity: () => {}, clearCart: () => {}, openCart: () => {}, closeCart: () => {}, toggleCart: () => {}, openCheckout: () => {}, closeCheckout: () => {} } as CartContextType;
  }
  return ctx;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);
  useEffect(() => { if (!isClient) return; try { const saved = localStorage.getItem('shopifree-cart'); if (saved) dispatch({ type: 'LOAD_CART', payload: { items: JSON.parse(saved) } }); } catch {} }, [isClient]);
  useEffect(() => { if (!isClient) return; try { localStorage.setItem('shopifree-cart', JSON.stringify(state.items)); } catch {} }, [state.items, isClient]);

  const value: CartContextType = {
    state,
    addItem: (item, quantity = 1) => dispatch({ type: 'ADD_ITEM', payload: { item, quantity } }),
    removeItem: (itemId) => dispatch({ type: 'REMOVE_ITEM', payload: { itemId } }),
    updateQuantity: (itemId, quantity) => dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } }),
    clearCart: () => dispatch({ type: 'CLEAR_CART' }),
    openCart: () => dispatch({ type: 'OPEN_CART' }),
    closeCart: () => dispatch({ type: 'CLOSE_CART' }),
    toggleCart: () => dispatch({ type: 'TOGGLE_CART' }),
    openCheckout: () => dispatch({ type: 'OPEN_CHECKOUT' }),
    closeCheckout: () => dispatch({ type: 'CLOSE_CHECKOUT' }),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};


