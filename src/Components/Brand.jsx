import brand1 from "../assets/brandlogo1.png";
import brand2 from "../assets/brandlogo2.png";
import brand3 from "../assets/brandlogo3.png";
import brand4 from "../assets/brandlogo4.png";
import brand5 from "../assets/brandlogo5.png";
import brand6 from "../assets/brandlogo6.png";
import brand7 from "../assets/brandlogo7.png";
import bgImage from "../assets/bag-image.png";

function Brand() {
  const logos = [
    { id: 1, image: brand1, name: "Brand 1" },
    { id: 2, image: brand2, name: "Brand 2" },
    { id: 3, image: brand3, name: "Brand 3" },
    { id: 4, image: brand4, name: "Brand 4" },
    { id: 5, image: brand5, name: "Brand 5" },
    { id: 6, image: brand6, name: "Brand 6" },
    { id: 7, image: brand7, name: "Brand 7" },
  ];

  return (
    <section
      className="brand-section section-gap"
      style={{ backgroundImage: `url(${bgImage})` }}
      data-reveal
    >
      <div className="brand-overlay">
        <h2 className="brand-title">Top Brands</h2>
        <p className="brand-subtitle">Trusted brands available in our store</p>

        <div className="brand-slider">
          <div className="brand-track">
            {[...logos, ...logos].map((logo, index) => (
              <div className="brand-card" key={`${logo.id}-${index}`}>
                <img src={logo.image} alt={logo.name} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Brand;