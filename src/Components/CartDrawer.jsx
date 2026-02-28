import { FaMinus, FaPlus, FaTimes, FaTrash, FaCreditCard } from 'react-icons/fa'
import { useShop } from '../context/ShopContext'

function CartDrawer() {
  const {
    cartItems,
    cartSummary,
    isCartOpen,
    setIsCartOpen,
    setIsCheckoutOpen,
    updateCartQuantity,
    removeFromCart,
  } = useShop()

  return (
    <>
      <div className={`overlay ${isCartOpen ? 'show' : ''}`} onClick={() => setIsCartOpen(false)} />
      <aside className={`drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="drawer-head">
          <div>
            <span className="eyebrow">Shopping Cart</span>
            <h3>{cartSummary.itemCount} items selected</h3>
          </div>
          <button type="button" className="icon-btn" onClick={() => setIsCartOpen(false)}>
            <FaTimes />
          </button>
        </div>

        <div className="drawer-body">
          {cartItems.length === 0 ? (
            <div className="empty-state compact">
              <h3>Your cart is empty</h3>
              <p>Add products from Home, Kids, Mens, Womens, or Sales to continue.</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div className="cart-item" key={`${item.id}-${item.size}`}>
                <img src={item.image} alt={item.name} />
                <div className="cart-item-info">
                  <h4>{item.name}</h4>
                  <p>Size {item.size}</p>
                  <strong>LKR {(item.price * item.qty).toLocaleString()}</strong>
                  <div className="qty-row">
                    <button type="button" onClick={() => updateCartQuantity(item.id, item.size, item.qty - 1)}>
                      <FaMinus />
                    </button>
                    <span>{item.qty}</span>
                    <button type="button" onClick={() => updateCartQuantity(item.id, item.size, item.qty + 1)}>
                      <FaPlus />
                    </button>
                    <button type="button" className="trash-btn" onClick={() => removeFromCart(item.id, item.size)}>
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="drawer-foot">
          <div className="summary-row"><span>Subtotal</span><strong>LKR {cartSummary.subtotal.toLocaleString()}</strong></div>
          <div className="summary-row"><span>Discount</span><strong>- LKR {cartSummary.discount.toLocaleString()}</strong></div>
          <div className="summary-row"><span>Delivery</span><strong>LKR {cartSummary.delivery.toLocaleString()}</strong></div>
          <div className="summary-row total"><span>Total</span><strong>LKR {cartSummary.total.toLocaleString()}</strong></div>

          <div className="delivery-note">
            <h4>Online Delivery Details</h4>
            <p>Colombo 1–15: same-day dispatch</p>
            <p>Western Province: 1–2 working days</p>
            <p>Other districts: 2–4 working days</p>
          </div>

          <button
            type="button"
            className="btn btn-primary full"
            disabled={!cartItems.length}
            onClick={() => setIsCheckoutOpen(true)}
          >
            <FaCreditCard /> Proceed to Checkout
          </button>
        </div>
      </aside>
    </>
  )
}

export default CartDrawer
