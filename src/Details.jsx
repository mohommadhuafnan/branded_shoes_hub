import image from './assets/Detail-image.png';

function Details() {
  return (
    <section className="details-section">
      <div className="details-image">
        <img src={image} alt="About our brand" />
      </div>

      <div className="details-content">
        <h2>About Our Brand</h2>
        <p>
          Our brand is built on style, quality, and comfort. We are passionate
          about bringing you modern, trendy, and carefully selected fashion that
          matches your lifestyle and personality. Every product in our
          collection is chosen to help you look confident, feel comfortable, and
          enjoy great value for your money.
        </p>

        <p>
          We believe that fashion is more than just clothing or shoes — it is a
          way to express yourself. That is why we focus on offering stylish
          designs, reliable quality, and affordable prices for everyone. Our
          goal is to make shopping simple, enjoyable, and inspiring, while
          helping our customers discover the perfect products for every
          occasion.
        </p>

        <button className="details-btn">Read More</button>
      </div>
    </section>
  );
}

export default Details;