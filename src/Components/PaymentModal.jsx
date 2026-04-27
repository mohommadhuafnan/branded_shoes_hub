import { useEffect, useState } from 'react'
import { FaCheckCircle, FaCreditCard, FaMoneyBillWave, FaUniversity, FaTimes, FaWallet } from 'react-icons/fa'
import { useShop } from '../context/ShopContext'
import { API_BASE, authHeaders } from '../lib/api'

function PaymentModal() {
  const { isCheckoutOpen, setIsCheckoutOpen, cartSummary, cartItems, completeOrder, showToast, settings } = useShop()
  const [form, setForm] = useState({
    name: settings?.fullName || '',
    phone: settings?.phone || '',
    address: settings?.address || '',
    city: '',
    method: settings?.preferredPayment || 'card',
  })

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      name: prev.name || settings?.fullName || '',
      phone: prev.phone || settings?.phone || '',
      address: prev.address || settings?.address || '',
      method: settings?.preferredPayment || 'card',
    }))
  }, [settings?.preferredPayment, settings?.fullName, settings?.phone, settings?.address])

  const submitOrder = async (event) => {
    event.preventDefault()
    if (!form.name || !form.phone || !form.address || !form.city) {
      showToast('Missing details', 'Please fill in your delivery information.', 'warning')
      return
    }
    try {
      const userStr = localStorage.getItem('user')
      const user = userStr ? JSON.parse(userStr) : {}
      
      const payload = {
        customerName: form.name,
        customerEmail: user.email || '',
        customerPhone: form.phone,
        address: form.address,
        city: form.city,
        paymentMethod: form.method,
        totalPrice: cartSummary.total,
        status: 'Pending',
        createdAt: new Date().toISOString(),
        items: cartItems.map((item) => ({
          productId: item.id,
          productName: item.name,
          size: item.size,
          quantity: item.qty,
          price: item.price
        }))
      }

      if (form.method === 'card') {
        showToast('Notice', 'Stripe card payments are disabled in Firebase-only mode. Order saved as Pending.', 'info')
      }

      const { ref, push } = await import('firebase/database')
      const { db } = await import('../firebase')
      await push(ref(db, 'orders'), payload)

      completeOrder(form.name)
      setForm({ name: '', phone: '', address: '', city: '', method: 'card' })
    } catch (error) {
      showToast('Checkout failed', error.message, 'warning')
    }
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
                <button type="button" className={form.method === 'wallet' ? 'payment-pill active' : 'payment-pill'} onClick={() => setForm({ ...form, method: 'wallet' })}>
                  <FaWallet /> Wallet / UPI
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
