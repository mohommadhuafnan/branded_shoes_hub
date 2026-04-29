import { useEffect } from 'react'
import { FaTimes, FaShoppingBag, FaBolt, FaStar } from 'react-icons/fa'
import { useShop } from '../context/ShopContext'

function ProductDetailModal({ product, onClose }) {
  const { addToCart, setIsCheckoutOpen, setIsCartOpen } = useShop()
  const safeSizes = product?.sizes?.length ? product.sizes : ['40', '41', '42']
  const safeRating = Number(product?.rating || 0)
  const safeStock = Number(product?.stock || 0)
  const safePrice = Number(product?.price || 0)
  const safeOriginal = product?.originalPrice ? Number(product.originalPrice) : null

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  if (!product) return null

  const handleBuy = () => {
    addToCart(product, safeSizes[0])
    setIsCartOpen(false)
    setIsCheckoutOpen(true)
    onClose()
  }

  return (
    <div className="product-detail-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="product-detail-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
      >
        <button type="button" className="product-detail-modal__close" onClick={onClose} aria-label="Close">
          <FaTimes />
        </button>
        <div className="product-detail-modal__grid">
          <div className="product-detail-modal__image">
            <img src={product.image} alt={product.name} />
          </div>
          <div className="product-detail-modal__body">
            <span className="product-detail-modal__badge">{product.badge || 'Product'}</span>
            <h2>{product.name}</h2>
            <p className="product-detail-modal__cat">{product.category || 'Shouse Hub'}</p>
            <div className="product-detail-modal__rating">
              <FaStar />
              <span>{safeRating.toFixed(1)}</span>
              <small>({safeStock} in stock)</small>
            </div>
            <p className="product-detail-modal__desc">{product.description || 'No description provided.'}</p>
            <div className="product-detail-modal__price">
              <strong>LKR {safePrice.toLocaleString()}</strong>
              {safeOriginal && <span>LKR {safeOriginal.toLocaleString()}</span>}
            </div>
            {safeSizes.length > 0 && (
              <p className="product-detail-modal__sizes">
                <span>Sizes:</span> {safeSizes.join(', ')}
              </p>
            )}
            <div className="product-detail-modal__actions">
              <button type="button" className="btn btn-secondary" onClick={() => addToCart(product, safeSizes[0])}>
                <FaShoppingBag /> Add to cart
              </button>
              <button type="button" className="btn btn-primary" onClick={handleBuy}>
                <FaBolt /> Buy now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailModal
