import { useEffect, useState } from 'react'
import { FaBars, FaHeart, FaSearch, FaShoppingCart, FaTimes } from 'react-icons/fa'
import { NavLink } from 'react-router-dom'
import { useShop } from '../context/ShopContext'
import logo from '../assets/logo.png'

function Nav() {
  const { cartSummary, favorites, setIsCartOpen } = useShop()
  const [mobileOpen, setMobileOpen] = useState(false)
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