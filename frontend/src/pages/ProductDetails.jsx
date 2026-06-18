import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Star, ShieldCheck, Heart, ShoppingBag, Plus, Minus, Send } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Review submission state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      setLoading(true);
      try {
        const productRes = await axios.get(`/api/products/${id}`);
        setProduct(productRes.data);
        setActiveImage(productRes.data.images[0]);

        const reviewsRes = await axios.get(`/api/products/${id}/reviews`);
        setReviews(reviewsRes.data);
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductAndReviews();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart(product, quantity);
      navigate('/checkout');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');

    if (!reviewComment.trim()) {
      setReviewError('Review comment is required');
      return;
    }

    try {
      const response = await axios.post(`/api/products/${id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment
      });

      setReviews([response.data, ...reviews]);
      
      // Update local product reviews counts
      const updatedCount = (product.ratings?.count || 0) + 1;
      const totalRatings = (product.ratings?.average || 4.0) * (product.ratings?.count || 0) + reviewRating;
      const updatedAvg = Math.round((totalRatings / updatedCount) * 10) / 10;
      
      setProduct({
        ...product,
        ratings: { average: updatedAvg, count: updatedCount }
      });

      setReviewComment('');
      setReviewRating(5);
      setReviewSuccess('Review submitted successfully!');
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) {
    return <div className="loader-container"><div className="loader"></div></div>;
  }

  if (!product) {
    return (
      <div className="container error-details card">
        <h2>Product Not Found</h2>
        <p>The electronic item you are looking for does not exist or was removed by the seller.</p>
        <Link to="/catalog" className="btn btn-primary">Go to Catalog</Link>
      </div>
    );
  }

  const originalPrice = product.originalPrice || product.mrp || product.price;
  const discountPercent = Math.round(
    ((originalPrice - product.price) / originalPrice) * 100
  ) || 0;

  return (
    <div className="container details-container">
      {/* Product Details Section */}
      <div className="details-card card">
        <div className="details-layout">
          {/* Left: Image Gallery */}
          <div className="image-gallery-pane">
            <div className="main-image-container">
              <img src={activeImage} alt={product.name} className="main-image" />
              {discountPercent > 0 && (
                <span className="details-discount-tag">{discountPercent}% OFF</span>
              )}
            </div>
            <div className="thumbnail-row">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(img)}
                  className={`thumb-btn ${activeImage === img ? 'active' : ''}`}
                >
                  <img src={img} alt={`Thumbnail ${index + 1}`} className="thumb-img" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product details and actions */}
          <div className="info-pane">
            <span className="details-cat">{product.category}</span>
            <h1 className="details-title">{product.name}</h1>

            {/* Ratings Summary */}
            <div className="details-rating-row">
              <div className="stars-wrapper">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    fill={i < Math.round(product.ratings?.average || 4) ? "#FFD700" : "none"}
                    stroke="#FFD700"
                  />
                ))}
              </div>
              <span className="rating-avg-text">{product.ratings?.average || '4.0'} Rating</span>
              <span className="rating-count-text">({product.ratings?.count || 0} Reviews)</span>
            </div>

            {/* Price section */}
            <div className="details-price-row">
              <span className="price-sale">₹{product.price.toLocaleString('en-IN')}</span>
              {originalPrice > product.price && (
                <>
                  <span className="price-original">₹{originalPrice.toLocaleString('en-IN')}</span>
                  <span className="price-save-badge">Save ₹{(originalPrice - product.price).toLocaleString('en-IN')}</span>
                </>
              )}
            </div>

            <p className="details-desc">{product.description}</p>

            {/* Stock indicator */}
            <div className="stock-info">
              {product.stock > 0 ? (
                <span className="stock-in"><ShieldCheck size={16} /> In Stock ({product.stock} units available)</span>
              ) : (
                <span className="stock-out">Out of Stock</span>
              )}
            </div>

            {/* Seller info */}
            {product.seller && (
              <p className="details-seller">
                Sold by: <strong>{product.seller.name}</strong>
              </p>
            )}

            {/* Actions Panel */}
            {product.stock > 0 && (
              <div className="actions-panel">
                <div className="quantity-selector">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="qty-btn"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="qty-btn"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="checkout-btns">
                  <button onClick={handleAddToCart} className="btn btn-secondary flex-center">
                    <ShoppingBag size={18} /> Add to Cart
                  </button>
                  <button onClick={handleBuyNow} className="btn btn-primary flex-center">
                    Buy Now
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Specifications & Reviews */}
      <div className="details-tabs grid-2">
        {/* Specs Card */}
        <div className="card tab-card">
          <h3 className="tab-title">Specifications</h3>
          <div className="specs-table">
            {product.specs && Object.keys(product.specs).length > 0 ? (
              Object.entries(product.specs).map(([key, val], idx) => (
                <div className="specs-row" key={idx}>
                  <span className="spec-key">{key}</span>
                  <span className="spec-val">{val}</span>
                </div>
              ))
            ) : (
              <p className="no-specs">No technical specs provided for this product.</p>
            )}
          </div>
        </div>

        {/* Reviews Card */}
        <div className="card tab-card">
          <h3 className="tab-title">Customer Reviews</h3>

          {/* Add Review Form */}
          {user ? (
            <form onSubmit={handleReviewSubmit} className="review-form">
              <h4>Write a Review</h4>
              {reviewError && <div className="error-alert">{reviewError}</div>}
              {reviewSuccess && <div className="success-alert">{reviewSuccess}</div>}

              <div className="form-group inline-rating">
                <label className="form-label">Rating: </label>
                <div className="stars-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="star-input-btn"
                    >
                      <Star
                        size={20}
                        fill={star <= reviewRating ? "#FFD700" : "none"}
                        stroke="#FFD700"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <textarea
                  placeholder="Share your experience with this gadget..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="form-control review-textarea"
                  rows="3"
                />
              </div>

              <button type="submit" className="btn btn-primary btn-sm flex-center">
                Submit Review <Send size={14} />
              </button>
            </form>
          ) : (
            <div className="login-review-prompt">
              <p>You must be logged in to leave a review.</p>
              <Link to="/login" className="btn btn-secondary btn-sm">Login Now</Link>
            </div>
          )}

          {/* Reviews List */}
          <div className="reviews-list">
            {reviews.length === 0 ? (
              <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
            ) : (
              reviews.map((rev) => (
                <div className="review-card" key={rev._id}>
                  <div className="review-header">
                    <strong>{rev.userName}</strong>
                    <div className="review-stars">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          fill={i < rev.rating ? "#FFD700" : "none"}
                          stroke="#FFD700"
                        />
                      ))}
                    </div>
                  </div>
                  <p className="review-comment">{rev.comment}</p>
                  <span className="review-date">
                    {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        .details-container {
          padding-top: 2rem;
        }
        .details-card {
          padding: 2.5rem;
          margin-bottom: 2rem;
        }
        .details-layout {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 3rem;
        }

        /* Image Gallery */
        .image-gallery-pane {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .main-image-container {
          position: relative;
          background: #F8FAFC;
          border-radius: var(--radius-md);
          overflow: hidden;
          height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .main-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        .details-discount-tag {
          position: absolute;
          top: 15px;
          left: 15px;
          background-color: var(--primary);
          color: var(--white);
          font-weight: 800;
          font-size: 0.85rem;
          padding: 0.3rem 0.8rem;
          border-radius: 4px;
        }
        .thumbnail-row {
          display: flex;
          gap: 1rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }
        .thumb-btn {
          width: 80px;
          height: 80px;
          border-radius: var(--radius-sm);
          border: 2px solid var(--light-gray);
          background: #F8FAFC;
          cursor: pointer;
          overflow: hidden;
          padding: 2px;
          transition: var(--transition-fast);
        }
        .thumb-btn.active, .thumb-btn:hover {
          border-color: var(--primary);
        }
        .thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Info pane */
        .info-pane {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .details-cat {
          font-size: 0.8rem;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--primary);
        }
        .details-title {
          font-size: 2rem;
          font-weight: 800;
          color: var(--dark);
          line-height: 1.2;
        }
        .details-rating-row {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          border-bottom: 1px solid var(--light-gray);
          padding-bottom: 1rem;
        }
        .stars-wrapper {
          display: flex;
          gap: 2px;
        }
        .rating-avg-text {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--dark);
        }
        .rating-count-text {
          font-size: 0.85rem;
          color: var(--gray);
        }

        .details-price-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 0.5rem 0;
        }
        .details-price-row .price-sale {
          font-size: 1.8rem;
          font-weight: 900;
          color: var(--dark);
        }
        .details-price-row .price-original {
          font-size: 1.2rem;
          color: var(--gray);
          text-decoration: line-through;
        }
        .price-save-badge {
          background-color: rgba(16, 185, 129, 0.1);
          color: var(--success);
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.25rem 0.6rem;
          border-radius: var(--radius-sm);
        }
        .details-desc {
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--dark-light);
        }
        
        .stock-info {
          font-size: 0.9rem;
          font-weight: 700;
        }
        .stock-in {
          color: var(--success);
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .stock-out {
          color: var(--danger);
        }
        .details-seller {
          font-size: 0.9rem;
          color: var(--dark-light);
        }

        .actions-panel {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-top: 1.5rem;
          border-top: 1px solid var(--light-gray);
          padding-top: 1.5rem;
        }
        .quantity-selector {
          display: flex;
          align-items: center;
          border: 2px solid var(--light-gray);
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        .qty-btn {
          background: none;
          border: none;
          padding: 0.6rem 0.8rem;
          cursor: pointer;
          color: var(--dark-light);
          transition: var(--transition-fast);
        }
        .qty-btn:hover {
          background-color: var(--light);
          color: var(--primary);
        }
        .qty-value {
          padding: 0 1rem;
          font-weight: 800;
          font-size: 1rem;
        }
        .checkout-btns {
          display: flex;
          gap: 1rem;
          flex: 1;
        }
        .checkout-btns button {
          flex: 1;
        }

        /* Tabs Card specs / reviews */
        .tab-card {
          padding: 2rem;
        }
        .tab-title {
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--dark);
          margin-bottom: 1.5rem;
          border-bottom: 2px solid var(--light-gray);
          padding-bottom: 0.5rem;
        }

        .specs-table {
          display: flex;
          flex-direction: column;
        }
        .specs-row {
          display: flex;
          justify-content: space-between;
          padding: 0.8rem 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.03);
          font-size: 0.9rem;
        }
        .spec-key {
          font-weight: 700;
          color: var(--gray);
        }
        .spec-val {
          font-weight: 600;
          color: var(--dark);
        }
        
        /* Review Submit Form */
        .review-form {
          background-color: var(--light);
          padding: 1.25rem;
          border-radius: var(--radius-md);
          margin-bottom: 2rem;
        }
        .review-form h4 {
          font-size: 1rem;
          font-weight: 800;
          margin-bottom: 1rem;
        }
        .inline-rating {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .stars-input {
          display: flex;
        }
        .star-input-btn {
          background: none;
          border: none;
          cursor: pointer;
        }
        .review-textarea {
          resize: none;
        }
        .error-alert {
          background-color: rgba(239, 68, 68, 0.1);
          color: var(--danger);
          padding: 0.5rem;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          margin-bottom: 1rem;
          font-weight: 700;
        }
        .success-alert {
          background-color: rgba(16, 185, 129, 0.1);
          color: var(--success);
          padding: 0.5rem;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          margin-bottom: 1rem;
          font-weight: 700;
        }
        
        .login-review-prompt {
          text-align: center;
          padding: 1.5rem;
          background: var(--light);
          border-radius: var(--radius-md);
          margin-bottom: 2rem;
        }
        .login-review-prompt p {
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 0.8rem;
        }

        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .review-card {
          border-bottom: 1px solid var(--light-gray);
          padding-bottom: 1.25rem;
        }
        .review-card:last-child {
          border-bottom: none;
        }
        .review-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }
        .review-stars {
          display: flex;
        }
        .review-comment {
          font-size: 0.9rem;
          color: var(--dark-light);
          line-height: 1.5;
        }
        .review-date {
          display: block;
          font-size: 0.75rem;
          color: var(--gray);
          margin-top: 0.5rem;
          font-weight: 600;
        }

        @media (max-width: 992px) {
          .details-layout {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .main-image-container {
            height: 300px;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductDetails;
