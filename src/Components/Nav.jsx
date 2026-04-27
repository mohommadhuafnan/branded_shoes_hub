import { useEffect, useState } from 'react'
import { FaBars, FaHeart, FaSearch, FaShoppingCart, FaTimes, FaUser, FaChartLine } from 'react-icons/fa'
import { NavLink, useNavigate } from 'react-router-dom'
import { useShop } from '../context/ShopContext'
import logo from '../assets/logo.png'

function Nav() {
  const { cartSummary, favorites, setIsCartOpen } = useShop()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'))
  const isAdmin = currentUser?.role === 'admin'
  const [hidden, setHidden] = useState(false)
  const [lastScroll, setLastScroll] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY
      setHidden(current > lastScroll && current > 120)
      setLastScroll(current)
    }

    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [lastScroll])

  const closeMenu = () => setMobileOpen(false)

  useEffect(() => {
    const onStorage = () => setCurrentUser(JSON.parse(localStorage.getItem('user') || 'null'))
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
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
      <nav className="navbar">
        <NavLink to="/" className="logo-link" onClick={closeMenu}>
          <img src={logo} alt="Shoes Hub" />
          <div>
            <strong>Shoes Hub</strong>
            <span>Premium shoe store</span>
          </div>
        </NavLink>

        <div className={`nav-links ${mobileOpen ? 'open' : ''}`}>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={closeMenu}>
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="nav-actions">
          {isAdmin && (
            <NavLink to="/admin" className="icon-btn" aria-label="Admin Dashboard" onClick={closeMenu}>
              <FaChartLine />
            </NavLink>
          )}

          {currentUser ? (
            <div className="account-menu-wrap">
              <button type="button" className="icon-btn" aria-label="Account Menu" onClick={() => setMenuOpen((prev) => !prev)}>
                <FaUser />
              </button>
              {menuOpen && (
                <div className="account-menu">
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

          <button type="button" className="icon-btn search-btn" aria-label="Search">
            <FaSearch />
          </button>

          <button type="button" className="icon-btn" aria-label="Favorites">
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
    </header>
  )
}

export default Nav