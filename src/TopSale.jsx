import Col1 from './assets/cal1.jpg';
import Col2 from './assets/cal2.jpg';
import Col3 from './assets/cal3.jpg';
import Col4 from './assets/cal4.jpg';
import Col5 from './assets/cal5.jpg';
import Col6 from './assets/newarri5.jpg';
import { FaFire } from "react-icons/fa";

function TopSale() {
  const products = [
    {
      id: 1,
      image: Col1,
      title: "Classic Fashion",
      desc: "Modern style with premium comfort for daily wear.",
      price: "LKR 4,500",
      badge: "Top Sale",
      category: "Fashion Wear",
      rating: "4.8",
      stock: "In Stock",
      sizes: ["38", "39", "40", "41", "42"]
    },
    {
      id: 2,
      image: Col2,
      title: "Elegant Outfit",
      desc: "Soft fabric and trendy design for every occasion.",
      price: "LKR 3,900",
      badge: "Top Sale",
      category: "Casual Wear",
      rating: "4.7",
      stock: "In Stock",
      sizes: ["38", "39", "40", "41", "42"]
    },
    {
      id: 3,
      image: Col3,
      title: "New Arrival",
      desc: "Stylish collection with a fresh market look.",
      price: "LKR 5,200",
      badge: "Top Sale",
      category: "Modern Style",
      rating: "4.6",
      stock: "Limited",
      sizes: ["38", "39", "40", "41", "42"]
    },
    {
      id: 4,
      image: Col4,
      title: "Premium Choice",
      desc: "Perfect fit with a smart and attractive design.",
      price: "LKR 4,800",
      badge: "Top Sale",
      category: "Premium Wear",
      rating: "4.9",
      stock: "In Stock",
      sizes: ["38", "39", "40", "41", "42"]
    },
    {
      id: 5,
      image: Col5,
      title: "Trending Style",
      desc: "Comfortable and fashionable for everyday use.",
      price: "LKR 4,200",
      badge: "Top Sale",
      category: "Trending",
      rating: "4.5",
      stock: "In Stock",
      sizes: ["38", "39", "40", "41", "42"]
    },
    {
      id: 6,
      image: Col6,
      title: "Limited Edition",
      desc: "Fresh top-selling design with stylish comfort.",
      price: "LKR 5,500",
      badge: "Top Sale",
      category: "Limited Collection",
      rating: "5.0",
      stock: "New Stock",
      sizes: ["38", "39", "40", "41", "42"]
    }
  ];

  const handleAddToCart = (product) => {
    alert(`${product.title} added to cart`);
  };

  const handleBuyNow = (product) => {
    alert(`Buy Now: ${product.title}`);
  };

  return (
    <section className="top-sale-section">
      <div className="top-sale-title">
        <h2>Top Sale</h2>
        <p>Best selling fashion collection for you</p>
      </div>

      <div className="top-sale-container">
        {products.map((product) => (
          <div className="top-sale-card" key={product.id}>
            <div className="top-sale-img-box">
              <img src={product.image} alt={product.title} />

              <div className="top-sale-badge">
                <FaFire className="sale-icon" />
                <span>{product.badge}</span>
              </div>
            </div>

            <div className="top-sale-content">
              <h3>{product.title}</h3>

              <div className="top-sale-price-row">
                <p className="top-sale-price">{product.price}</p>
                <span className="koko-text">Koko</span>
              </div>

              <p className="top-sale-desc">{product.desc}</p>

              <div className="top-sale-info">
                <span><strong>Category:</strong> {product.category}</span>
                <span><strong>Rating:</strong> ⭐ {product.rating}</span>
                <span><strong>Status:</strong> {product.stock}</span>
              </div>

              <div className="top-sale-size-section">
                <h4>Available Sizes</h4>
                <div className="top-sale-sizes">
                  {product.sizes.map((size, index) => (
                    <span key={index}>{size}</span>
                  ))}
                </div>
              </div>

              <div className="top-sale-buttons">
                <button
                  className="top-cart-btn"
                  onClick={() => handleAddToCart(product)}
                >
                  Add To Cart
                </button>

                <button
                  className="top-buy-btn"
                  onClick={() => handleBuyNow(product)}
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TopSale;