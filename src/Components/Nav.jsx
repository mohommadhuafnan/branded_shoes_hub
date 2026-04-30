import { useEffect, useRef, useState } from 'react'
import { FaBars, FaHeart, FaSearch, FaShoppingCart, FaTimes, FaUser, FaChartLine } from 'react-icons/fa'
import { NavLink, useNavigate } from 'react-router-dom'
import { useShop } from '../context/ShopContext'
import logo from '../assets/logo.png'

function Nav() {
  const { cartSummary, favorites, setIsCartOpen } = useShop()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [hidden, setHidden] = useState(false)
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'))
  const isAdmin = currentUser?.role === 'admin'
  const accountWrapRef = useRef(null)
  const navRef = useRef(null)
  const lastScrollYRef = useRef(0)

  const closeMenu = () => setMobileOpen(false)

  const runSearch = () => {
    const q = searchQuery.trim()
    navigate(q ? `/shop?q=${encodeURIComponent(q)}` : '/shop')
    setSearchOpen(false)
    setSearchQuery('')
    closeMenu()
  }

  useEffect(() => {
    const onStorage = () => setCurrentUser(JSON.parse(localStorage.getItem('user') || 'null'))
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const closeIfOutside = (e) => {
      if (accountWrapRef.current && !accountWrapRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', closeIfOutside)
    document.addEventListener('touchstart', closeIfOutside)
    return () => {
      document.removeEventListener('mousedown', closeIfOutside)
      document.removeEventListener('touchstart', closeIfOutside)
    }
  }, [menuOpen])

  useEffect(() => {
    if (!mobileOpen) return
    const closeIfOutsideMenu = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', closeIfOutsideMenu)
    document.addEventListener('touchstart', closeIfOutsideMenu)
    return () => {
      document.removeEventListener('mousedown', closeIfOutsideMenu)
      document.removeEventListener('touchstart', closeIfOutsideMenu)
    }
  }, [mobileOpen])

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0
      const lastY = lastScrollYRef.current
      const delta = y - lastY
      lastScrollYRef.current = y

      if (y <= 20) {
        setHidden(false)
        return
      }
      if (delta < -2) {
        setHidden(false)
        return
      }
      if (delta > 4 && y > 120) {
        setHidden(true)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setCurrentUser(null)
    setMenuOpen(false)
    navigate('/login')
  }

  const links = [
    { to: '/', label: 'Home' },
    { to: '/womens', label: 'Womens' },
    { to: '/mens', label: 'Mens' },
    { to: '/kids', label: 'Kids' },
    { to: '/sales', label: 'Sales' },
    { to: '/contact', label: 'Contact' },
  ]

  return (
    <header className={`site-header ${hidden ? 'hidden' : ''}`}>
      <nav className="navbar" ref={navRef}>
        <NavLink to="/" className="logo-link" onClick={closeMenu}>
          <img src={logo} alt="Shouse Hub" />
          <div>
            <strong>Shouse Hub</strong>
            <span className="logo-tagline">Shushab · Premium footwear</span>
          </div>
        </NavLink>

        <div className={`nav-links ${mobileOpen ? 'open' : ''}`}>
          <button
            type="button"
            className="nav-links-search-entry"
            onClick={() => {
              setSearchOpen(true)
              closeMenu()
            }}
          >
            <FaSearch />
            <span className="nav-search-typing">Search shoes, brands, sizes...</span>
          </button>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={closeMenu}>
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="nav-actions">
          {isAdmin && (
            <NavLink to="/admin" className="icon-btn hide-mobile-sm" aria-label="Admin Dashboard" onClick={closeMenu}>
              <FaChartLine />
            </NavLink>
          )}

          {currentUser ? (
            <div className="account-menu-wrap" ref={accountWrapRef}>
              <button type="button" className="icon-btn icon-btn--avatar" aria-label="Account Menu" onClick={() => setMenuOpen((prev) => !prev)}>
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="" className="account-avatar-img" />
                ) : (
                  <FaUser />
                )}
              </button>
              {menuOpen && (
                <div className="account-menu">
                  {currentUser.photoURL && (
                    <img src={currentUser.photoURL} alt="" className="account-menu-avatar" />
                  )}
                  <strong>{currentUser.name}</strong>
                  <small>{currentUser.email}</small>
                  <small className="role-pill">{currentUser.role}</small>
                  {isAdmin && <button type="button" onClick={() => { setMenuOpen(false); navigate('/admin') }}>Admin Panel</button>}
                  <button type="button" onClick={() => { setMenuOpen(false); navigate('/my-orders') }}>My Orders</button>
                  <button type="button" onClick={() => { setMenuOpen(false); navigate('/settings') }}>Settings</button>
                  <button type="button" className="logout" onClick={logout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <NavLink to="/login" className="icon-btn" aria-label="Account" onClick={closeMenu}>
              <FaUser />
            </NavLink>
          )}

          <button
            type="button"
            className="icon-btn search-btn"
            aria-label="Search products"
            onClick={() => setSearchOpen(true)}
          >
            <FaSearch />
          </button>

          <button type="button" className="icon-btn hide-mobile-sm hide-mobile-xs" aria-label="Favorites">
            <FaHeart />
            <span className="count-badge">{favorites.length}</span>
          </button>

          <button
            type="button"
            className="icon-btn"
            aria-label="Cart"
            onClick={() => setIsCartOpen(true)}
          >
            <FaShoppingCart />
            <span className="count-badge">{cartSummary.itemCount}</span>
          </button>

          <button
            type="button"
            className="icon-btn mobile-toggle"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>

      {searchOpen && (
        <div className="nav-search-overlay" role="dialog" aria-modal="true" aria-label="Search">
          <button type="button" className="nav-search-overlay__backdrop" onClick={() => setSearchOpen(false)} aria-label="Close search" />
          <div className="nav-search-panel">
            <div className="nav-search-panel__head">
              <h2>Search Shouse Hub</h2>
              <button type="button" className="nav-search-close" onClick={() => setSearchOpen(false)} aria-label="Close">
                <FaTimes />
              </button>
            </div>
            <form
              className="nav-search-form"
              onSubmit={(e) => {
                e.preventDefault()
                runSearch()
              }}
            >
              <input
                type="search"
                className="nav-search-input"
                placeholder="Search shoes, brands, sizes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button type="submit" className="btn btn-primary nav-search-submit">
                Search
              </button>
            </form>
            <p className="nav-search-hint">Browse by category</p>
            <div className="nav-search-categories">
              <button type="button" className="nav-cat-pill" onClick={() => { navigate('/womens'); setSearchOpen(false); closeMenu(); }}>
                Womens
              </button>
              <button type="button" className="nav-cat-pill" onClick={() => { navigate('/mens'); setSearchOpen(false); closeMenu(); }}>
                Mens
              </button>
              <button type="button" className="nav-cat-pill" onClick={() => { navigate('/kids'); setSearchOpen(false); closeMenu(); }}>
                Kids
              </button>
              <button type="button" className="nav-cat-pill" onClick={() => { navigate('/sales'); setSearchOpen(false); closeMenu(); }}>
                Sales
              </button>
              <button type="button" className="nav-cat-pill nav-cat-pill--accent" onClick={() => { navigate('/shop'); setSearchOpen(false); closeMenu(); }}>
                Shop all
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Nav