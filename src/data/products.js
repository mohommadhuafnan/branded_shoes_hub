import cal1 from '../assets/cal1.jpg'
import cal2 from '../assets/cal2.jpg'
import cal3 from '../assets/cal3.jpg'
import cal4 from '../assets/cal4.jpg'
import cal5 from '../assets/cal5.jpg'
import new1 from '../assets/newarri1.jpg'
import new2 from '../assets/newarri2.jpg'
import new3 from '../assets/newarri3.jpg'
import new4 from '../assets/newarri4.jpg'
import new5 from '../assets/newarri5.jpg'
import new6 from '../assets/newarri6.jpg'

const imagePool = [cal1, cal2, cal3, cal4, cal5, new1, new2, new3, new4, new5, new6, cal1]
const sizeSets = {
  womens: ['36', '37', '38', '39', '40'],
  mens: ['40', '41', '42', '43', '44'],
  kids: ['28', '29', '30', '31', '32'],
}

const womensNames = [
  'Velvet Street Sneaker', 'Rose Glow Runner', 'Cloud Walk Flats', 'Luna Comfort Slip-On',
  'Urban Chic Trainer', 'Blush Motion Shoes', 'Soft Step Casual', 'Pearl Active Knit',
  'Shine Flex Court', 'Silk Motion Sneaker', 'Aurora Daily Step', 'Classic Grace Pair',
]
const mensNames = [
  'Metro Pace Sneaker', 'Titan Street Walk', 'Aero Motion Runner', 'Prime Comfort Slip',
  'Rush Flex Trainer', 'Summit Trail Step', 'Power Court Classic', 'Motion Grid Shoes',
  'Urban Track Pro', 'Night Sprint Mesh', 'Civic Edge Pair', 'Fusion Grip Runner',
]
const kidsNames = [
  'Mini Jump Shoes', 'Play Time Runner', 'Bright Step Kids', 'Little Star Sneaker',
  'Rocket Dash Pair', 'Happy Walk Sandals', 'Zoom Fun Trainer', 'Color Pop Shoes',
  'Tiny Sprint Mesh', 'School Day Comfort', 'Bounce Buddy Pair', 'Dream Step Kids',
]

function makeProducts(category, names, basePrice, saleEvery = 0, deliveryTag) {
  return names.map((name, index) => {
    const price = basePrice + index * 350
    const originalPrice = saleEvery && index % saleEvery === 0 ? price + 2200 : null
    return {
      id: `${category}-${index + 1}`,
      name,
      category,
      image: imagePool[index % imagePool.length],
      price,
      originalPrice,
      sizes: sizeSets[category],
      rating: 4.2 + ((index % 5) * 0.15),
      stock: 6 + index,
      deliveryTag,
      badge: originalPrice ? 'Sale' : index % 3 === 0 ? 'New' : 'Top Pick',
      description: `${name} blends premium comfort, trend-focused style, and easy daily wear for busy city shoppers.`,
    }
  })
}

export const womensProducts = makeProducts('womens', womensNames, 4900, 3, 'Free delivery above LKR 15,000')
export const mensProducts = makeProducts('mens', mensNames, 5600, 4, 'Islandwide express delivery')
export const kidsProducts = makeProducts('kids', kidsNames, 3200, 2, 'Fast school-week shipping')

export const saleProducts = [...womensProducts, ...mensProducts, ...kidsProducts]
  .filter((product) => product.originalPrice)
  .map((product, index) => ({
    ...product,
    id: `sale-${product.id}`,
    badge: index % 2 === 0 ? 'Hot Sale' : 'Flash Deal',
  }))
  .slice(0, 12)

export const allProducts = [...womensProducts, ...mensProducts, ...kidsProducts]

export const homeHighlights = allProducts.slice(0, 12)

export const shopBenefits = [
  { title: 'Cash on Delivery', text: 'Flexible payment options for every district in Sri Lanka.' },
  { title: 'Secure Checkout', text: 'Card, online banking, Koko, and wallet-ready checkout flow.' },
  { title: 'Fast Delivery', text: 'Same-day dispatch for ready stock and tracked delivery updates.' },
]
