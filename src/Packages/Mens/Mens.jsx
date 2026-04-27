import CatalogPage from '../../Components/CatalogPage'
import { useShop } from '../../context/ShopContext'
import hero1 from '../../assets/cal2.jpg'
import hero2 from '../../assets/cal3.jpg'
import hero3 from '../../assets/cal4.jpg'
import hero4 from '../../assets/cal5.jpg'
import MensHero from '../../Components/MensHero'

function Mens() {
  const { mensProducts } = useShop()
  const mensSlides = [
    {
      image: hero1,
      tag: 'Top Sale',
      title: 'Power, comfort, and style for every step.',
      desc: 'Explore premium mens footwear with modern looks and all-day comfort.',
    },
    {
      image: hero2,
      tag: 'Best Seller',
      title: 'Built for confidence and daily movement.',
      desc: 'Clean designs with durable quality and a sharp fashion finish.',
    },
    {
      image: hero3,
      tag: 'New Drop',
      title: 'Fresh mens arrivals with standout style.',
      desc: 'Modern shoes made for casual, street, and premium wear.',
    },
    {
      image: hero4,
      tag: 'Hot Picks',
      title: 'Top-rated pairs with premium comfort.',
      desc: 'Upgrade your wardrobe with trend-focused mens collections.',
    },
  ]

  return (
    <>
      <MensHero slides={mensSlides} />
      <CatalogPage hideHero={true} products={mensProducts} />
    </>
  )
}

export default Mens