import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, User, Search, LogOut, Sliders, Home, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        {/* Logo */}
        <Link to="/" className="nav-logo" onClick={() => setMenuOpen(false)}>
          Venus<span>Shopze</span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="nav-search-form">
          <input
            type="text"
            placeholder="Search electronics by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="nav-search-input"
          />
          <button type="submit" className="nav-search-btn">
            <Search size={18} />
          </button>
        </form>

        {/* Toggle Mobile Menu */}
        <button className="nav-mobile-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Navigation Items */}
        <div className={`nav-links ${menuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-item" onClick={() => setMenuOpen(false)}>
            <Home size={18} />
            <span>Home</span>
          </Link>
          
          <Link to="/catalog" className="nav-item" onClick={() => setMenuOpen(false)}>
            <span>Shop</span>
          </Link>

          {/* Role Based Dashboards */}
          {user && user.role === 'seller' && (
            <Link to="/seller-dashboard" className="nav-item seller-tag" onClick={() => setMenuOpen(false)}>
              <Sliders size={16} />
              <span>Seller Panel</span>
            </Link>
          )}

          {user && user.role === 'admin' && (
            <Link to="/admin-dashboard" className="nav-item admin-tag" onClick={() => setMenuOpen(false)}>
              <Sliders size={16} />
              <span>Admin Panel</span>
            </Link>
          )}

          {/* Cart with count badge */}
          <Link to="/cart" className="nav-item nav-cart" onClick={() => setMenuOpen(false)}>
            <div className="cart-icon-wrapper">
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </div>
            <span>Cart</span>
          </Link>

          {/* Auth Button */}
          {user ? (
            <div className="nav-user-menu">
              <span className="user-greet">Hi, {user.name.split(' ')[0]}</span>
              <button onClick={handleLogout} className="btn-logout nav-item">
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm nav-login-btn" onClick={() => setMenuOpen(false)}>
              <User size={16} />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>

      <style>{`
        .navbar {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--light-gray);
          position: sticky;
          top: 0;
          z-index: 100;
          padding: 0.8rem 0;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
        }
        .nav-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
        }
        .nav-logo {
          font-size: 1.6rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: var(--dark);
        }
        .nav-logo span {
          color: var(--primary);
        }
        .nav-search-form {
          flex: 1;
          max-width: 500px;
          display: flex;
          position: relative;
        }
        .nav-search-input {
          width: 100%;
          padding: 0.65rem 3rem 0.65rem 1.2rem;
          border: 2px solid var(--light-gray);
          border-radius: var(--radius-full);
          font-size: 0.9rem;
          transition: var(--transition-fast);
        }
        .nav-search-input:focus {
          border-color: var(--primary);
        }
        .nav-search-btn {
          position: absolute;
          right: 4px;
          top: 50%;
          transform: translateY(-50%);
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: var(--white);
          border: none;
          width: 36px;
          height: 36px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--dark-light);
          padding: 0.5rem 0.8rem;
          border-radius: var(--radius-sm);
          transition: var(--transition-fast);
          cursor: pointer;
          border: none;
          background: none;
        }
        .nav-item:hover {
          color: var(--primary);
          background-color: var(--light);
        }
        .seller-tag {
          color: var(--secondary);
          border: 1px dashed rgba(var(--secondary-rgb), 0.3);
        }
        .seller-tag:hover {
          background-color: rgba(var(--secondary-rgb), 0.05);
          color: var(--secondary);
        }
        .admin-tag {
          color: #8b5cf6;
          border: 1px dashed rgba(139, 92, 246, 0.3);
        }
        .admin-tag:hover {
          background-color: rgba(139, 92, 246, 0.05);
          color: #8b5cf6;
        }
        .cart-icon-wrapper {
          position: relative;
        }
        .cart-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background-color: var(--secondary);
          color: var(--white);
          font-size: 0.65rem;
          font-weight: 800;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--white);
        }
        .nav-user-menu {
          display: flex;
          align-items: center;
          gap: 1rem;
          border-left: 1px solid var(--light-gray);
          padding-left: 1rem;
        }
        .user-greet {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--primary);
        }
        .btn-logout {
          color: var(--danger) !important;
        }
        .btn-logout:hover {
          background-color: rgba(239, 68, 68, 0.05) !important;
        }
        .nav-mobile-toggle {
          display: none;
          background: none;
          border: none;
          color: var(--dark);
          cursor: pointer;
        }
        @media (max-width: 992px) {
          .nav-search-form {
            display: none; /* In mobile, we route to search page */
          }
          .nav-mobile-toggle {
            display: block;
          }
          .nav-links {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--white);
            flex-direction: column;
            padding: 1.5rem;
            border-top: 1px solid var(--light-gray);
            border-bottom: 2px solid var(--light-gray);
            gap: 1rem;
            display: none;
            box-shadow: var(--shadow-md);
          }
          .nav-links.active {
            display: flex;
          }
          .nav-user-menu {
            flex-direction: column;
            border-left: none;
            padding-left: 0;
            width: 100%;
            gap: 0.5rem;
          }
          .nav-item, .nav-login-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
