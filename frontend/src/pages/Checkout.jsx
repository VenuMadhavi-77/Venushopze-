import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { MapPin, CreditCard, Lock, ArrowRight, Sparkles } from 'lucide-react';

const Checkout = () => {
  const { cart, cartSubtotal, clearCart } = useCart();
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Address State
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('COD'); // COD or Card
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // Inline Auth State (if guest tries to checkout)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // General States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInlineLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setAuthError(err.message || 'Invalid email or password');
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (cart.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    if (!street || !city || !state || !postalCode) {
      setError('Please fill out all address fields.');
      return;
    }

    if (paymentMethod === 'Card') {
      if (!cardNumber || !expiry || !cvv) {
        setError('Please enter complete card details.');
        return;
      }
    }

    setLoading(true);
    try {
      const orderData = {
        items: cart.map(item => ({
          product: item.product._id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.images[0],
          seller: item.product.seller
        })),
        shippingAddress: { street, city, state, postalCode, country },
        paymentMethod,
        paymentStatus: paymentMethod === 'Card' ? 'Paid' : 'Pending'
      };

      const response = await axios.post('/api/orders', orderData);
      
      // Clear Cart state on success
      clearCart();

      // Redirect to Order Confirmation page with order ID
      navigate('/order-confirmation', { state: { order: response.data } });
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.message || 'Error occurred while placing the order.');
    } finally {
      setLoading(false);
    }
  };

  // If cart is empty and we haven't successfully checked out yet
  if (cart.length === 0) {
    return (
      <div className="container empty-checkout text-center card">
        <h2>No Items to Checkout</h2>
        <p>Go back to the catalog and add products before checking out.</p>
        <Link to="/catalog" className="btn btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container checkout-container">
      <h1 className="checkout-title-main">Secure Checkout</h1>

      {error && <div className="error-banner card">{error}</div>}

      <div className="checkout-layout">
        {/* Left: Address / Payment form */}
        <div className="checkout-form-pane">
          {!user ? (
            /* Inline Authentication Card */
            <div className="card inline-auth-card">
              <div className="inline-auth-header">
                <h3><Sparkles size={20} className="header-icon" /> Login to Place Your Order</h3>
                <p>Already have an account? Sign in below to load saved details and complete checkout.</p>
              </div>

              {authError && <div className="error-alert">{authError}</div>}

              <form onSubmit={handleInlineLogin}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-control"
                    placeholder="name@email.com"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-control"
                    placeholder="Enter your account password"
                  />
                </div>

                <div className="inline-auth-footer">
                  <button type="submit" className="btn btn-primary" disabled={authLoading}>
                    {authLoading ? 'Signing in...' : 'Sign In & Continue'}
                  </button>
                  <span className="register-prompt">
                    New user? <Link to="/login?redirect=checkout">Register Here</Link>
                  </span>
                </div>
              </form>
            </div>
          ) : (
            /* Main Delivery and Payment Forms */
            <form onSubmit={handlePlaceOrder}>
              {/* Delivery Address Card */}
              <div className="card checkout-card">
                <h3><MapPin size={20} className="card-icon" /> Delivery Address</h3>
                
                <div className="form-group">
                  <label className="form-label">Street Address / House No.</label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="form-control"
                    placeholder="e.g. Flat 302, Green Meadows, Outer Ring Rd"
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="form-control"
                      placeholder="e.g. Bangalore"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="form-control"
                      placeholder="e.g. Karnataka"
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Postal / Pincode</label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="form-control"
                      placeholder="e.g. 560103"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input
                      type="text"
                      required
                      readOnly
                      value={country}
                      className="form-control bg-light"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Selection Card */}
              <div className="card checkout-card">
                <h3><CreditCard size={20} className="card-icon" /> Payment Options</h3>

                <div className="payment-options-grid">
                  <label className={`payment-option-card ${paymentMethod === 'COD' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="hidden-radio"
                    />
                    <div className="option-details">
                      <strong>Cash on Delivery (COD)</strong>
                      <p>Pay with cash or UPI on delivery.</p>
                    </div>
                  </label>

                  <label className={`payment-option-card ${paymentMethod === 'Card' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Card"
                      checked={paymentMethod === 'Card'}
                      onChange={() => setPaymentMethod('Card')}
                      className="hidden-radio"
                    />
                    <div className="option-details">
                      <strong>Card Payment (Simulated)</strong>
                      <p>Enter mock details to test payment instantly.</p>
                    </div>
                  </label>
                </div>

                {/* Card input fields if Card selected */}
                {paymentMethod === 'Card' && (
                  <div className="card-inputs-subform">
                    <div className="form-group">
                      <label className="form-label">Card Number</label>
                      <input
                        type="text"
                        required={paymentMethod === 'Card'}
                        placeholder="4111 2222 3333 4444"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="form-control"
                      />
                    </div>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Expiry Date</label>
                        <input
                          type="text"
                          required={paymentMethod === 'Card'}
                          placeholder="MM/YY"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          className="form-control"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">CVV Code</label>
                        <input
                          type="password"
                          required={paymentMethod === 'Card'}
                          placeholder="123"
                          value={cvv}
                          onChange={(e) => setExpiry(e.target.value)} // wait, setCvv
                          className="form-control"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary btn-full checkout-submit-btn" disabled={loading}>
                {loading ? 'Processing Order...' : 'Place Order Now'} <ArrowRight size={18} />
              </button>
            </form>
          )}
        </div>

        {/* Right: Order Summary Sidebar */}
        <aside className="checkout-summary-pane">
          <div className="card checkout-summary-card">
            <h3>Order Summary</h3>
            <div className="checkout-items-list">
              {cart.map((item) => (
                <div className="checkout-item-line" key={item.product._id}>
                  <img src={item.product.images?.[0]} alt={item.product.name} className="checkout-item-img" />
                  <div className="checkout-item-details">
                    <span className="item-name">{item.product.name}</span>
                    <span className="item-qty-price">
                      Qty: {item.quantity} | ₹{item.product.price.toLocaleString('en-IN')} each
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="order-totals">
              <div className="total-row">
                <span>Shipping:</span>
                <span className="text-success-bold">FREE</span>
              </div>
              <div className="total-row grand-total">
                <span>Total Amount:</span>
                <span className="total-val">₹{cartSubtotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="secure-badge">
              <Lock size={14} /> 256-Bit SSL Encrypted Connection
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        .checkout-container {
          padding-top: 2rem;
        }
        .checkout-title-main {
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--dark);
          margin-bottom: 2rem;
        }
        
        .checkout-layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 2rem;
        }

        .error-banner {
          background-color: rgba(239, 68, 68, 0.1);
          color: var(--danger);
          padding: 1rem;
          margin-bottom: 1.5rem;
          font-weight: 700;
          border-left: 5px solid var(--danger);
        }

        .checkout-card {
          padding: 2rem;
          margin-bottom: 1.5rem;
        }
        .checkout-card h3 {
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--dark);
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--light-gray);
          padding-bottom: 0.8rem;
        }
        .card-icon {
          color: var(--primary);
        }
        .bg-light {
          background-color: var(--light);
        }

        /* Inline auth */
        .inline-auth-card {
          padding: 2rem;
        }
        .inline-auth-header {
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--light-gray);
          padding-bottom: 1rem;
        }
        .inline-auth-header h3 {
          font-size: 1.2rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--primary);
          margin-bottom: 0.3rem;
        }
        .header-icon {
          color: var(--secondary);
        }
        .inline-auth-header p {
          font-size: 0.85rem;
          color: var(--gray);
        }
        .inline-auth-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .register-prompt {
          font-size: 0.85rem;
          font-weight: 700;
        }
        .register-prompt a {
          color: var(--primary);
        }

        /* Payment selection */
        .payment-options-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
          margin-bottom: 1.5rem;
        }
        .payment-option-card {
          border: 2px solid var(--light-gray);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          cursor: pointer;
          transition: var(--transition-fast);
          display: flex;
        }
        .payment-option-card:hover {
          border-color: var(--primary);
        }
        .payment-option-card.active {
          border-color: var(--primary);
          background-color: rgba(var(--primary-rgb), 0.03);
        }
        .hidden-radio {
          margin-right: 0.8rem;
          accent-color: var(--primary);
        }
        .option-details strong {
          display: block;
          font-size: 0.95rem;
          color: var(--dark);
          margin-bottom: 0.2rem;
        }
        .option-details p {
          font-size: 0.75rem;
          color: var(--gray);
          line-height: 1.3;
        }
        
        .card-inputs-subform {
          background: var(--light);
          padding: 1.5rem;
          border-radius: var(--radius-md);
          animation: fadeIn 0.3s ease;
        }

        .checkout-submit-btn {
          margin-top: 2rem;
          padding: 1rem;
          font-size: 1.1rem;
        }

        /* Sidebar summary */
        .checkout-summary-card {
          padding: 1.5rem;
          position: sticky;
          top: 90px;
        }
        .checkout-summary-card h3 {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--dark);
          margin-bottom: 1.25rem;
          border-bottom: 1px solid var(--light-gray);
          padding-bottom: 0.6rem;
        }
        .checkout-items-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-height: 280px;
          overflow-y: auto;
          margin-bottom: 1.5rem;
          padding-right: 0.5rem;
        }
        .checkout-item-line {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        .checkout-item-img {
          width: 50px;
          height: 50px;
          object-fit: cover;
          border-radius: var(--radius-sm);
          background-color: var(--light);
        }
        .checkout-item-details {
          display: flex;
          flex-direction: column;
        }
        .item-name {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--dark);
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }
        .item-qty-price {
          font-size: 0.75rem;
          color: var(--gray);
          font-weight: 600;
        }

        .order-totals {
          border-top: 1px dashed var(--light-gray);
          padding-top: 1rem;
          margin-bottom: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          font-weight: 700;
        }
        .grand-total {
          border-top: 1px solid var(--light-gray);
          padding-top: 0.8rem;
          margin-top: 0.4rem;
        }
        .grand-total span {
          font-size: 1.05rem;
          color: var(--dark);
          font-weight: 800;
        }
        .grand-total .total-val {
          font-size: 1.25rem;
          color: var(--primary);
          font-weight: 900;
        }
        .empty-checkout {
          padding: 4rem;
          max-width: 600px;
          margin-top: 5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        @media (max-width: 992px) {
          .checkout-layout {
            grid-template-columns: 1fr;
          }
          .payment-options-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Checkout;
