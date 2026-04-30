import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { API_BASE, toAbsoluteImageUrl } from '../lib/api'

const ShopContext = createContext(null)

const CART_KEY = 'shouse-cart'
const FAVORITES_KEY = 'shouse-favorites'
const SETTINGS_KEY = 'shouse-settings'
const PRODUCTS_CACHE_KEY = 'shouse-products-cache'

export function ShopProvider({ children }) {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem(PRODUCTS_CACHE_KEY)
    if (!saved) return []
    try {
      const parsed = JSON.parse(saved)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })
  const [content, setContent] = useState(null)
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState('')
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
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(SETTINGS_KEY)
    return saved
      ? JSON.parse(saved)
      : {
          fullName: '',
          email: '',
          phone: '',
          address: '',
          preferredPayment: 'card',
          avatarUrl: '',
        }
  })
  const mapProduct = (product) => {
    const id = product._id || product.id
    const listPrice = Number(product.price ?? 0)
    const saleRaw = product.salePrice
    const saleNum =
      saleRaw !== undefined && saleRaw !== null && saleRaw !== ''
        ? Number(saleRaw)
        : NaN
    const onSale = Number.isFinite(saleNum) && saleNum >= 0 && saleNum < listPrice && listPrice > 0
    const effectivePrice = onSale ? saleNum : listPrice
    const originalPrice = onSale ? listPrice : null
    return {
      ...product,
      id,
      name: product.name,
      image: toAbsoluteImageUrl(product.image),
      sizes: product.sizes?.length ? product.sizes : ['40', '41', '42'],
      price: effectivePrice,
      originalPrice,
      inStock: Number(product.stock || 0) > 0,
      priceValue: effectivePrice,
      title: product.name,
      desc: product.description,
      badge: product.featured ? 'Featured' : Number(product.stock || 0) <= 5 ? 'Low Stock' : 'New',
    }
  }

  const loadProducts = useCallback(async () => {
    setProductsLoading(true)
    setProductsError('')
    try {
      const r = await fetch(`${API_BASE}/products?limit=200`)
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j.message || `Products request failed (${r.status})`)
      const list = (j.data || []).map(mapProduct)
      setProducts(list)
      localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(list))
    } catch (e) {
      console.error(e)
      setProductsError(e.message || 'Unable to load products.')
      // Keep last successful cache instead of blanking UI during temporary network/cold-start issues.
      setProducts((prev) => prev)
    } finally {
      setProductsLoading(false)
    }
  }, [API_BASE])

  const fetchProducts = () => loadProducts()

  useEffect(() => {
    loadProducts()
    const id = setInterval(loadProducts, 60000)
    return () => clearInterval(id)
  }, [loadProducts])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const r = await fetch(`${API_BASE}/content`)
        const j = await r.json().catch(() => ({}))
        if (cancelled) return
        if (r.ok && j && typeof j === 'object' && Object.keys(j).length) setContent(j)
        else setContent(null)
      } catch {
        if (!cancelled) setContent(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [API_BASE])

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems))
  }, [cartItems])

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    if (user) {
      setSettings((current) => ({
        ...current,
        fullName: current.fullName || user.name || '',
        email: current.email || user.email || '',
        avatarUrl: current.avatarUrl || user.photoURL || '',
      }))
    }
  }, [])

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
          item.id === product.id && item.size === size ? { ...item, qty: item.qty + 1 } : item,
        )
      }
      return [...current, { ...product, size, qty: 1 }]
    })
    setIsCartOpen(true)
    showToast('Added to cart', `${product.name} (${size}) is now in your cart.`)
  }

  /** Replaces the cart with this single line item and opens checkout (buy now). */
  const buyNowSingle = (product, size = product.sizes[0]) => {
    setCartItems([{ ...product, size, qty: 1 }])
    setIsCartOpen(false)
    setIsCheckoutOpen(true)
    showToast('Checkout', `${product.name} (${size}) — complete your order below.`, 'success')
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
      current.map((item) => (item.id === productId && item.size === size ? { ...item, qty } : item)),
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

  const womensProducts = useMemo(
    () => products.filter((p) => p.category?.toLowerCase().includes('women')),
    [products],
  )
  const mensProducts = useMemo(
    () =>
      products.filter(
        (p) => p.category?.toLowerCase().includes('men') && !p.category?.toLowerCase().includes('women'),
      ),
    [products],
  )
  const kidsProducts = useMemo(
    () => products.filter((p) => p.category?.toLowerCase().includes('kid')),
    [products],
  )
  const homeHighlights = useMemo(() => products.filter((p) => p.featured).slice(0, 12), [products])
  const saleProducts = useMemo(
    () => products.filter((p) => p.originalPrice != null).slice(0, 24),
    [products],
  )

  const value = {
    products,
    setProducts,
    fetchProducts,
    cartItems,
    favorites,
    toast,
    isCartOpen,
    isCheckoutOpen,
    cartSummary,
    setIsCartOpen,
    setIsCheckoutOpen,
    addToCart,
    buyNowSingle,
    toggleFavorite,
    updateCartQuantity,
    removeFromCart,
    completeOrder,
    showToast,
    productsLoading,
    productsError,
    womensProducts,
    mensProducts,
    kidsProducts,
    homeHighlights,
    saleProducts,
    content,
    settings,
    setSettings,
  }

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export function useShop() {
  const context = useContext(ShopContext)
  if (!context) throw new Error('useShop must be used within ShopProvider')
  return context
}
