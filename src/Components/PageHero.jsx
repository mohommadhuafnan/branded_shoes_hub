function PageHero({ eyebrow, title, description, image, tall = false }) {
  return (
    <section className={`page-hero ${tall ? 'tall' : ''}`} data-reveal>
      <div className="page-hero-content reveal-left" data-reveal>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
        <div className="hero-pills">
          <span>Free islandwide shipping over LKR 15,000</span>
          <span>Koko, card, COD, and bank transfer</span>
          <span>Premium quality with size exchange support</span>
        </div>
      </div>
      <div className="page-hero-image reveal-right" data-reveal>
        <img src={image} alt={title} />
      </div>
    </section>
  )
}

export default PageHero
