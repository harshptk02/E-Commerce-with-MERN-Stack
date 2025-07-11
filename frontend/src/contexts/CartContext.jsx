import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(false)

  // Load cart from API when component mounts
  useEffect(() => {
    loadCart()
    // eslint-disable-next-line
  }, [])

  // Load cart from API when user is authenticated
  const loadCart = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/cart')
      setCart(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      setCart([])
      console.error('Failed to load cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId, quantity = 1) => {
    try {
      const response = await axios.post('/cart/add', { productId, quantity })
      setCart(response.data)
      toast.success('Added to cart!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add to cart'
      toast.error(message)
      return { success: false, message }
    }
  }

  const updateCartItem = async (productId, quantity) => {
    try {
      const response = await axios.put('/cart/update', { productId, quantity })
      setCart(response.data)
      toast.success('Cart updated!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update cart'
      toast.error(message)
      return { success: false, message }
    }
  }

  const removeFromCart = async (productId) => {
    try {
      const response = await axios.delete(`/cart/remove/${productId}`)
      setCart(response.data)
      toast.success('Removed from cart!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove from cart'
      toast.error(message)
      return { success: false, message }
    }
  }

  const clearCart = async () => {
    try {
      await axios.delete('/cart/clear')
      setCart([])
      toast.success('Cart cleared!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to clear cart'
      toast.error(message)
      return { success: false, message }
    }
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0)
  }

  const value = {
    cart,
    loading,
    loadCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartCount
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
} 