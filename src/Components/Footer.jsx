import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaShippingFast,
  FaHeadset,
  FaLock,
  FaUndoAlt
} from "react-icons/fa";
import { NavLink } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      {/* Top service section */}
      <div className="footer-top">
        <div className="service-box">
          <FaShippingFast className="service-icon" />
          <div>
            <h4>Fast Delivery</h4>
            <p>Quick and safe delivery across Sri Lanka</p>
          </div>
        </div>

        <div className="service-box">
          <FaHeadset className="service-icon" />
          <div>
            <h4>24/7 Online Service</h4>
            <p>Friendly support anytime you need help</p>
          </div>
        </div>

        <div className="service-box">
          <FaLock className="service-icon" />
          <div>
            <h4>Secure Payment</h4>
            <p>Safe and trusted payment methods</p>
          </div>
        </div>

        <div className="service-box">
          <FaUndoAlt className="service-icon" />
          <div>
            <h4>Easy Returns</h4>
            <p>Simple return process for your convenience</p>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="footer-main">
        {/* About */}
        <div className="footer-column">
          <h2 className="footer-logo">Shoes Hub</h2>
          <p className="footer-about">
            Shoes Hub brings you stylish, comfortable, and high-quality footwear
            for men, women, and kids. We offer modern designs, affordable prices,
            and a smooth shopping experience.
          </p>

          <div className="footer-contact">
            <p><FaMapMarkerAlt className="contact-icon" /> Negombo, Sri Lanka</p>
            <p><FaPhoneAlt className="contact-icon" /> +94 77 123 4567</p>
            <p><FaEnvelope className="contact-icon" /> shoeshub@gmail.com</p>
          </div>
        </div>

        {/* Quick links */}
        <div className="footer-column">
          <h3>Quick Actions</h3>
          <ul className="footer-links">
            <li><NavLink to="/">Home</NavLink></li>
            <li><NavLink to="/womens">Womens</NavLink></li>
            <li><NavLink to="/mens">Mens</NavLink></li>
            <li><NavLink to="/kids">Baby & Kids</NavLink></li>
            <li><NavLink to="/sales">Sale</NavLink></li>
          </ul>
        </div>

        {/* Subscribe */}
        <div className="footer-column">
          <h3>Subscribe</h3>
          <p className="subscribe-text">
            Subscribe to get updates on new arrivals, offers, and discounts.
          </p>

          <div className="subscribe-box">
            <input type="email" placeholder="Enter your email" />
            <button type="button">Subscribe</button>
          </div>

          <div className="social-icons">
            <a href="#"><FaFacebookF /></a>
            <a href="#"><FaInstagram /></a>
            <a href="#"><FaTwitter /></a>
            <a href="#"><FaYoutube /></a>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="footer-bottom">
        <p>© 2026 Shoes Hub. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;