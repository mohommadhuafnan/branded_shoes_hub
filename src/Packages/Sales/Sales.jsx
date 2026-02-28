import CatalogPage from '../../Components/CatalogPage'
import { saleProducts } from '../../data/products'
import hero from '../../assets/Poster3.png'

function Sales() {
  return (
    <CatalogPage
      eyebrow="Sales Collection"
      title="Flash deals and limited-time offers for premium savings."
      description="This sales page shows discounted products with the same premium card system and checkout flow."
      products={saleProducts}
      image={hero}
    />
  )
}

export default Sales
