import { useEffect, useState } from 'react'

function MensHero({ slides }) {
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
    <section className="mens-hero">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`mens-hero-slide ${index === active ? 'active' : ''}`}
        >
          <img src={slide.image} alt={slide.title} />
          <div className="mens-hero-overlay"></div>

          <div className="mens-hero-content">
            <span className="mens-hero-tag">{slide.tag}</span>
            <h1>{slide.title}</h1>
            <p>{slide.desc}</p>

            <div className="mens-hero-buttons">
              <button className="mens-btn mens-btn-primary">Shop Now</button>
              <button className="mens-btn mens-btn-secondary" onClick={next}>
                View Next
              </button>
            </div>
          </div>
        </div>
      ))}

      <button className="mens-hero-arrow left" onClick={prev}>‹</button>
      <button className="mens-hero-arrow right" onClick={next}>›</button>

      <div className="mens-hero-dots">
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

export default MensHero