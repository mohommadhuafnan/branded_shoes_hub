import { Route, Routes } from 'react-router-dom'
import Nav from './Components/Nav'
import Footer from './Components/Footer'
import Home from './Packages/Home/Home'
import Kids from './Packages/Kids/Kids'
import Mens from './Packages/Mens/Mens'
import Womens from './Packages/Womens/Womens'
import Sales from './Packages/Sales/Sales'
import Contact from './Packages/Contact/Contact'
import CartDrawer from './Components/CartDrawer'
import PaymentModal from './Components/PaymentModal'
import WhatsAppFloat from './Components/WhatsAppFloat'
import { useShop } from './context/ShopContext'
import { useScrollAnimations } from './hooks/useScrollAnimations'

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

  return (
    <div className="app-shell">
      <Nav />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/kids" element={<Kids />} />
          <Route path="/mens" element={<Mens />} />
          <Route path="/womens" element={<Womens />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>

      <Footer />
      <CartDrawer />
      <PaymentModal />
      <WhatsAppFloat />
      <Toast />
    </div>
  )
}

export default App