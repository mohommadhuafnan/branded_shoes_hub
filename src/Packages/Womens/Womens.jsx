import CatalogPage from '../../Components/CatalogPage'
import { womensProducts } from '../../data/products'
import hero1 from '../../assets/newarri1.jpg'
import hero2 from '../../assets/newarri2.jpg'
import hero3 from '../../assets/newarri3.jpg'
import hero4 from '../../assets/newarri4.jpg'
import WomensHero from '../../Components/WomensHero'

function Womens() {
  const womensSlides = [
    {
      image: hero1,
      tag: 'Womens Collection',
      title: 'Elegant shoes for every confident step.',
      desc: 'Discover premium womens footwear with comfort, beauty, and modern fashion.',
    },
    {
      image: hero2,
      tag: 'New Arrival',
      title: 'Fresh styles that match your personality.',
      desc: 'Explore trendy designs made for everyday elegance and comfort.',
    },
    {
      image: hero3,
      tag: 'Hot Picks',
      title: 'Modern collections made for stylish women.',
      desc: 'From casual looks to premium fits, find the pair that completes your outfit.',
    },
    {
      image: hero4,
      tag: 'Best Seller',
      title: 'Step into comfort with fashion-forward designs.',
      desc: 'Soft feel, premium finish, and standout style in every pair.',
    },
  ]

  return (
    <>
      <WomensHero slides={womensSlides} />
      <CatalogPage hideHero={true} products={womensProducts} />
    </>
  )
}

export default Womens