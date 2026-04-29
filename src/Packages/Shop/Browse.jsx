import CatalogPage from '../../Components/CatalogPage'
import { useShop } from '../../context/ShopContext'
import hero from '../../assets/Poster1.png'

function Browse() {
  const { products } = useShop()
  return (
    <CatalogPage
      eyebrow="Shouse Hub"
      title="Shop all products"
      description="Search and filter every item in one place — womens, mens, kids, and more."
      products={products}
      image={hero}
    />
  )
}

export default Browse
