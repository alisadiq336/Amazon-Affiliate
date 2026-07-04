import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-content">
        
        {/* Footnotes Columns Grid */}
        <div className="footer-columns">
          <div className="footer-brand">
            <Link to="/" className="navbar-logo" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
              <ShoppingBag className="logo-icon" size={22} />
              <span>Amz<span className="logo-highlight">Store</span></span>
            </Link>
            <p>
              Discover high-fidelity product reviews, technical specs, and editorial suggestions backed by real hands-on lab testing.
            </p>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Homepage</Link></li>
              <li><Link to="/catalog">Explore Catalog</Link></li>
              <li><Link to="/profile">User Profile</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Departments</h4>
            <ul>
              <li><Link to="/catalog?category=electronics">Electronics</Link></li>
              <li><Link to="/catalog?category=home-appliances">Home &amp; Living</Link></li>
              <li><Link to="/catalog?category=fashion-apparel">Apparel &amp; Gear</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Administration</h4>
            <ul>
              <li><Link to="/login?admin=true">Admin Dashboard</Link></li>
              <li><a href="#privacy">Privacy Statement</a></li>
              <li><a href="#terms">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Affiliate Policy Block */}
        <div className="footer-disclaimer">
          <p>
            <strong>Affiliate Policy Disclaimer:</strong> AmzStore is a participant in the Amazon Services LLC Associates Program, 
            an affiliate marketing platform engineered to provide advertising incentives for websites to earn commissions by placing affiliate 
            links redirecting directly to Amazon.com. All purchases made on target landing pages generate minor promotional commissions at no 
            additional expense to your customer checkout bill.
          </p>
        </div>

        {/* Bottom copyright banner */}
        <div className="footer-copyright">
          <p>&copy; {new Date().getFullYear()} AmzStore. Made with precision for premium commerce.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
