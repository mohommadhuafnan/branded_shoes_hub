import './Contact.css'
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaPaperPlane,
} from 'react-icons/fa'

import heroImage from '../../assets/conimage1.jpg'
import contactImage from '../../assets/conimage2.jpg'
import Brand from '../../Components/Brand'

function Contact() {
  return (
    <div className="contact-page">
      {/* HERO */}
      <section className="contact-hero">
        <div className="contact-hero-overlay"></div>
        <div className="contact-shape shape-one"></div>
        <div className="contact-shape shape-two"></div>

        <div className="contact-hero-content">
          <div className="contact-hero-text">
            <span className="contact-tag">Contact Us</span>
            <h1>Let’s Connect With Shoes Hub</h1>
            <p>
              We are here to help you with orders, delivery details, product
              questions, and premium shopping support. Reach out and our team
              will assist you quickly.
            </p>

            <div className="contact-hero-buttons">
              <a href="#contact-form-section" className="contact-btn primary-btn">
                Send Message
              </a>
              <a href="#contact-info-section" className="contact-btn secondary-btn">
                View Details
              </a>
            </div>
          </div>

          <div className="contact-hero-image-wrap">
            <div className="contact-hero-image-card">
              <img src={heroImage} alt="Shoes Hub Contact Banner" />
              <div className="floating-contact-card card-one">
                <FaWhatsapp />
                <div>
                  <h4>Quick Response</h4>
                  <p>We reply fast on WhatsApp</p>
                </div>
              </div>

              <div className="floating-contact-card card-two">
                <FaPhoneAlt />
                <div>
                  <h4>Call Support</h4>
                  <p>Friendly customer service</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN SECTION */}
      <section className="contact-section" id="contact-info-section">
        <div className="contact-container">
          {/* LEFT */}
          <div className="contact-info">
            <span className="section-label">Get In Touch</span>
            <h2>We’d Love To Hear From You</h2>
            <p>
              Contact our team for order updates, product information, delivery
              details, and shopping support. We are always ready to help you.
            </p>

            <div className="info-cards">
              <div className="info-card">
                <div className="info-icon">
                  <FaPhoneAlt />
                </div>
                <div>
                  <h4>Phone</h4>
                  <p>+94 77 123 4567</p>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <FaEnvelope />
                </div>
                <div>
                  <h4>Email</h4>
                  <p>shoeshub@gmail.com</p>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <h4>Location</h4>
                  <p>Negombo, Sri Lanka</p>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <FaClock />
                </div>
                <div>
                  <h4>Working Hours</h4>
                  <p>Mon - Sat : 9.00 AM - 8.00 PM</p>
                </div>
              </div>
            </div>

            <div className="social-links">
              <a href="#"><FaFacebookF /></a>
              <a href="#"><FaInstagram /></a>
              <a href="#"><FaWhatsapp /></a>
            </div>
          </div>

          {/* RIGHT */}
          <div className="contact-form-box" id="contact-form-section">
            <div className="contact-image-top">
              <img src={contactImage} alt="Contact Shoes Hub" />
            </div>

            <span className="section-label">Send Message</span>
            <h2>Contact Form</h2>

            <form className="contact-form">
              <div className="form-row">
                <input type="text" placeholder="Your Name" />
                <input type="email" placeholder="Your Email" />
              </div>

              <div className="form-row">
                <input type="text" placeholder="Phone Number" />
                <input type="text" placeholder="Subject" />
              </div>

              <textarea rows="6" placeholder="Write Your Message"></textarea>

              <button type="submit">
                <FaPaperPlane />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* EXTRA */}
      <section className="contact-extra">
        <div className="extra-box">
          <h2>Why Contact Shoes Hub?</h2>

          <div className="extra-grid">
            <div className="extra-card">
              <h3>Fast Support</h3>
              <p>Quick answers for orders, delivery updates, and product questions.</p>
            </div>

            <div className="extra-card">
              <h3>Friendly Service</h3>
              <p>Our team helps you choose the perfect style, size, and product.</p>
            </div>

            <div className="extra-card">
              <h3>Trusted Shopping</h3>
              <p>Enjoy a smooth and premium shopping experience with our support team.</p>
            </div>
          </div>
        </div>
      </section>

      {/* BRAND SECTION */}
      <section className="contact-brand-section">
        <Brand />
      </section>
    </div>
  )
}

export default Contact