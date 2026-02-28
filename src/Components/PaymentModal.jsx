import { useState } from 'react'
import { FaCheckCircle, FaCreditCard, FaMoneyBillWave, FaUniversity, FaTimes } from 'react-icons/fa'
import { useShop } from '../context/ShopContext'

function PaymentModal() {
  const { isCheckoutOpen, setIsCheckoutOpen, cartSummary, cartItems, completeOrder, showToast } = useShop()
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    method: 'card',
  })

  const submitOrder = (event) => {
    event.preventDefault()
    if (!form.name || !form.phone || !form.address || !form.city) {
      showToast('Missing details', 'Please fill in your delivery information.', 'warning')
      return
    }
    completeOrder(form.name)
    setForm({ name: '', phone: '', address: '', city: '', method: 'card' })
  }

  return (
    <>
      <div className={`overlay ${isCheckoutOpen ? 'show' : ''}`} onClick={() => setIsCheckoutOpen(false)} />
      <section className={`payment-modal ${isCheckoutOpen ? 'open' : ''}`}>
        <div className="drawer-head">
          <div>
            <span className="eyebrow">Checkout</span>
            <h3>Complete your order</h3>
          </div>
          <button type="button" className="icon-btn" onClick={() => setIsCheckoutOpen(false)}>
            <FaTimes />
          </button>
        </div>

        <form className="payment-form" onSubmit={submitOrder}>
          <div className="checkout-grid">
            <div className="checkout-panel">
              <h4>Delivery Information</h4>
              <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <textarea placeholder="Delivery address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <input placeholder="City / District" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />

              <div className="payment-methods">
                <button type="button" className={form.method === 'card' ? 'payment-pill active' : 'payment-pill'} onClick={() => setForm({ ...form, method: 'card' })}>
                  <FaCreditCard /> Card Payment
                </button>
                <button type="button" className={form.method === 'koko' ? 'payment-pill active' : 'payment-pill'} onClick={() => setForm({ ...form, method: 'koko' })}>
                  <FaCheckCircle /> Koko / Pay Later
                </button>
                <button type="button" className={form.method === 'cod' ? 'payment-pill active' : 'payment-pill'} onClick={() => setForm({ ...form, method: 'cod' })}>
                  <FaMoneyBillWave /> Cash on Delivery
                </button>
                <button type="button" className={form.method === 'bank' ? 'payment-pill active' : 'payment-pill'} onClick={() => setForm({ ...form, method: 'bank' })}>
                  <FaUniversity /> Bank Transfer
                </button>
              </div>
            </div>

            <div className="checkout-panel dark">
              <h4>Order Summary</h4>
              <p>{cartItems.length} unique items in your cart.</p>
              <div className="summary-row"><span>Subtotal</span><strong>LKR {cartSummary.subtotal.toLocaleString()}</strong></div>
              <div className="summary-row"><span>Discount</span><strong>- LKR {cartSummary.discount.toLocaleString()}</strong></div>
              <div className="summary-row"><span>Delivery</span><strong>LKR {cartSummary.delivery.toLocaleString()}</strong></div>
              <div className="summary-row total"><span>Total</span><strong>LKR {cartSummary.total.toLocaleString()}</strong></div>
              <div className="delivery-note slim">
                <h4>Payment Success Message</h4>
                <p>After checkout, customers receive an alert and order success confirmation.</p>
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary full large">
            Confirm Payment - LKR {cartSummary.total.toLocaleString()}
          </button>
        </form>
      </section>
    </>
  )
}

export default PaymentModal
