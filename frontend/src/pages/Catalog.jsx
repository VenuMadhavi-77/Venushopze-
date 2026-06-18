import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { Star, SlidersHorizontal, Search, RotateCcw, Heart } from 'lucide-react';

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  // Filters State
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '');
  const [searchVal, setSearchVal] = useState(searchParams.get('search') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Trigger search params change on submit
  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();
    
    const params = {};
    if (categoryFilter) params.category = categoryFilter;
    if (searchVal.trim()) params.search = searchVal.trim();
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setCategoryFilter('');
    setSearchVal('');
    setMinPrice('');
    setMaxPrice('');
    setSearchParams({});
  };

  // Sync state with url params on change
  useEffect(() => {
    setCategoryFilter(searchParams.get('category') || '');
    setSearchVal(searchParams.get('search') || '');
    
    const fetchFilteredProducts = async () => {
      setLoading(true);
      try {
        // Build query string
        const queryParams = new URLSearchParams();
        const cat = searchParams.get('category');
        const search = searchParams.get('search');
        const minP = searchParams.get('minPrice');
        const maxP = searchParams.get('maxPrice');

        if (cat) queryParams.append('category', cat);
        if (search) queryParams.append('search', search);
        if (minP) queryParams.append('minPrice', minP);
        if (maxP) queryParams.append('maxPrice', maxP);

        const response = await axios.get(`/api/products?${queryParams.toString()}`);
        let data = response.data;

        // Apply client side sorting
        if (sortBy === 'price-low') {
          data.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-high') {
          data.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'rating') {
          data.sort((a, b) => (b.ratings?.average || 0) - (a.ratings?.average || 0));
        }

        setProducts(data);
      } catch (err) {
        console.error('Error fetching catalog products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [searchParams, sortBy]);

  const categories = ['Audio', 'Wearables', 'Smartphones', 'Computing', 'Accessories'];

  return (
    <div className="container catalog-container">
      {/* Search Result Title */}
      <div className="catalog-header">
        <h1 className="catalog-title">
          {searchParams.get('search') ? (
            <span>Search results for "{searchParams.get('search')}"</span>
          ) : searchParams.get('category') ? (
            <span>Category: {searchParams.get('category')}</span>
          ) : (
            <span>All Electronics</span>
          )}
        </h1>
        <p className="catalog-count">{products.length} Items Found</p>
      </div>

      <div className="catalog-layout">
        {/* Sidebar Filter Panel */}
        <aside className="filter-sidebar">
          <div className="filter-card card">
            <div className="filter-title-row">
              <h3><SlidersHorizontal size={16} /> Filters</h3>
              <button onClick={handleResetFilters} className="btn-reset">
                <RotateCcw size={12} /> Reset
              </button>
            </div>

            {/* Keyword Search */}
            <form onSubmit={handleApplyFilters} className="filter-section">
              <label className="form-label">Search Keyword</label>
              <div className="search-input-wrapper">
                <input
                  type="text"
                  placeholder="Exact match query..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="form-control"
                />
                <button type="submit" className="search-sidebar-btn">
                  <Search size={14} />
                </button>
              </div>
            </form>

            {/* Category selection */}
            <div className="filter-section">
              <label className="form-label">Category</label>
              <div className="category-options">
                <button
                  onClick={() => { setCategoryFilter(''); setSearchParams(prev => { prev.delete('category'); return prev; }); }}
                  className={`category-btn ${!categoryFilter ? 'active' : ''}`}
                >
                  All Categories
                </button>
                {categories.map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setCategoryFilter(cat); setSearchParams(prev => { prev.set('category', cat); return prev; }); }}
                    className={`category-btn ${categoryFilter === cat ? 'active' : ''}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="filter-section">
              <label className="form-label">Price Range (₹)</label>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="form-control price-box"
                />
                <span className="price-divider">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="form-control price-box"
                />
              </div>
              <button onClick={() => handleApplyFilters()} className="btn btn-secondary btn-sm btn-full apply-btn">
                Apply Price Filter
              </button>
            </div>
          </div>
        </aside>

        {/* Catalog Main Feed */}
        <main className="catalog-feed">
          {/* Sorting Header */}
          <div className="sorting-header card">
            <span className="results-indicator">Showing 1-{products.length} of {products.length} products</span>
            <div className="sorting-selector">
              <span>Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loader-container">
              <div className="loader"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-catalog card">
              <h2>No Matching Electronics</h2>
              <p>We couldn't find any products with exact matches for your filters. Try resetting filters or searching another keyword.</p>
              <button onClick={handleResetFilters} className="btn btn-primary">
                View All Products
              </button>
            </div>
          ) : (
            <div className="catalog-grid">
              {products.map((product) => {
                const originalPrice = product.originalPrice || product.mrp || product.price;
                const discountPercent = Math.round(
                  ((originalPrice - product.price) / originalPrice) * 100
                ) || 0;
                return (
                  <div className="card product-card" key={product._id}>
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
        </main>
      </div>

      <style>{`
        .catalog-container {
          padding-top: 2rem;
        }
        .catalog-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          border-bottom: 2px solid var(--light-gray);
          padding-bottom: 1rem;
        }
        .catalog-title {
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--dark);
        }
        .catalog-count {
          color: var(--gray);
          font-weight: 700;
        }

        .catalog-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 2rem;
        }
        
        /* Filters */
        .filter-card {
          padding: 1.5rem;
          position: sticky;
          top: 90px;
        }
        .filter-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--light-gray);
          padding-bottom: 0.8rem;
        }
        .filter-title-row h3 {
          font-size: 1.1rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .btn-reset {
          background: none;
          border: none;
          color: var(--gray);
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          transition: var(--transition-fast);
        }
        .btn-reset:hover {
          color: var(--primary);
        }
        .filter-section {
          margin-bottom: 1.5rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.03);
          padding-bottom: 1.25rem;
        }
        .filter-section:last-child {
          border-bottom: none;
          padding-bottom: 0;
          margin-bottom: 0;
        }
        .search-input-wrapper {
          position: relative;
        }
        .search-sidebar-btn {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--gray);
          cursor: pointer;
        }
        .search-sidebar-btn:hover {
          color: var(--primary);
        }
        
        .category-options {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .category-btn {
          text-align: left;
          padding: 0.5rem 0.8rem;
          border-radius: var(--radius-sm);
          border: none;
          background: none;
          font-weight: 600;
          font-size: 0.85rem;
          color: var(--dark-light);
          cursor: pointer;
          transition: var(--transition-fast);
        }
        .category-btn:hover, .category-btn.active {
          background-color: rgba(var(--primary-rgb), 0.06);
          color: var(--primary);
        }

        .price-inputs {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.8rem;
        }
        .price-box {
          padding: 0.5rem;
          text-align: center;
        }
        .price-divider {
          color: var(--gray);
        }
        .apply-btn {
          margin-top: 0.5rem;
        }

        /* Feed */
        .sorting-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          margin-bottom: 1.5rem;
        }
        .results-indicator {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--gray);
        }
        .sorting-selector {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-weight: 700;
        }
        .sort-select {
          padding: 0.4rem 0.8rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--light-gray);
          background: var(--white);
          cursor: pointer;
        }

        .catalog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 1.5rem;
        }

        .empty-catalog {
          padding: 3rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        .empty-catalog h2 {
          font-weight: 800;
          color: var(--dark);
        }
        .empty-catalog p {
          color: var(--gray);
          max-width: 500px;
          margin-bottom: 1rem;
        }

        @media (max-width: 768px) {
          .catalog-layout {
            grid-template-columns: 1fr;
          }
          .filter-card {
            position: relative;
            top: 0;
            margin-bottom: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Catalog;
