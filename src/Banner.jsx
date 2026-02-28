import { useEffect, useMemo, useState } from "react";
import banner1 from "./assets/Poster1.png";
import banner2 from "./assets/Poster2.png";
import banner3 from "./assets/Poster3.png";
import banner4 from "./assets/poster4.png";

function Banner() {
  const slides = useMemo(
    () => [
      {
        img: banner1,
        title: "New Season Drops",
        desc: "Fresh styles, limited stock. Grab your size now.",
        tag: "Up to 25% off",
        productId: "poster-1",
      },
      {
        img: banner2,
        title: "Streetwear Essentials",
        desc: "Comfort + style for everyday looks.",
        tag: "Trending",
        productId: "poster-2",
      },
      {
        img: banner3,
        title: "Premium Collection",
        desc: "Clean silhouettes. High-quality materials.",
        tag: "New",
        productId: "poster-3",
      },
      {
        img: banner4,
        title: "Sale Picks",
        desc: "Best deals of the week. Don’t miss out.",
        tag: "Hot Deals",
        productId: "poster-4",
      },
    ],
    []
  );

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const intervalMs = 4500; // change time here (ms)

  const next = () => setActive((p) => (p + 1) % slides.length);
  const prev = () => setActive((p) => (p - 1 + slides.length) % slides.length);

  // Auto play
  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, intervalMs);
    return () => clearInterval(id);
  }, [paused, intervalMs, slides.length]);

  // Optional: keyboard arrows
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleAddToCart = (slide) => {
    // TODO: integrate with your cart context/store
    console.log("Add to cart:", slide.productId);
  };

  return (
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
            className={`hero__slide ${i === active ? "is-active" : ""} ${
              i === (active - 1 + slides.length) % slides.length ? "is-prev" : ""
            } ${i === (active + 1) % slides.length ? "is-next" : ""}`}
            aria-hidden={i !== active}
          >
            <img className="hero__img" src={s.img} alt={s.title} />

            {/* overlay */}
            <div className="hero__overlay" />

            <div className="hero__content">
              <span className="hero__pill">{s.tag}</span>
              <h1 className="hero__title">{s.title}</h1>
              <p className="hero__desc">{s.desc}</p>

              <div className="hero__actions">
                <button
                  className="btn btn--primary"
                  onClick={() => handleAddToCart(s)}
                >
                  <span className="btn__spark" aria-hidden="true" />
                  Add to Cart
                </button>

                <button className="btn btn--ghost" onClick={next}>
                  View Next
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* arrows */}
      <button className="hero__arrow hero__arrow--left" onClick={prev} aria-label="Previous slide">
        ‹
      </button>
      <button className="hero__arrow hero__arrow--right" onClick={next} aria-label="Next slide">
        ›
      </button>

      {/* dots */}
      <div className="hero__dots" role="tablist" aria-label="Slide navigation">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`hero__dot ${i === active ? "is-active" : ""}`}
            onClick={() => setActive(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-selected={i === active}
            role="tab"
          />
        ))}
      </div>

      {/* progress bar */}
      <div className={`hero__progress ${paused ? "is-paused" : ""}`}>
        <span
          key={active} // restart animation each slide
          className="hero__progressBar"
          style={{ animationDuration: `${intervalMs}ms` }}
        />
      </div>
    </section>
  );
}

export default Banner;