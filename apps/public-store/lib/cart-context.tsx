'use client'

import React, { createContext, useContext, useReducer, useEffect, useState } from 'react'

// Interfaces para el carrito
export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  currency: string
  image: string
  slug: string
  quantity: number
  variant?: {
    id: string
    name: string
    price: number
  }
}

export interface CartState {
  items: CartItem[]
  isOpen: boolean
  isCheckoutOpen: boolean
  totalItems: number
  totalPrice: number
}

export interface CartContextType {
  state: CartState
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  openCheckout: () => void
  closeCheckout: () => void
}

// Acciones del reducer
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
  | { type: 'LOAD_CART'; payload: { items: CartItem[] } }

// Estado inicial
const initialState: CartState = {
  items: [],
  isOpen: false,
  isCheckoutOpen: false,
  totalItems: 0,
  totalPrice: 0
}

// Funciones helper
const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => {
    const price = item.variant?.price || item.price
    return sum + (price * item.quantity)
  }, 0)
  
  return { totalItems, totalPrice }
}

const generateCartItemId = (productId: string, variantId?: string) => {
  return variantId ? `${productId}-${variantId}` : productId
}

// Reducer del carrito
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { item, quantity } = action.payload
      const itemId = generateCartItemId(item.productId, item.variant?.id)
      
      const existingItemIndex = state.items.findIndex(cartItem => cartItem.id === itemId)
      
      let newItems: CartItem[]
      
      if (existingItemIndex >= 0) {
        // Si el item ya existe, actualizar cantidad
        newItems = state.items.map((cartItem, index) => 
          index === existingItemIndex 
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        )
      } else {
        // Si es un item nuevo, agregarlo
        const newItem: CartItem = {
          ...item,
          id: itemId,
          quantity
        }
        newItems = [...state.items, newItem]
      }
      
      const totals = calculateTotals(newItems)
      
      return {
        ...state,
        items: newItems,
        ...totals
      }
    }
    
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload.itemId)
      const totals = calculateTotals(newItems)
      
      return {
        ...state,
        items: newItems,
        ...totals
      }
    }
    
    case 'UPDATE_QUANTITY': {
      const { itemId, quantity } = action.payload
      
      if (quantity <= 0) {
        // Si la cantidad es 0 o menor, remover el item
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: { itemId } })
      }
      
      const newItems = state.items.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
      
      const totals = calculateTotals(newItems)
      
      return {
        ...state,
        items: newItems,
        ...totals
      }
    }
    
    case 'CLEAR_CART': {
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0
      }
    }
    
    case 'OPEN_CART': {
      return {
        ...state,
        isOpen: true
      }
    }
    
    case 'CLOSE_CART': {
      return {
        ...state,
        isOpen: false
      }
    }
    
    case 'TOGGLE_CART': {
      return {
        ...state,
        isOpen: !state.isOpen
      }
    }
    
    case 'LOAD_CART': {
      const totals = calculateTotals(action.payload.items)
      return {
        ...state,
        items: action.payload.items,
        ...totals
      }
    }
    
    case 'OPEN_CHECKOUT': {
      return {
        ...state,
        isCheckoutOpen: true
      }
    }
    
    case 'CLOSE_CHECKOUT': {
      return {
        ...state,
        isCheckoutOpen: false
      }
    }
    
    default:
      return state
  }
}

// Crear contexto
const CartContext = createContext<CartContextType | undefined>(undefined)

// Hook para usar el contexto
export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    // En lugar de lanzar error inmediatamente, devolver un estado por defecto
    console.warn('useCart must be used within a CartProvider')
    return {
      state: initialState,
      addItem: () => {},
      removeItem: () => {},
      updateQuantity: () => {},
      clearCart: () => {},
      openCart: () => {},
      closeCart: () => {},
      toggleCart: () => {},
      openCheckout: () => {},
      closeCheckout: () => {}
    }
  }
  return context
}

// Proveedor del contexto
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const [isClient, setIsClient] = useState(false)

  // Verificar que estamos en el cliente
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Cargar carrito desde localStorage al montar
  useEffect(() => {
    if (!isClient) return
    
    try {
      const savedCart = localStorage.getItem('shopifree-cart')
      if (savedCart) {
        const cartItems: CartItem[] = JSON.parse(savedCart)
        dispatch({ type: 'LOAD_CART', payload: { items: cartItems } })
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error)
    }
  }, [isClient])

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (!isClient) return
    
    try {
      localStorage.setItem('shopifree-cart', JSON.stringify(state.items))
    } catch (error) {
      console.error('Error saving cart to localStorage:', error)
    }
  }, [state.items, isClient])

  // Funciones del contexto
  const addItem = (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { item, quantity } })
  }

  const removeItem = (itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { itemId } })
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const openCart = () => {
    dispatch({ type: 'OPEN_CART' })
  }

  const closeCart = () => {
    dispatch({ type: 'CLOSE_CART' })
  }

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' })
  }

  const openCheckout = () => {
    dispatch({ type: 'OPEN_CHECKOUT' })
  }

  const closeCheckout = () => {
    dispatch({ type: 'CLOSE_CHECKOUT' })
  }

  const value: CartContextType = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    openCart,
    closeCart,
    toggleCart,
    openCheckout,
    closeCheckout
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
} 