import { useState } from 'react'
import { FaHeart, FaRegHeart, FaShoppingBag, FaBolt, FaStar } from 'react-icons/fa'
import { useShop } from '../context/ShopContext'

function ProductCard({ product }) {
  const { addToCart, favorites, toggleFavorite, setIsCheckoutOpen, setIsCartOpen } = useShop()
  const safeSizes = product.sizes?.length ? product.sizes : ['40']
  const [selectedSize, setSelectedSize] = useState(safeSizes[0])
  const isFavorite = favorites.includes(product.id)

  const handleBuyNow = () => {
    addToCart(product, selectedSize)
    setIsCartOpen(false)
    setIsCheckoutOpen(true)
  }

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

      <div className="product-image-wrap">
        <img src={product.image} alt={product.name} className="product-image" />
      </div>

      <div className="product-content">
        <div className="product-rating">
          <FaStar />
          <span>{product.rating.toFixed(1)}</span>
          <small>({product.stock} in stock)</small>
        </div>

        <h3>{product.name}</h3>
        <p>{product.description}</p>

        <div className="product-price-row">
          <strong>LKR {product.price.toLocaleString()}</strong>
          {product.originalPrice && <span>LKR {product.originalPrice.toLocaleString()}</span>}
        </div>

        <div className="size-row">
          <span>Size</span>
          <div className="size-options">
            {safeSizes.map((size) => (
              <button
                type="button"
                key={size}
                className={selectedSize === size ? 'size-btn active' : 'size-btn'}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="card-actions">
          <button type="button" className="btn btn-secondary" onClick={() => addToCart(product, selectedSize)}>
            <FaShoppingBag /> Add to Cart
          </button>
          <button type="button" className="btn btn-primary" onClick={handleBuyNow}>
            <FaBolt /> Buy Now
          </button>
        </div>
      </div>
    </article>
  )
}

export default ProductCard
