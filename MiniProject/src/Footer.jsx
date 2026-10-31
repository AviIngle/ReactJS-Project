
import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Logo and Description */}
        <div className="footer-section">
          <Link to="/" className="logo footer-logo" aria-label="Go to Home">
            <img
              src="/src/assets/logo (1).png"
              alt="My Gallery Logo"
            />
          </Link>

          <p>
            Discover, share and download beautiful images.
            Explore creativity with us!
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h3>Quick Links</h3>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/services">Services</Link>
          <Link to="/contact">Contact</Link>
        </div>

        {/* Social Links */}
        <div className="footer-section">
          <h3>Follow Us</h3>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            Facebook
          </a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
            YouTube
          </a>
        </div>

      </div>

      {/* Copyright */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
