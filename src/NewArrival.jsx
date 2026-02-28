import new1 from './assets/newarri1.jpg'
import new2 from './assets/newarri2.jpg'
import new3 from './assets/newarri3.jpg'
import new4 from './assets/newarri4.jpg'
import new5 from './assets/newarri5.jpg'
import new6 from './assets/newarri6.jpg'

function NewArrival() {
  const products = [
    {
      id: 1,
      name: "Classic Sneakers",
      image: new1,
      price: "LKR 7,500",
      category: "Men Shoes",
      rating: "4.8",
      stock: "In Stock",
      desc: "Comfortable daily wear sneakers with modern design.",
      sizes: ["39", "40", "41", "42"]
    },
    {
      id: 2,
      name: "Running Shoes",
      image: new2,
      price: "LKR 8,900",
      category: "Sport Shoes",
      rating: "4.7",
      stock: "In Stock",
      desc: "Lightweight running shoes for speed and flexibility.",
      sizes: ["40", "41", "42", "43"]
    },
    {
      id: 3,
      name: "Casual Street Shoes",
      image: new3,
      price: "LKR 6,800",
      category: "Casual Shoes",
      rating: "4.6",
      stock: "Limited",
      desc: "Stylish street fashion shoes for everyday use.",
      sizes: ["38", "39", "40", "41"]
    },
    {
      id: 4,
      name: "Sport Edition",
      image: new4,
      price: "LKR 9,200",
      category: "Premium Sport",
      rating: "4.9",
      stock: "In Stock",
      desc: "Premium sport shoes with extra grip and comfort.",
      sizes: ["40", "41", "42", "44"]
    },
    {
      id: 5,
      name: "Modern Fashion Shoes",
      image: new5,
      price: "LKR 7,950",
      category: "Fashion Shoes",
      rating: "4.5",
      stock: "In Stock",
      desc: "Trendy fashion shoes with elegant modern finish.",
      sizes: ["39", "40", "41", "42"]
    },
    {
      id: 6,
      name: "Premium Sneakers",
      image: new6,
      price: "LKR 10,500",
      category: "Sneakers",
      rating: "5.0",
      stock: "New Stock",
      desc: "High-quality premium sneakers with stylish comfort.",
      sizes: ["41", "42", "43", "44"]
    }
  ]

  return (
    <section className="new-arrival-section">
      <div className="new-arrival-title">
        <h2>New Arrivals</h2>
        <p>Discover the latest shoes with modern style, comfort, and affordable prices.</p>
      </div>

      <div className="new-arrival-container">
        {products.map((product) => (
          <div className="arrival-card" key={product.id}>
            <div className="arrival-img-box">
              <img src={product.image} alt={product.name} />
              <span className="arrival-badge">New</span>
            </div>

            <div className="arrival-content">
              <h3>{product.name}</h3>

              <div className="price-row">
                <p className="arrival-price">{product.price}</p>
                <span className="koko-text">Koko</span>
              </div>

              <p className="arrival-desc">{product.desc}</p>

              <div className="arrival-info">
                <span><strong>Category:</strong> {product.category}</span>
                <span><strong>Rating:</strong> ⭐ {product.rating}</span>
                <span><strong>Status:</strong> {product.stock}</span>
              </div>

              <div className="size-section">
                <h4>Size</h4>
                <div className="sizes">
                  {product.sizes.map((size, index) => (
                    <span key={index}>{size}</span>
                  ))}
                </div>
              </div>

              <div className="arrival-buttons">
                <button className="cart-btn">Add To Cart</button>
                <button className="buy-btn">Buy Now</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default NewArrival