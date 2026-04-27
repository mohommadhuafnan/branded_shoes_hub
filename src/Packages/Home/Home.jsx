import { useEffect, useMemo, useState } from 'react'
import { FaArrowRight, FaCheckCircle, FaFire, FaShieldAlt, FaTruck } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import ProductCard from '../../Components/ProductCard'
import Brand from '../../Components/Brand'
import Collection from '../../Components/Collection'
import Details from '../../Components/Details'
import { useShop } from '../../context/ShopContext'
import banner1 from '../../assets/Poster1.png'
import banner2 from '../../assets/Poster2.png'
import banner3 from '../../assets/Poster3.png'
import banner4 from '../../assets/poster4.png'

function Home() {
  const { homeHighlights, saleProducts, content } = useShop()
  const shopBenefits = [
    { title: 'Cash on Delivery', text: 'Flexible payment options for every district in Sri Lanka.' },
    { title: 'Secure Checkout', text: 'Card, online banking, Koko, and wallet-ready checkout flow.' },
    { title: 'Fast Delivery', text: 'Same-day dispatch for ready stock and tracked delivery updates.' },
  ]
  const slides = useMemo(
    () => [
      {
        img: banner1,
        title: content?.heroTitle || 'New Season Drops',
        desc: content?.heroDescription || 'Fresh styles, limited stock. Grab your size now.',
        tag: content?.heroTag || 'Up to 25% off',
        productId: 'poster-1',
      },
      {
        img: banner2,
        title: 'Streetwear Essentials',
        desc: 'Comfort + style for everyday looks.',
        tag: 'Trending',
        productId: 'poster-2',
      },
      {
        img: banner3,
        title: 'Premium Collection',
        desc: 'Clean silhouettes. High-quality materials.',
        tag: 'New',
        productId: 'poster-3',
      },
      {
        img: banner4,
        title: 'Sale Picks',
        desc: 'Best deals of the week. Don’t miss out.',
        tag: 'Hot Deals',
        productId: 'poster-4',
      },
    ],
    [content]
  )

  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  const intervalMs = 4500

  const next = () => setActive((p) => (p + 1) % slides.length)
  const prev = () => setActive((p) => (p - 1 + slides.length) % slides.length)

  useEffect(() => {
    if (paused) return
    const id = setInterval(next, intervalMs)
    return () => clearInterval(id)
  }, [paused, slides.length])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleAddToCart = (slide) => {
    console.log('Add to cart:', slide.productId)
    alert(`${slide.title} added to cart`)
  }

  return (
    <div className="page-shell home-page">
      <section
        className="hero"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        aria-label="Promotional banners"
      >
        <div className="hero__track">
          {slides.map((s, i) => (
            <article
              key={s.productId}
              className={`hero__slide ${i === active ? 'is-active' : ''}`}
              aria-hidden={i !== active}
            >
              <img className="hero__img" src={s.img} alt={s.title} />
              <div className="hero__overlay" />

              <div className="hero__content">
                <span className="hero__pill">{s.tag}</span>
                <h1 className="hero__title">{s.title}</h1>
                <p className="hero__desc">{s.desc}</p>

                <div className="hero__actions">
                  <button
                    className="hero-btn hero-btn--primary"
                    onClick={() => handleAddToCart(s)}
                  >
                    Add to Cart
                  </button>

                  <button
                    className="hero-btn hero-btn--ghost"
                    onClick={next}
                  >
                    View Next
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <button
          className="hero__arrow hero__arrow--left"
          onClick={prev}
          aria-label="Previous slide"
        >
          ‹
        </button>

        <button
          className="hero__arrow hero__arrow--right"
          onClick={next}
          aria-label="Next slide"
        >
          ›
        </button>

        <div className="hero__dots" role="tablist" aria-label="Slide navigation">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`hero__dot ${i === active ? 'is-active' : ''}`}
              onClick={() => setActive(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        <div className={`hero__progress ${paused ? 'is-paused' : ''}`}>
          <span
            key={active}
            className="hero__progressBar"
            style={{ animationDuration: `${intervalMs}ms` }}
          />
        </div>
      </section>

      <section className="feature-strip section-gap">
        {shopBenefits.map((item) => (
          <article className="benefit-card" key={item.title} data-reveal>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      <section className="double-banner section-gap">
        <div className="promo-card dark reveal-left" data-reveal>
          <span className="eyebrow">Limited Drop</span>
          <h2>New season arrivals with premium comfort and sharp street style.</h2>
          <p>Use the filters on each page to sort by price, size, rating, and sale items.</p>
          <Link to="/sales" className="btn btn-primary">
            Shop Sales <FaArrowRight />
          </Link>
        </div>

        <div className="promo-card image reveal-right" data-reveal>
          <img src={banner2} alt="Season sale" />
        </div>
      </section>

      <Brand />

      <section className="section-gap">
        <div className="section-head reveal-up" data-reveal>
          <div>
            <span className="eyebrow">Trending Now</span>
            <h2>12 featured products</h2>
          </div>
          <p>Same premium card design is used across Home, Kids, Mens, Womens, and Sales.</p>
        </div>

        <div className="product-grid">
          {homeHighlights.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="stats-panel section-gap">
        <div className="stat-card reveal-up" data-reveal>
          <FaFire />
          <strong>Flash Deals</strong>
          <span>Fresh discounts updated for seasonal offers.</span>
        </div>

        <div className="stat-card reveal-up" data-reveal>
          <FaTruck />
          <strong>Islandwide Delivery</strong>
          <span>Tracked delivery updates for every order.</span>
        </div>

        <div className="stat-card reveal-up" data-reveal>
          <FaShieldAlt />
          <strong>Secure Payments</strong>
          <span>Card, Koko, COD, and bank-transfer flow.</span>
        </div>

        <div className="stat-card reveal-up" data-reveal>
          <FaCheckCircle />
          <strong>Happy Customers</strong>
          <span>Comfort-first designs with easy exchange support.</span>
        </div>
      </section>

      <Collection />

      <section className="section-gap">
        <div className="section-head reveal-up" data-reveal>
          <div>
            <span className="eyebrow">Hot Sale</span>
            <h2>Flash deals you can buy right now</h2>
          </div>
        </div>

        <div className="product-grid compact-grid">
          {saleProducts.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <Details />
    </div>
  )
}

export default Home