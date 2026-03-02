import { useEffect, useState } from 'react'
import { saleProducts } from '../../data/products'
import hero from '../../assets/Poster3.png'
import './Sales.css'

function Sales() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % saleProducts.length)
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="sales-page">
      {/* HERO SECTION */}
      <section className="sales-hero">
        <div className="sales-hero-overlay"></div>

        <div className="sales-hero-content">
          <div className="sales-left">
            <span className="hot-badge">🔥 Hot Sale</span>
            <h1>Big Fashion Deals for Modern Style</h1>
            <p>
              Discover premium discounted items with a bold modern layout,
              animated offers, and exclusive limited-time deals.
            </p>

            <div className="sales-buttons">
              <a href="#sales-products" className="shop-btn">Shop Now</a>
              <a href="#featured-sale" className="offer-btn">View Offers</a>
            </div>

            <div className="offer-cards">
              <div className="offer-box">
                <h3>Up to 50% Off</h3>
                <p>Selected fashion collections</p>
              </div>
              <div className="offer-box">
                <h3>Limited Stock</h3>
                <p>Grab your favorites today</p>
              </div>
              <div className="offer-box">
                <h3>Fast Checkout</h3>
                <p>Smooth shopping experience</p>
              </div>
            </div>
          </div>

          <div className="sales-right">
            <div className="hero-image-card">
              <img src={hero} alt="Hot Sale Banner" />
              <div className="floating-sale-card">
                <span>Special Offer</span>
                <h2>30% OFF</h2>
                <p>Premium collection today only</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED SALE SECTION */}
      <section className="featured-sale" id="featured-sale">
        <div className="featured-text">
          <span className="section-tag">Trending Offer</span>
          <h2>Modern Deals With Animated Premium Style</h2>
          <p>
            This sales section is different from your normal catalog layout.
            It gives a modern landing-page look with animation, highlights,
            and stylish product presentation.
          </p>
        </div>

        <div className="featured-slider">
          {saleProducts.slice(0, 4).map((item, index) => (
            <div
              className={`featured-card ${activeIndex === index ? 'active-card' : ''}`}
              key={item.id}
            >
              <img src={item.image} alt={item.name} />
              <div className="featured-card-content">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <span>{item.price}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCTS SECTION */}
      <section className="sales-products-section" id="sales-products">
        <div className="section-heading">
          <span className="section-tag">Discount Products</span>
          <h2>Hot Sale Products</h2>
          <p>Enjoy an upgraded layout with stylish cards and hover animations.</p>
        </div>

        <div className="sales-grid">
          {saleProducts.map((product) => (
            <div className="sales-card" key={product.id}>
              <div className="sales-card-image">
                <img src={product.image} alt={product.name} />
                <span className="discount-label">Sale</span>
              </div>

              <div className="sales-card-body">
                <h3>{product.name}</h3>
                <p>{product.description}</p>

                <div className="sales-price-row">
                  <span className="new-price">{product.price}</span>
                  <span className="old-price">LKR 8,500</span>
                </div>

                <div className="sales-card-buttons">
                  <button>Add to Cart</button>
                  <button className="buy-btn">Buy Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Sales