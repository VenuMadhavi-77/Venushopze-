import React from 'react';
import { ShoppingBag } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-col brand-col">
          <h3 className="footer-logo">Venus<span>Shopze</span></h3>
          <p className="footer-description">
            India's ultimate trendy electronics shopping destination. Bringing you high-fashion audio gadgets, smartwatches, and computing devices at unbeatable prices.
          </p>
          <div className="trust-badges">
            <span className="trust-badge">⚡ Free & Fast Delivery</span>
            <span className="trust-badge">🛡️ 1 Year Warranty</span>
            <span className="trust-badge">💬 24/7 Indian Support</span>
          </div>
        </div>

        <div className="footer-col">
          <h4 className="footer-title">Categories</h4>
          <ul className="footer-links">
            <li><a href="/catalog?category=Audio">Audio & Headphones</a></li>
            <li><a href="/catalog?category=Wearables">Smart Wearables</a></li>
            <li><a href="/catalog?category=Smartphones">5G Smartphones</a></li>
            <li><a href="/catalog?category=Computing">Laptops & Tablets</a></li>
            <li><a href="/catalog?category=Accessories">Computer Accessories</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-title">Seller Hub</h4>
          <ul className="footer-links">
            <li><a href="/login?role=seller">Sell on VenusShopze</a></li>
            <li><a href="/seller-dashboard">Seller Login</a></li>
            <li><a href="/login">Merchant Terms</a></li>
            <li><a href="/login">Fulfilment Policy</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-title">Contact & Help</h4>
          <p className="contact-info">
            <strong>Support Email:</strong> support@venushopze.in<br />
            <strong>Helpline:</strong> 1800-210-9999 (Toll Free)<br />
            <strong>Address:</strong> Tech Park, Outer Ring Road, Bangalore, Karnataka - 560103
          </p>
          <div className="payment-gateways">
            <span className="gateway-card">UPI</span>
            <span className="gateway-card">RuPay</span>
            <span className="gateway-card">Visa</span>
            <span className="gateway-card">Mastercard</span>
            <span className="gateway-card">COD</span>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="container footer-bottom-content">
          <p>&copy; {new Date().getFullYear()} VenusShopze Private Limited. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Security</a>
          </div>
        </div>
      </div>

      <style>{`
        .footer {
          background-color: var(--dark);
          color: rgba(255, 255, 255, 0.7);
          padding: 4rem 0 0 0;
          margin-top: 4rem;
          border-top: 5px solid var(--primary);
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 2fr;
          gap: 3rem;
          padding-bottom: 3rem;
        }
        .brand-col {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }
        .footer-logo {
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--white);
        }
        .footer-logo span {
          color: var(--primary);
        }
        .footer-description {
          font-size: 0.9rem;
          line-height: 1.6;
        }
        .trust-badges {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .trust-badge {
          font-size: 0.8rem;
          color: var(--white);
          font-weight: 700;
        }
        .footer-title {
          color: var(--white);
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          position: relative;
        }
        .footer-title::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -6px;
          width: 30px;
          height: 3px;
          background-color: var(--primary);
        }
        .footer-links {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }
        .footer-links a {
          font-size: 0.9rem;
          transition: var(--transition-fast);
        }
        .footer-links a:hover {
          color: var(--primary);
          padding-left: 5px;
        }
        .contact-info {
          font-size: 0.85rem;
          line-height: 1.8;
          margin-bottom: 1.5rem;
        }
        .payment-gateways {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .gateway-card {
          background-color: rgba(255, 255, 255, 0.08);
          color: var(--white);
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.25rem 0.6rem;
          border-radius: 4px;
        }
        .footer-bottom {
          background-color: #0b0f19;
          padding: 1.5rem 0;
          font-size: 0.8rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .footer-bottom-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .footer-bottom-links {
          display: flex;
          gap: 1.5rem;
        }
        .footer-bottom-links a:hover {
          color: var(--white);
        }
        @media (max-width: 992px) {
          .footer-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 2rem;
          }
        }
        @media (max-width: 576px) {
          .footer-grid {
            grid-template-columns: 1fr;
          }
          .footer-bottom-content {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
