import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { Star, ArrowRight, Zap, Award, ShieldCheck, Heart, Headphones, Watch, Smartphone, Laptop, Keyboard } from 'lucide-react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      title: "Noise-Cancelling Audio Masterpieces",
      subtitle: "Sony WH-1000XM5 and boAt Rockerz inside",
      discount: "UP TO 40% OFF",
      bgGradient: "linear-gradient(135deg, #FFEFEC 0%, #FFE6F1 100%)",
      tag: "AUDIO FEVER",
      link: "/catalog?category=Audio"
    },
    {
      title: "Smartwatches That Keep You Active",
      subtitle: "Heart Rate, SpO2 & Sleep Tracker wearables",
      discount: "FLAT 60% OFF",
      bgGradient: "linear-gradient(135deg, #ECF9FF 0%, #E6FFF6 100%)",
      tag: "FITNESS REVOLUTION",
      link: "/catalog?category=Wearables"
    },
    {
      title: "ASUS ROG & OnePlus Nord Deals",
      subtitle: "Ultimate gaming powerhouses & 5G connectivity",
      discount: "EXCHANGE OFFERS",
      bgGradient: "linear-gradient(135deg, #FFFCEB 0%, #FFF0EB 100%)",
      tag: "TECH UNLEASHED",
      link: "/catalog"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await axios.get('/api/products');
        // Show first 4-8 products as featured
        setProducts(response.data.slice(0, 6));
      } catch (err) {
        console.error('Error fetching home products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedProducts();
  }, []);

  const categories = [
    { name: 'Audio', label: 'Audio & Sound', color: '#FF5E36', bg: '#FFF0EC', count: '3 Products', Icon: Headphones },
    { name: 'Wearables', label: 'Smart Wear', color: '#FF2E93', bg: '#FFEBF4', count: '1 Product', Icon: Watch },
    { name: 'Smartphones', label: 'Smartphones', color: '#10B981', bg: '#EAFDF6', count: '1 Product', Icon: Smartphone },
    { name: 'Computing', label: 'Laptops & Tabs', color: '#3B82F6', bg: '#EEF2FF', count: '2 Products', Icon: Laptop },
    { name: 'Accessories', label: 'Accessories', color: '#F59E0B', bg: '#FEF7E6', count: '1 Product', Icon: Keyboard }
  ];

  return (
    <div className="container home-container">
      {/* Sliding Hero Banner */}
      <div className="hero-slider" style={{ background: heroSlides[currentSlide].bgGradient }}>
        <div className="hero-content">
          <span className="hero-tag-badge">{heroSlides[currentSlide].tag}</span>
          <h1 className="hero-title">{heroSlides[currentSlide].title}</h1>
          <p className="hero-subtitle">{heroSlides[currentSlide].subtitle}</p>
          <div className="hero-deal">
            <span className="deal-discount">{heroSlides[currentSlide].discount}</span>
            <span className="deal-validity">*Limited time offer</span>
          </div>
          <Link to={heroSlides[currentSlide].link} className="btn btn-primary hero-btn">
            Shop Collection <ArrowRight size={18} />
          </Link>
        </div>
        
        {/* Slider dots */}
        <div className="slider-dots">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>

      {/* Categories Section */}
      <section className="home-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Pick from our premium, handpicked gadgets catalog</p>
          </div>
        </div>
        
        <div className="category-bubbles">
          {categories.map((cat, idx) => {
            const IconComponent = cat.Icon;
            return (
              <Link
                key={idx}
                to={`/catalog?category=${cat.name}`}
                className="category-bubble-card"
                style={{ '--cat-hover-color': cat.color }}
              >
                <div className="cat-icon-container" style={{ backgroundColor: cat.bg, color: cat.color }}>
                  <IconComponent size={24} />
                </div>
                <h4 className="cat-label">{cat.label}</h4>
                <span className="cat-count">{cat.count}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Trust Badges Bar */}
      <div className="trust-cards-bar">
        <div className="trust-card">
          <Zap size={30} className="trust-icon text-primary" />
          <div>
            <h4>Lightning Fast COD Delivery</h4>
            <p>Shipped in 24 hours across India</p>
          </div>
        </div>
        <div className="trust-card">
          <Award size={30} className="trust-icon text-secondary" />
          <div>
            <h4>100% Genuine Products</h4>
            <p>Directly sourced from trusted brands</p>
          </div>
        </div>
        <div className="trust-card">
          <ShieldCheck size={30} className="trust-icon text-success" />
          <div>
            <h4>Secured Transactions</h4>
            <p>Role-validated buying & seller checks</p>
          </div>
        </div>
      </div>

      {/* Trending Products Grid */}
      <section className="home-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Trending Electronics</h2>
            <p className="section-subtitle">Top rated products flying off the shelves</p>
          </div>
          <Link to="/catalog" className="btn btn-secondary btn-sm flex-center">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="loader-container">
            <div className="loader"></div>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product) => {
              const originalPrice = product.originalPrice || product.mrp || product.price;
              const discountPercent = Math.round(
                ((originalPrice - product.price) / originalPrice) * 100
              ) || 0;
              return (
                <div className="card product-card" key={product._id}>
                  {/* Image Gallery Trigger */}
                  <div className="product-card-img-wrapper">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="product-card-img"
                    />
                    <span className="product-discount-tag">{discountPercent}% OFF</span>
                    <button className="wishlist-btn">
                      <Heart size={16} />
                    </button>
                  </div>

                  <div className="product-card-body">
                    <span className="product-card-cat">{product.category}</span>
                    <Link to={`/products/${product._id}`} className="product-card-title">
                      {product.name}
                    </Link>

                    {/* Ratings */}
                    <div className="product-card-rating">
                      <Star size={14} fill="#FFD700" stroke="#FFD700" />
                      <span className="rating-avg">{product.ratings?.average || '4.0'}</span>
                      <span className="rating-count">({product.ratings?.count || '0'})</span>
                    </div>

                    <div className="product-card-footer">
                      <div className="price-block">
                        <span className="price-sale">₹{product.price.toLocaleString('en-IN')}</span>
                        {originalPrice > product.price && (
                          <span className="price-original">₹{originalPrice.toLocaleString('en-IN')}</span>
                        )}
                      </div>

                      <button
                        onClick={() => addToCart(product, 1)}
                        className="btn btn-primary btn-sm add-cart-btn"
                        disabled={product.stock <= 0}
                      >
                        {product.stock <= 0 ? 'Out of Stock' : 'Add'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <style>{`
        .home-container {
          padding-top: 1rem;
        }
        .hero-content {
          max-width: 600px;
          position: relative;
          z-index: 1;
        }
        .hero-tag-badge {
          background-color: var(--secondary);
          color: var(--white);
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.3rem 0.8rem;
          border-radius: var(--radius-full);
          display: inline-block;
          margin-bottom: 1rem;
        }
        .hero-title {
          font-size: 2.8rem;
          font-weight: 800;
          color: var(--dark);
          line-height: 1.15;
          margin-bottom: 1rem;
        }
        .hero-subtitle {
          font-size: 1.1rem;
          color: var(--dark-light);
          margin-bottom: 1.5rem;
        }
        .hero-deal {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .deal-discount {
          font-size: 1.8rem;
          font-weight: 900;
          color: var(--primary);
        }
        .deal-validity {
          font-size: 0.8rem;
          color: var(--gray);
          font-style: italic;
        }
        .hero-btn {
          box-shadow: 0 10px 20px rgba(var(--primary-rgb), 0.3);
        }
        .slider-dots {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 0.5rem;
          z-index: 2;
        }
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(15, 23, 42, 0.2);
          border: none;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        .dot.active {
          width: 24px;
          border-radius: 4px;
          background: var(--primary);
        }
        
        .home-section {
          margin: 4rem 0;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 2rem;
        }
        .section-title {
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--dark);
        }
        .section-subtitle {
          color: var(--gray);
          font-size: 0.95rem;
        }
        
        /* Categories list */
        .category-bubbles {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1.5rem;
        }
        .category-bubble-card {
          background-color: var(--white);
          border-radius: var(--radius-md);
          padding: 1.5rem;
          text-align: center;
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: var(--transition-normal);
          border: 1px solid rgba(0, 0, 0, 0.02);
        }
        .category-bubble-card:hover {
          transform: translateY(-5px);
          border-color: var(--cat-hover-color);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
        }
        .cat-icon-container {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.2rem;
          margin-bottom: 1rem;
        }
        .cat-label {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--dark);
          margin-bottom: 0.25rem;
        }
        .cat-count {
          font-size: 0.75rem;
          color: var(--gray);
          font-weight: 600;
        }

        /* Trust Banner */
        .trust-cards-bar {
          background-color: var(--white);
          border-radius: var(--radius-md);
          padding: 2rem;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          margin: 3rem 0;
          box-shadow: var(--shadow-sm);
        }
        .trust-card {
          display: flex;
          align-items: center;
          gap: 1.2rem;
        }
        .trust-card h4 {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--dark);
          margin-bottom: 0.2rem;
        }
        .trust-card p {
          font-size: 0.8rem;
          color: var(--gray);
        }
        .text-primary { color: var(--primary); }
        .text-secondary { color: var(--secondary); }
        .text-success { color: var(--success); }

        .flex-center {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
        }

        @media (max-width: 992px) {
          .hero-title {
            font-size: 2.2rem;
          }
          .trust-cards-bar {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
