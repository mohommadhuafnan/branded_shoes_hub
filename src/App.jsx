import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { getRedirectResult } from 'firebase/auth'
import { auth } from './firebase'
import Nav from './Components/Nav'
import Footer from './Components/Footer'
import Home from './Packages/Home/Home'
import Kids from './Packages/Kids/Kids'
import Mens from './Packages/Mens/Mens'
import Womens from './Packages/Womens/Womens'
import Sales from './Packages/Sales/Sales'
import Contact from './Packages/Contact/Contact'
import Auth from './Packages/Auth/Auth'
import AdminDashboard from './Packages/Admin/AdminDashboard'
import Settings from './Packages/Settings/Settings'
import MyOrders from './Packages/User/MyOrders'
import CartDrawer from './Components/CartDrawer'
import PaymentModal from './Components/PaymentModal'
import WhatsAppFloat from './Components/WhatsAppFloat'
import { useShop } from './context/ShopContext'
import { useScrollAnimations } from './hooks/useScrollAnimations'
import { API_BASE, authHeaders } from './lib/api'

const ADMIN_LOGIN_PATH = '/admin-login'

function Toast() {
  const { toast } = useShop()
  if (!toast) return null

  return (
    <div className={`toast ${toast.variant || 'success'}`}>
      <strong>{toast.title}</strong>
      <span>{toast.message}</span>
    </div>
  )
}

function App() {
  useScrollAnimations()
  const { completeOrder, showToast } = useShop()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    let cancelled = false
    getRedirectResult(auth)
      .then((result) => {
        if (cancelled || !result?.user) return
        localStorage.setItem('token', result.user.uid)
        localStorage.setItem(
          'user',
          JSON.stringify({
            name: result.user.displayName || 'User',
            email: result.user.email,
            role: 'user',
          }),
        )
        window.dispatchEvent(new Event('storage'))
        showToast('Success', `Welcome, ${result.user.displayName || 'User'}!`, 'success')
        navigate('/')
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [navigate, showToast])

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      const pendingOrder = localStorage.getItem('pendingOrder');
      if (pendingOrder) {
        const orderData = JSON.parse(pendingOrder);
        const orderUrl = `${API_BASE}/orders`
        fetch(orderUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: pendingOrder
        })
        .then(res => {
          if(!res.ok) throw new Error('Order creation failed');
          return res.json();
        })
        .then(() => {
          localStorage.removeItem('pendingOrder');
          completeOrder(orderData.customerName);
          showToast('Payment Successful', 'Your order has been placed via Stripe!', 'success');
          window.history.replaceState(null, '', window.location.pathname + window.location.hash);
        })
        .catch(err => {
          showToast('Error', err.message, 'warning');
        });
      }
    }
    if (query.get("canceled")) {
      showToast('Payment Canceled', 'You canceled the payment.', 'warning');
      window.history.replaceState(null, '', window.location.pathname + window.location.hash);
    }
  }, [completeOrder, showToast]);

  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const isAdmin = user?.role === 'admin'
  const hidePublicLayout = [
    '/login',
    '/register',
    '/admin-login',
    '/client-admin-auth-portal',
    '/secure-admin-login-x9k2p7',
    '/admin',
  ].includes(location.pathname)

  return (
    <div className="app-shell">
      {!hidePublicLayout && <Nav />}

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/kids" element={<Kids />} />
          <Route path="/mens" element={<Mens />} />
          <Route path="/womens" element={<Womens />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/my-orders" element={user ? <MyOrders /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={<Auth mode="user" initialView="login" />} />
          <Route path="/register" element={<Auth mode="user" initialView="signup" />} />
          <Route path="/client-admin-auth-portal" element={<Navigate to={ADMIN_LOGIN_PATH} replace />} />
          <Route path="/secure-admin-login-x9k2p7" element={<Navigate to={ADMIN_LOGIN_PATH} replace />} />
          <Route path={ADMIN_LOGIN_PATH} element={<Auth mode="admin" initialView="login" />} />
          <Route
            path="/admin"
            element={isAdmin ? <AdminDashboard /> : <Navigate to={ADMIN_LOGIN_PATH} replace />}
          />
        </Routes>
      </main>

      {!hidePublicLayout && <Footer />}
      <CartDrawer />
      <PaymentModal />
      <WhatsAppFloat />
      <Toast />
    </div>
  )
}

export default App