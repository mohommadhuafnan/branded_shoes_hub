import CatalogPage from '../../Components/CatalogPage'
import { useShop } from '../../context/ShopContext'
import hero from '../../assets/kids1.jpg'

function Kids() {
  const { kidsProducts } = useShop()
  return (
    <CatalogPage
      eyebrow="Kids Collection"
      title="Kids shoes that are colorful, durable, and ready for daily play."
      description="Browse 12 kids products with left-side filters for size, price, sale items, and ready stock."
      products={kidsProducts}
      image={hero}
    />
  )
}

export default Kids
