import { useEffect, useRef, useState } from 'react'
import { FaHeart, FaRegHeart, FaShoppingBag, FaBolt, FaStar } from 'react-icons/fa'
import { useShop } from '../context/ShopContext'

function ProductCard({ product, onImageClick }) {
  const { addToCart, favorites, toggleFavorite } = useShop()
  const safeSizes = product.sizes?.length ? product.sizes : ['40']
  const safeRating = Number(product.rating || 0)
  const safeStock = Number(product.stock || 0)
  const safePrice = Number(product.price || 0)
  const safeOriginalPrice = product.originalPrice ? Number(product.originalPrice) : null
  const [selectedSize, setSelectedSize] = useState(safeSizes[0])
  const [optionsOpen, setOptionsOpen] = useState(false)
  const isFavorite = favorites.includes(product.id)
  const optionsRef = useRef(null)

  useEffect(() => {
    if (!optionsOpen) return
    const onOutside = (e) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target)) {
        setOptionsOpen(false)
      }
    }
    document.addEventListener('mousedown', onOutside)
    document.addEventListener('touchstart', onOutside)
    return () => {
      document.removeEventListener('mousedown', onOutside)
      document.removeEventListener('touchstart', onOutside)
    }
  }, [optionsOpen])

  return (
    <article className="product-card reveal-up" data-reveal>
      <button
        type="button"
        className={`wishlist-btn ${isFavorite ? 'active' : ''}`}
        aria-label="Toggle wishlist"
        onClick={() => toggleFavorite(product.id)}
      >
        {isFavorite ? <FaHeart /> : <FaRegHeart />}
      </button>

      <span className="product-badge">{product.badge}</span>

      <div className="product-media" ref={optionsRef}>
        {onImageClick ? (
          <button
            type="button"
            className="product-image-wrap product-image-wrap--clickable"
            onClick={() => onImageClick(product)}
            aria-label={`View details: ${product.name}`}
          >
            <img src={product.image} alt={product.name} className="product-image" />
          </button>
        ) : (
          <div className="product-image-wrap">
            <img src={product.image} alt={product.name} className="product-image" />
          </div>
        )}

        {optionsOpen && (
          <div className="card-options-overlay">
            <div className="card-options-panel">
              <div className="card-options-body">
                <label htmlFor={`size-${product.id}`} className="card-options-label">
                  Sizes:
                </label>
                <select
                  id={`size-${product.id}`}
                  className="card-size-select"
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                >
                  {safeSizes.map((size) => (
                    <option key={size} value={size}>
                      Size {size}
                    </option>
                  ))}
                </select>
              </div>
              <div className="card-options-actions">
                <button
                  type="button"
                  className="btn btn-secondary full"
                  onClick={() => {
                    addToCart(product, selectedSize)
                    setOptionsOpen(false)
                  }}
                >
                  <FaShoppingBag /> Add to Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="product-content">
        <div className="product-rating">
          <FaStar />
          <span>{safeRating.toFixed(1)}</span>
          <small>({safeStock} in stock)</small>
        </div>

        <h3>{product.name}</h3>
        <p>{product.description}</p>

        <div className="product-price-row">
          <strong>LKR {safePrice.toLocaleString()}</strong>
          {safeOriginalPrice && <span>LKR {safeOriginalPrice.toLocaleString()}</span>}
        </div>

        <div className="card-actions">
          <button type="button" className="btn btn-primary full" onClick={() => setOptionsOpen(true)}>
            <FaBolt /> Buy Now
          </button>
        </div>

      </div>
    </article>
  )
}

export default ProductCard
