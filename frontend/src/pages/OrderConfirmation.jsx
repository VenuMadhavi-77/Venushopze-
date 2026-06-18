import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle, ShoppingBag, MapPin, Truck } from 'lucide-react';

const OrderConfirmation = () => {
  const location = useLocation();
  const order = location.state?.order;

  // Protect page from direct URL access without placing an order
  if (!order) {
    return <Navigate to="/" replace />;
  }

  // Calculate delivery date (today + 3 days)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  const formattedDelivery = deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="container confirmation-container">
      <div className="card confirmation-card">
        {/* Success checkmark */}
        <div className="success-icon-wrapper">
          <CheckCircle size={64} className="success-icon" />
        </div>

        <h1 className="confirmation-title">Order Placed Successfully!</h1>
        <p className="confirmation-lead">
          Thank you for shopping with us! We have received your order and are preparing it for shipment.
        </p>

        {/* Invoice details breakdown */}
        <div className="order-details-summary">
          <div className="details-header-row">
            <div>
              <span className="label">Order ID</span>
              <span className="value text-primary">#{order._id}</span>
            </div>
            <div>
              <span className="label">Total Amount Paid</span>
              <span className="value">₹{order.totalAmount.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="label">Payment Status</span>
              <span className={`badge ${order.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                {order.paymentStatus}
              </span>
            </div>
          </div>

          <div className="summary-columns grid-2">
            {/* Shipping details */}
            <div className="summary-col">
              <h4><MapPin size={16} /> Shipping Details</h4>
              <p>
                <strong>{order.shippingAddress.street}</strong><br />
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}<br />
                {order.shippingAddress.country}
              </p>
            </div>

            {/* Logistics estimation */}
            <div className="summary-col">
              <h4><Truck size={16} /> Estimated Delivery</h4>
              <p className="delivery-est">
                Expected by: <strong>{formattedDelivery}</strong>
              </p>
              <span className="delivery-status">Status: Processing at Warehouse</span>
            </div>
          </div>

          {/* Items checklist */}
          <div className="items-checklist">
            <h4>Ordered Items</h4>
            <div className="items-list-lines">
              {order.items.map((item, index) => (
                <div className="item-line" key={index}>
                  <img src={item.image} alt={item.name} className="item-img" />
                  <div className="item-info">
                    <span className="name">{item.name}</span>
                    <span className="qty">Qty: {item.quantity}</span>
                  </div>
                  <span className="price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="confirmation-footer">
          <Link to="/catalog" className="btn btn-primary">
            Continue Shopping
          </Link>
          <Link to="/catalog" className="btn btn-secondary flex-center">
            <ShoppingBag size={18} /> View All Deals
          </Link>
        </div>
      </div>

      <style>{`
        .confirmation-container {
          padding-top: 4rem;
          max-width: 800px;
        }
        .confirmation-card {
          padding: 3rem;
          text-align: center;
          box-shadow: var(--shadow-lg);
          border-top: 6px solid var(--success);
        }
        
        .success-icon-wrapper {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(16, 185, 129, 0.1);
          color: var(--success);
          width: 100px;
          height: 100px;
          border-radius: 50%;
          margin-bottom: 2rem;
        }
        .success-icon {
          animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes scaleIn {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }

        .confirmation-title {
          font-size: 2.2rem;
          font-weight: 800;
          color: var(--dark);
          margin-bottom: 0.8rem;
        }
        .confirmation-lead {
          color: var(--gray);
          font-size: 1.05rem;
          max-width: 600px;
          margin: 0 auto 3rem auto;
        }

        .order-details-summary {
          background-color: var(--light);
          border-radius: var(--radius-md);
          padding: 2rem;
          text-align: left;
          margin-bottom: 2.5rem;
        }
        .details-header-row {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid var(--light-gray);
          padding-bottom: 1.25rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1.5rem;
        }
        .details-header-row .label {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--gray);
          text-transform: uppercase;
          margin-bottom: 0.2rem;
        }
        .details-header-row .value {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--dark);
        }
        .details-header-row .text-primary {
          color: var(--primary);
        }
        
        .summary-col h4 {
          font-size: 0.95rem;
          font-weight: 800;
          color: var(--dark);
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin-bottom: 0.8rem;
        }
        .summary-col p {
          font-size: 0.85rem;
          color: var(--dark-light);
          line-height: 1.5;
        }
        .delivery-est {
          color: var(--primary);
        }
        .delivery-status {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          background-color: rgba(var(--primary-rgb), 0.08);
          color: var(--primary);
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          margin-top: 0.5rem;
        }

        /* Ordered items list */
        .items-checklist {
          border-top: 1px solid var(--light-gray);
          margin-top: 2rem;
          padding-top: 1.5rem;
        }
        .items-checklist h4 {
          font-size: 0.95rem;
          font-weight: 800;
          margin-bottom: 1rem;
          color: var(--dark);
        }
        .items-list-lines {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .item-line {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.85rem;
          gap: 1rem;
        }
        .item-img {
          width: 40px;
          height: 40px;
          object-fit: cover;
          border-radius: var(--radius-sm);
          background-color: var(--white);
        }
        .item-info {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }
        .item-info .name {
          font-weight: 700;
          color: var(--dark);
        }
        .item-info .qty {
          color: var(--gray);
          font-weight: 600;
        }
        .item-line .price {
          font-weight: 800;
          color: var(--dark);
        }

        .confirmation-footer {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }
        
        @media (max-width: 576px) {
          .confirmation-card {
            padding: 2rem 1.5rem;
          }
          .details-header-row {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderConfirmation;
