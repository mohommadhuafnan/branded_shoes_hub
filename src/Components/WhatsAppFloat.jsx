import { FaWhatsapp } from 'react-icons/fa'
import { useShop } from '../context/ShopContext'

function WhatsAppFloat() {
  const { content } = useShop()
  const number = content?.whatsappNumber || '94772117131'
  return (
    <a
      className="whatsapp-float"
      href={`https://wa.me/${number}?text=Hello%20Shoes%20Hub%2C%20I%20need%20help%20with%20my%20order.`}
      target="_blank"
      rel="noreferrer"
      aria-label="WhatsApp support"
    >
      <FaWhatsapp />
    </a>
  )
}

export default WhatsAppFloat
