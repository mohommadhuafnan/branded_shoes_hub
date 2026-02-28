import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { allProducts } from '../data/products'

const ShopContext = createContext(null)

const CART_KEY = 'shouse-cart'
const FAVORITES_KEY = 'shouse-favorites'

export function ShopProvider({ children }) {
  const [products] = useState(allProducts)
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem(CART_KEY)
    return saved ? JSON.parse(saved) : []
  })
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem(FAVORITES_KEY)
    return saved ? JSON.parse(saved) : []
  })
  const [toast, setToast] = useState(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems))
  }, [cartItems])

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(timer)
  }, [toast])

  const showToast = (title, message, variant = 'success') => {
    setToast({ title, message, variant })
  }

  const addToCart = (product, size = product.sizes[0]) => {
    setCartItems((current) => {
      const existing = current.find((item) => item.id === product.id && item.size === size)
      if (existing) {
        return current.map((item) =>
          item.id === product.id && item.size === size
            ? { ...item, qty: item.qty + 1 }
            : item,
        )
      }
      return [...current, { ...product, size, qty: 1 }]
    })
    setIsCartOpen(true)
    showToast('Added to cart', `${product.name} (${size}) is now in your cart.`)
  }

  const toggleFavorite = (productId) => {
    setFavorites((current) => {
      const exists = current.includes(productId)
      const updated = exists ? current.filter((id) => id !== productId) : [...current, productId]
      showToast(
        exists ? 'Removed from wishlist' : 'Added to wishlist',
        exists ? 'The item was removed from your wishlist.' : 'The item was saved to your wishlist.',
        exists ? 'info' : 'success',
      )
      return updated
    })
  }

  const updateCartQuantity = (productId, size, qty) => {
    if (qty <= 0) {
      removeFromCart(productId, size)
      return
    }
    setCartItems((current) =>
      current.map((item) =>
        item.id === productId && item.size === size ? { ...item, qty } : item,
      ),
    )
  }

  const removeFromCart = (productId, size) => {
    setCartItems((current) => current.filter((item) => !(item.id === productId && item.size === size)))
    showToast('Item removed', 'The product was removed from your cart.', 'info')
  }

  const clearCart = () => setCartItems([])

  const cartSummary = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0)
    const itemCount = cartItems.reduce((sum, item) => sum + item.qty, 0)
    const discount = subtotal >= 20000 ? 2500 : subtotal >= 10000 ? 1000 : 0
    const delivery = subtotal === 0 ? 0 : subtotal >= 15000 ? 0 : 750
    const total = subtotal - discount + delivery

    return { subtotal, itemCount, discount, delivery, total }
  }, [cartItems])

  const completeOrder = (customerName) => {
    clearCart()
    setIsCheckoutOpen(false)
    setIsCartOpen(false)
    showToast('Payment successful', `Thank you ${customerName || 'customer'}! Your order was placed successfully.`)
  }

  const value = {
    products,
    cartItems,
    favorites,
    toast,
    isCartOpen,
    isCheckoutOpen,
    cartSummary,
    setIsCartOpen,
    setIsCheckoutOpen,
    addToCart,
    toggleFavorite,
    updateCartQuantity,
    removeFromCart,
    completeOrder,
    showToast,
  }

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export function useShop() {
  const context = useContext(ShopContext)
  if (!context) throw new Error('useShop must be used within ShopProvider')
  return context
}
