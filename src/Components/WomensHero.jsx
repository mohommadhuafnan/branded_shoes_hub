import { useEffect, useState } from 'react'

function WomensHero({ slides }) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length)
    }, 4000)

    return () => clearInterval(id)
  }, [slides.length])

  const next = () => setActive((prev) => (prev + 1) % slides.length)
  const prev = () => setActive((prev) => (prev - 1 + slides.length) % slides.length)

  return (
    <section className="women-hero">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`women-hero-slide ${index === active ? 'active' : ''}`}
        >
          <img src={slide.image} alt={slide.title} />
          <div className="women-hero-overlay"></div>

          <div className="women-hero-content">
            <span className="women-hero-tag">{slide.tag}</span>
            <h1>{slide.title}</h1>
            <p>{slide.desc}</p>

            <div className="women-hero-buttons">
              <button className="women-btn women-btn-primary">Shop Now</button>
              <button className="women-btn women-btn-secondary" onClick={next}>
                View Next
              </button>
            </div>
          </div>
        </div>
      ))}

      <button className="women-hero-arrow left" onClick={prev}>
        ‹
      </button>

      <button className="women-hero-arrow right" onClick={next}>
        ›
      </button>

      <div className="women-hero-dots">
        {slides.map((_, index) => (
          <button
            key={index}
            className={index === active ? 'active' : ''}
            onClick={() => setActive(index)}
          ></button>
        ))}
      </div>
    </section>
  )
}

export default WomensHero