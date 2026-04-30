import { useShop } from '../../context/ShopContext'
import ProductCard from '../../Components/ProductCard'
import hero from '../../assets/Poster3.png'
import './Sales.css'

function Sales() {
  const { saleProducts } = useShop()
  const withHotSaleBadge = (product) => ({ ...product, badge: 'Hot Sale' })

  return (
    <div className="sales-page page-shell">
      <section className="sales-hero">
        <div className="sales-hero-overlay" />

        <div className="sales-hero-content">
          <div className="sales-left">
            <span className="hot-badge">Hot Sale</span>
            <h1>Big fashion deals for modern style</h1>
            <p>
              Same product cards as Home, Kids, Mens, and Womens — consistent layout, sizes, and checkout.
            </p>

            <div className="sales-buttons">
              <a href="#sales-products" className="shop-btn">
                Shop now
              </a>
              <a href="#featured-sale" className="offer-btn">
                Featured offers
              </a>
            </div>

            <div className="offer-cards">
              <div className="offer-box">
                <h3>Up to 50% off</h3>
                <p>Selected collections</p>
              </div>
              <div className="offer-box">
                <h3>Limited stock</h3>
                <p>Grab your size today</p>
              </div>
              <div className="offer-box">
                <h3>Fast checkout</h3>
                <p>Buy now adds one item to checkout</p>
              </div>
            </div>
          </div>

          <div className="sales-right">
            <div className="hero-image-card">
              <img src={hero} alt="Sale banner" />
              <div className="floating-sale-card">
                <span>Special offer</span>
                <h2>Sale</h2>
                <p>Premium picks — list price shown when on discount</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-gap" id="featured-sale">
        <div className="section-head">
          <div>
            <span className="eyebrow">Trending offer</span>
            <h2>Featured sale products</h2>
          </div>
          <p>Rotating highlights use the same card design as the rest of the store.</p>
        </div>

        <div className="product-grid compact-grid">
          {saleProducts.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={withHotSaleBadge(product)} />
          ))}
        </div>
      </section>

      <section className="section-gap" id="sales-products">
        <div className="section-head">
          <div>
            <span className="eyebrow">All deals</span>
            <h2>Hot sale products</h2>
          </div>
        </div>

        {saleProducts.length === 0 ? (
          <p className="sales-empty">No sale items yet. Add a sale price lower than list price in the admin product form.</p>
        ) : (
          <div className="product-grid">
            {saleProducts.map((product) => (
              <ProductCard key={product.id} product={withHotSaleBadge(product)} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Sales
