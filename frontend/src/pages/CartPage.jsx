import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, ShieldCheck } from 'lucide-react';

const CartPage = () => {
  const { cart, cartSubtotal, cartOriginalSubtotal, cartDiscount, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckoutClick = () => {
    if (cart.length === 0) return;
    
    // Redirect to checkout page directly
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="container empty-cart-container">
        <div className="empty-cart-card card">
          <ShoppingBag size={64} className="empty-cart-icon" />
          <h2>Your Cart is Empty</h2>
          <p>Explore hot electronic gadgets and grab your favorites before they sell out!</p>
          <Link to="/catalog" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container cart-container">
      <h1 className="cart-title-main">Shopping Cart ({cart.reduce((a,c) => a + c.quantity, 0)} Items)</h1>

      <div className="cart-layout">
        {/* Left: Cart Items List */}
        <div className="cart-items-pane">
          {cart.map((item) => {
            const product = item.product;
            if (!product) return null;
            
            const discountPercent = Math.round(
              (((product.originalPrice || product.price) - product.price) / (product.originalPrice || product.price)) * 100
            );

            return (
              <div className="card cart-item-card" key={product._id}>
                <div className="cart-item-img-wrapper">
                  <img src={product.images?.[0]} alt={product.name} className="cart-item-img" />
                </div>

                <div className="cart-item-info">
                  <span className="cart-item-cat">{product.category}</span>
                  <Link to={`/products/${product._id}`} className="cart-item-title">
                    {product.name}
                  </Link>

                  <div className="cart-item-prices">
                    <span className="price-sale">₹{product.price.toLocaleString('en-IN')}</span>
                    {product.originalPrice > product.price && (
                      <>
                        <span className="price-original">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                        <span className="discount-tag">{discountPercent}% Off</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Quantity adjustments */}
                <div className="cart-qty-controls">
                  <div className="quantity-selector selector-sm">
                    <button
                      onClick={() => updateQuantity(product._id, item.quantity - 1)}
                      className="qty-btn"
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(product._id, item.quantity + 1)}
                      className="qty-btn"
                      disabled={item.quantity >= product.stock}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Subtotal & Delete */}
                <div className="cart-item-actions">
                  <span className="item-subtotal">₹{(product.price * item.quantity).toLocaleString('en-IN')}</span>
                  <button
                    onClick={() => removeFromCart(product._id)}
                    className="btn-delete-item"
                    title="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Checkout Billing Details Summary */}
        <aside className="billing-summary-pane">
          <div className="card billing-card">
            <h3>Price Details</h3>
            <div className="billing-rows">
              <div className="billing-row">
                <span>Price (Items Subtotal)</span>
                <span>₹{cartOriginalSubtotal.toLocaleString('en-IN')}</span>
              </div>
              
              {cartDiscount > 0 && (
                <div className="billing-row text-success">
                  <span>Product Discount</span>
                  <span>- ₹{cartDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="billing-row">
                <span>Delivery Charges</span>
                <span className="text-success-bold">FREE</span>
              </div>

              <div className="billing-row border-total">
                <span className="total-label">Total Amount</span>
                <span className="total-val">₹{cartSubtotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {cartDiscount > 0 && (
              <div className="saving-alert">
                🎉 You will save ₹{cartDiscount.toLocaleString('en-IN')} on this order!
              </div>
            )}

            <button onClick={handleCheckoutClick} className="btn btn-primary btn-full checkout-action-btn">
              Proceed to Checkout <ArrowRight size={18} />
            </button>

            <div className="secure-badge">
              <ShieldCheck size={16} /> Secured Checkout | 100% Buyer Protection
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        .cart-container {
          padding-top: 2rem;
        }
        .cart-title-main {
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--dark);
          margin-bottom: 2rem;
        }
        
        .cart-layout {
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 2rem;
        }

        .empty-cart-container {
          padding-top: 5rem;
          max-width: 600px;
        }
        .empty-cart-card {
          padding: 3rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
        }
        .empty-cart-icon {
          color: var(--gray);
          animation: float 4s ease-in-out infinite;
        }
        .empty-cart-card h2 {
          font-weight: 800;
        }
        .empty-cart-card p {
          color: var(--gray);
          margin-bottom: 0.5rem;
        }

        /* Cart List */
        .cart-items-pane {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .cart-item-card {
          display: grid;
          grid-template-columns: 100px 2fr 1fr 1fr;
          align-items: center;
          gap: 1.5rem;
          padding: 1.25rem;
        }
        .cart-item-img-wrapper {
          height: 90px;
          background: #F8FAFC;
          border-radius: var(--radius-sm);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cart-item-img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        .cart-item-info {
          display: flex;
          flex-direction: column;
        }
        .cart-item-cat {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--primary);
          text-transform: uppercase;
        }
        .cart-item-title {
          font-weight: 700;
          color: var(--dark);
          margin: 0.25rem 0;
          font-size: 0.95rem;
          line-height: 1.3;
          /* text ellipsis clamp 1 */
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }
        .cart-item-prices {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .cart-item-prices .price-sale {
          font-weight: 800;
          color: var(--dark);
        }
        .cart-item-prices .price-original {
          font-size: 0.8rem;
          color: var(--gray);
          text-decoration: line-through;
        }
        .discount-tag {
          font-size: 0.75rem;
          color: var(--primary);
          font-weight: 700;
        }

        .selector-sm .qty-btn {
          padding: 0.4rem 0.6rem;
        }
        .selector-sm .qty-value {
          padding: 0 0.6rem;
          font-size: 0.9rem;
        }

        .cart-item-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 1.5rem;
        }
        .item-subtotal {
          font-weight: 800;
          color: var(--dark);
          font-size: 1.05rem;
        }
        .btn-delete-item {
          background: none;
          border: none;
          color: var(--gray);
          cursor: pointer;
          transition: var(--transition-fast);
          padding: 0.3rem;
          border-radius: 4px;
        }
        .btn-delete-item:hover {
          color: var(--danger);
          background-color: rgba(239, 68, 68, 0.05);
        }

        /* Billing panel */
        .billing-summary-pane {
          position: sticky;
          top: 90px;
          height: fit-content;
        }
        .billing-card {
          padding: 1.5rem;
        }
        .billing-card h3 {
          font-size: 1.1rem;
          font-weight: 800;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--light-gray);
          padding-bottom: 0.8rem;
          color: var(--dark);
        }
        .billing-rows {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .billing-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--dark-light);
        }
        .text-success {
          color: var(--success);
        }
        .text-success-bold {
          color: var(--success);
          font-weight: 800;
        }
        .border-total {
          border-top: 1px dashed var(--light-gray);
          padding-top: 1rem;
          margin-top: 0.5rem;
        }
        .total-label {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--dark);
        }
        .total-val {
          font-size: 1.2rem;
          font-weight: 900;
          color: var(--primary);
        }
        .saving-alert {
          background-color: rgba(16, 185, 129, 0.08);
          color: var(--success);
          border: 1px dashed rgba(16, 185, 129, 0.3);
          border-radius: var(--radius-sm);
          padding: 0.75rem;
          text-align: center;
          font-size: 0.85rem;
          font-weight: 700;
          margin: 1.5rem 0;
        }
        .checkout-action-btn {
          margin-bottom: 1rem;
        }
        .secure-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          color: var(--gray);
          font-weight: 700;
        }

        @media (max-width: 992px) {
          .cart-layout {
            grid-template-columns: 1fr;
          }
          .cart-item-card {
            grid-template-columns: 80px 1.5fr 1fr;
            gap: 1rem;
          }
          .cart-qty-controls {
            grid-column: 2;
          }
          .cart-item-actions {
            grid-column: 3;
            flex-direction: column;
            align-items: flex-end;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CartPage;
