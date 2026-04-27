import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { toAbsoluteImageUrl, isDsqlBackend, dsqlUrl, authHeaders } from '../lib/api'
import { ref, onValue, off, set, update } from 'firebase/database'
import { db } from '../firebase'

const ShopContext = createContext(null)

const CART_KEY = 'shouse-cart'
const FAVORITES_KEY = 'shouse-favorites'
const SETTINGS_KEY = 'shouse-settings'
const USER_DATA_PATH = 'users'

export function ShopProvider({ children }) {
  const [products, setProducts] = useState([])
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
        }
  })
  const [activeUserToken, setActiveUserToken] = useState(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    if (user?.role !== 'user') return ''
    return localStorage.getItem('token') || ''
  })
  const [isUserDataReady, setIsUserDataReady] = useState(false)

  const mapProduct = (product) => {
    const id = product._id || product.id
    return {
      ...product,
      id,
      name: product.name,
      image: toAbsoluteImageUrl(product.image),
      sizes: product.sizes?.length ? product.sizes : ['40', '41', '42'],
      price: Number(product.price || 0),
      originalPrice: product.salePrice ? Number(product.price || 0) : null,
      inStock: Number(product.stock || 0) > 0,
      priceValue: Number(product.price || 0),
      title: product.name,
      desc: product.description,
      badge: product.featured ? 'Featured' : Number(product.stock || 0) <= 5 ? 'Low Stock' : 'New',
    }
  }

  const loadProductsDsql = useCallback(async () => {
    setProductsLoading(true)
    setProductsError('')
    try {
      const r = await fetch(dsqlUrl('/api/products?limit=200'))
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j.message || `Products request failed (${r.status})`)
      const list = (j.data || []).map(mapProduct)
      setProducts(list)
    } catch (e) {
      console.error(e)
      setProductsError(e.message || 'Unable to load products.')
      setProducts([])
    } finally {
      setProductsLoading(false)
    }
  }, [])

  const subscribeProductsFirebase = () => {
    setProductsLoading(true)
    setProductsError('')

    const productsRef = ref(db, 'products')
    const listener = onValue(
      productsRef,
      (snapshot) => {
        const data = snapshot.val()
        if (data) {
          const productList = Object.keys(data)
            .map((key) => ({
              _id: key,
              ...data[key],
            }))
            .filter((p) => p.active !== false)
          setProducts(productList.map(mapProduct))
        } else {
          setProducts([])
        }
        setProductsLoading(false)
      },
      (error) => {
        console.error(error)
        setProductsError('Unable to load products from server.')
        setProductsLoading(false)
      },
    )

    return () => off(productsRef, 'value', listener)
  }

  const fetchProducts = () => {
    if (isDsqlBackend()) {
      loadProductsDsql()
      return () => {}
    }
    return subscribeProductsFirebase()
  }

  const subscribeContentFirebase = () => {
    const contentRef = ref(db, 'content')
    const listener = onValue(
      contentRef,
      (snapshot) => {
        const data = snapshot.val()
        if (data) {
          setContent(data)
        }
      },
      () => {
        setContent(null)
      },
    )

    return () => off(contentRef, 'value', listener)
  }

  useEffect(() => {
    if (isDsqlBackend()) {
      loadProductsDsql()
      const id = setInterval(loadProductsDsql, 60000)
      return () => clearInterval(id)
    }
    return subscribeProductsFirebase()
  }, [loadProductsDsql])

  useEffect(() => {
    if (isDsqlBackend()) {
      let cancelled = false
      ;(async () => {
        try {
          const r = await fetch(dsqlUrl('/api/content'))
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
    }
    return subscribeContentFirebase()
  }, [])

  useEffect(() => {
    const resolveUserToken = () => {
      const user = JSON.parse(localStorage.getItem('user') || 'null')
      if (user?.role !== 'user') {
        setActiveUserToken('')
        return
      }
      setActiveUserToken(localStorage.getItem('token') || '')
    }

    resolveUserToken()
    window.addEventListener('storage', resolveUserToken)
    return () => window.removeEventListener('storage', resolveUserToken)
  }, [])

  useEffect(() => {
    if (!activeUserToken) {
      setIsUserDataReady(false)
      return undefined
    }

    if (isDsqlBackend() && activeUserToken.includes('.')) {
      setIsUserDataReady(true)
      return undefined
    }

    if (isDsqlBackend() && !activeUserToken.includes('.')) {
      let cancelled = false
      const localCart = JSON.parse(localStorage.getItem(CART_KEY) || '[]')
      const localFavorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]')
      const localSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')
      const hasLocalData =
        localCart.length > 0 ||
        localFavorites.length > 0 ||
        Object.keys(localSettings).length > 0

      ;(async () => {
        try {
          const r = await fetch(dsqlUrl('/api/user-state'), { headers: { ...authHeaders() } })
          const remote = r.ok ? await r.json().catch(() => null) : null
          if (cancelled) return

          const hasRemote =
            remote &&
            ((Array.isArray(remote.cartItems) && remote.cartItems.length > 0) ||
              (Array.isArray(remote.favorites) && remote.favorites.length > 0) ||
              (remote.settings && Object.keys(remote.settings).length > 0))

          if (hasRemote) {
            setCartItems(Array.isArray(remote.cartItems) ? remote.cartItems : [])
            setFavorites(Array.isArray(remote.favorites) ? remote.favorites : [])
            if (remote.settings && typeof remote.settings === 'object') {
              setSettings((current) => ({ ...current, ...remote.settings }))
            }
          } else if (hasLocalData) {
            setCartItems(localCart)
            setFavorites(localFavorites)
            if (Object.keys(localSettings).length) {
              setSettings((current) => ({ ...current, ...localSettings }))
            }
            await fetch(dsqlUrl('/api/user-state'), {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', ...authHeaders() },
              body: JSON.stringify({
                cartItems: localCart,
                favorites: localFavorites,
                settings: { ...localSettings },
              }),
            })
          }
        } catch (e) {
          console.error(e)
        } finally {
          if (!cancelled) setIsUserDataReady(true)
        }
      })()

      return () => {
        cancelled = true
      }
    }

    const userDataRef = ref(db, `${USER_DATA_PATH}/${activeUserToken}/shopData`)

    const localCart = JSON.parse(localStorage.getItem(CART_KEY) || '[]')
    const localFavorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]')
    const localSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')

    const hasLocalData =
      localCart.length > 0 ||
      localFavorites.length > 0 ||
      Object.keys(localSettings).length > 0

    const listener = onValue(
      userDataRef,
      async (snapshot) => {
        const remote = snapshot.val()

        if (remote) {
          setCartItems(Array.isArray(remote.cartItems) ? remote.cartItems : [])
          setFavorites(Array.isArray(remote.favorites) ? remote.favorites : [])
          if (remote.settings && typeof remote.settings === 'object') {
            setSettings((current) => ({ ...current, ...remote.settings }))
          }
          setIsUserDataReady(true)
          return
        }

        if (hasLocalData) {
          await set(userDataRef, {
            cartItems: localCart,
            favorites: localFavorites,
            settings: localSettings,
            migratedAt: new Date().toISOString(),
          })
          setIsUserDataReady(true)
          return
        }

        setIsUserDataReady(true)
      },
      () => {
        setIsUserDataReady(false)
      },
    )

    return () => off(userDataRef, 'value', listener)
  }, [activeUserToken])

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
    if (!activeUserToken || !isUserDataReady) return

    if (isDsqlBackend() && !activeUserToken.includes('.')) {
      const t = setTimeout(() => {
        fetch(dsqlUrl('/api/user-state'), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify({ cartItems, favorites, settings }),
        }).catch(() => {})
      }, 400)
      return () => clearTimeout(t)
    }

    const userDataRef = ref(db, `${USER_DATA_PATH}/${activeUserToken}/shopData`)
    update(userDataRef, {
      cartItems,
      favorites,
      settings,
      updatedAt: new Date().toISOString(),
    }).catch(() => {})
  }, [activeUserToken, isUserDataReady, cartItems, favorites, settings])

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    if (user) {
      setSettings((current) => ({
        ...current,
        fullName: current.fullName || user.name || '',
        email: current.email || user.email || '',
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
  const saleProducts = useMemo(() => products.filter((p) => p.originalPrice).slice(0, 12), [products])

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
