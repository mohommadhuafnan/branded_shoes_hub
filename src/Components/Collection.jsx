import Col1 from '../assets/cal1.jpg'
import Col2 from '../assets/cal2.jpg'
import Col3 from '../assets/cal3.jpg'
import Col4 from '../assets/cal4.jpg'
import Col5 from '../assets/cal5.jpg'

function Collection() {
  const products = [
    {
      id: 1,
      image: Col1,
      title: 'Classic Fashion',
      desc: 'Modern style with premium comfort for daily wear.',
      price: 'LKR 4,500',
    },
    {
      id: 2,
      image: Col2,
      title: 'Elegant Outfit',
      desc: 'Soft fabric and trendy design for every occasion.',
      price: 'LKR 3,900',
    },
    {
      id: 3,
      image: Col3,
      title: 'New Arrival',
      desc: 'Stylish collection with a fresh market look.',
      price: 'LKR 5,200',
    },
    {
      id: 4,
      image: Col4,
      title: 'Premium Choice',
      desc: 'Perfect fit with a smart and attractive design.',
      price: 'LKR 4,800',
    },
    {
      id: 5,
      image: Col5,
      title: 'Trending Style',
      desc: 'Comfortable and fashionable for everyday use.',
      price: 'LKR 4,200',
    },
  ]

  const handleAddToCart = (product) => {
    alert(`${product.title} added to cart`)
  }

  return (
    <section className="collection-section section-gap" data-reveal>
      <div className="section-head">
        <div>
          <span className="eyebrow">Style Gallery</span>
          <h2>Curated collection picks</h2>
        </div>
        <p>Explore standout styles before you jump into our flash deals.</p>
      </div>

      <div className="collection-grid">
        {products.map((product, index) => (
          <div
            className={`collection-box ${index === 0 ? 'big-box' : ''}`}
            key={product.id}
          >
            <img src={product.image} alt={product.title} />

            <div className="collection-overlay">
              <h3>{product.title}</h3>
              <p>{product.desc}</p>
              <span>{product.price}</span>
              <button onClick={() => handleAddToCart(product)}>
                Add To Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Collection