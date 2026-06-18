import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Edit, CheckCircle, Package, IndianRupee, TrendingUp, Sliders, X } from 'lucide-react';

const SellerDashboard = () => {
  const { user } = useAuth();
  
  // Dashboard view toggles: 'products', 'add-product', 'orders', 'analytics'
  const [activeTab, setActiveTab] = useState('analytics');

  // API Data States
  const [summary, setSummary] = useState({ totalProducts: 0, totalEarnings: 0, itemsSold: 0, pendingOrders: 0 });
  const [salesBreakdown, setSalesBreakdown] = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add/Edit Product Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodOrigPrice, setProdOrigPrice] = useState('');
  const [prodCategory, setProdCategory] = useState('Audio');
  const [prodStock, setProdStock] = useState('10');
  const [prodImages, setProdImages] = useState(''); // Textarea comma separated
  const [prodSpecs, setProdSpecs] = useState([{ key: '', value: '' }]); // Key-value inputs

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const fetchSellerData = async () => {
    setLoading(true);
    try {
      // Fetch analytics summary
      const analyticsRes = await axios.get('/api/analytics/seller');
      setSummary(analyticsRes.data.summary);
      setSalesBreakdown(analyticsRes.data.salesBreakdown);

      // Fetch products listed by this seller
      const productsRes = await axios.get(`/api/products?sellerId=${user.id}`);
      setMyProducts(productsRes.data);

      // Fetch orders for this seller
      const ordersRes = await axios.get('/api/orders/seller');
      setSellerOrders(ordersRes.data);
    } catch (err) {
      console.error('Error fetching seller dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSellerData();
    }
  }, [user]);

  // Handle Specifications additions in Form
  const handleAddSpecLine = () => {
    setProdSpecs([...prodSpecs, { key: '', value: '' }]);
  };

  const handleRemoveSpecLine = (idx) => {
    const list = [...prodSpecs];
    list.splice(idx, 1);
    setProdSpecs(list);
  };

  const handleSpecChange = (idx, field, value) => {
    const list = [...prodSpecs];
    list[idx][field] = value;
    setProdSpecs(list);
  };

  // Create or Update Product
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!prodName || !prodDesc || !prodPrice || !prodOrigPrice || !prodImages) {
      setFormError('Please fill out all required fields');
      return;
    }

    const imageArray = prodImages.split(',').map(url => url.trim()).filter(url => url.length > 0);
    if (imageArray.length === 0) {
      setFormError('Please enter at least one valid image URL');
      return;
    }

    // Convert specs array to Object Map
    const specsMap = {};
    prodSpecs.forEach(spec => {
      if (spec.key.trim() && spec.value.trim()) {
        specsMap[spec.key.trim()] = spec.value.trim();
      }
    });

    const payload = {
      name: prodName,
      description: prodDesc,
      price: Number(prodPrice),
      originalPrice: Number(prodOrigPrice),
      category: prodCategory,
      stock: Number(prodStock),
      images: imageArray,
      specs: specsMap
    };

    try {
      if (isEditing) {
        await axios.put(`/api/products/${editId}`, payload);
        setFormSuccess('Product updated successfully!');
      } else {
        await axios.post('/api/products', payload);
        setFormSuccess('Product added successfully!');
      }

      // Reset form fields
      resetForm();
      fetchSellerData();
      setActiveTab('products');
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error occurred while saving product');
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setProdName('');
    setProdDesc('');
    setProdPrice('');
    setProdOrigPrice('');
    setProdCategory('Audio');
    setProdStock('10');
    setProdImages('');
    setProdSpecs([{ key: '', value: '' }]);
  };

  const handleEditClick = (product) => {
    setIsEditing(true);
    setEditId(product._id);
    setProdName(product.name);
    setProdDesc(product.description);
    setProdPrice(product.price);
    setProdOrigPrice(product.originalPrice || product.mrp || '');
    setProdCategory(product.category);
    setProdStock(product.stock);
    setProdImages(product.images.join(', '));
    
    // Parse specs map back to array
    const specsArr = Object.entries(product.specs || {}).map(([key, value]) => ({ key, value }));
    setProdSpecs(specsArr.length > 0 ? specsArr : [{ key: '', value: '' }]);
    
    setActiveTab('add-product');
  };

  const handleDeleteClick = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product listing? All associated reviews will also be removed.')) {
      try {
        await axios.delete(`/api/products/${productId}`);
        fetchSellerData();
      } catch (err) {
        console.error('Error deleting product:', err);
      }
    }
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, { orderStatus: newStatus });
      fetchSellerData();
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  if (loading) {
    return <div className="loader-container"><div className="loader"></div></div>;
  }

  return (
    <div className="container dashboard-container">
      {/* Dashboard Summary Statistics Grid */}
      <div className="dashboard-header-block card">
        <h1>Seller Control Center</h1>
        <p className="welcome-greet">Welcome back, {user?.name}! Manage your electronic inventory & track performance.</p>
        
        <div className="dashboard-stats-grid">
          <div className="stat-card">
            <Package className="stat-icon text-primary" size={24} />
            <div className="stat-info">
              <span className="stat-label">Products Listed</span>
              <span className="stat-val">{summary.totalProducts}</span>
            </div>
          </div>
          <div className="stat-card">
            <IndianRupee className="stat-icon text-success" size={24} />
            <div className="stat-info">
              <span className="stat-label">Total Earnings</span>
              <span className="stat-val">₹{summary.totalEarnings.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="stat-card">
            <TrendingUp className="stat-icon text-secondary" size={24} />
            <div className="stat-info">
              <span className="stat-label">Items Sold</span>
              <span className="stat-val">{summary.itemsSold}</span>
            </div>
          </div>
          <div className="stat-card">
            <Sliders className="stat-icon text-warning" size={24} />
            <div className="stat-info">
              <span className="stat-label">Pending Orders</span>
              <span className="stat-val">{summary.pendingOrders}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="dashboard-body">
        <aside className="dashboard-sidebar">
          <div className="dashboard-sidebar-card card">
            <button onClick={() => setActiveTab('analytics')} className={`sidebar-btn ${activeTab === 'analytics' ? 'active' : ''}`}>
              Analytics & Insights
            </button>
            <button onClick={() => setActiveTab('products')} className={`sidebar-btn ${activeTab === 'products' ? 'active' : ''}`}>
              My Inventory ({myProducts.length})
            </button>
            <button onClick={() => { resetForm(); setActiveTab('add-product'); }} className={`sidebar-btn ${activeTab === 'add-product' ? 'active' : ''}`}>
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </button>
            <button onClick={() => setActiveTab('orders')} className={`sidebar-btn ${activeTab === 'orders' ? 'active' : ''}`}>
              Manage Orders ({sellerOrders.length})
            </button>
          </div>
        </aside>

        {/* Tab Contents */}
        <main className="dashboard-main-content">
          {/* 1. Analytics tab */}
          {activeTab === 'analytics' && (
            <div className="card content-card">
              <h3>Product Sales Analysis</h3>
              <p className="subtitle-card">Detailed breakdown of sales and revenue generated by each listed item</p>

              {salesBreakdown.length === 0 ? (
                <p className="no-data">No sales data recorded yet. Shipped orders will count towards analytics details.</p>
              ) : (
                <div className="sales-breakdown-list">
                  {salesBreakdown.map((item, idx) => (
                    <div className="sales-breakdown-row" key={idx}>
                      <div className="row-item-details">
                        <strong>{item.name}</strong>
                        <span>Qty Sold: {item.quantity}</span>
                      </div>
                      <span className="row-item-revenue">₹{item.revenue.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. My Inventory tab */}
          {activeTab === 'products' && (
            <div className="card content-card">
              <div className="card-header-row">
                <h3>My Listed Electronics</h3>
                <button onClick={() => { resetForm(); setActiveTab('add-product'); }} className="btn btn-primary btn-sm flex-center">
                  <Plus size={14} /> Add Product
                </button>
              </div>

              {myProducts.length === 0 ? (
                <p className="no-data">You haven't listed any electronic products yet. Click add product to start.</p>
              ) : (
                <div className="inventory-list">
                  {myProducts.map((product) => (
                    <div className="inventory-row card" key={product._id}>
                      <img src={product.images[0]} alt={product.name} className="inventory-img" />
                      <div className="inventory-info">
                        <strong>{product.name}</strong>
                        <span className="category-tag">{product.category}</span>
                        <div className="prices-stock">
                          <span className="price">₹{product.price.toLocaleString('en-IN')}</span>
                          <span className="stock">Stock: {product.stock} left</span>
                        </div>
                      </div>
                      <div className="inventory-actions">
                        <button onClick={() => handleEditClick(product)} className="btn-edit" title="Edit Product">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDeleteClick(product._id)} className="btn-delete" title="Delete Product">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. Add/Edit Product form */}
          {activeTab === 'add-product' && (
            <div className="card content-card">
              <h3>{isEditing ? 'Edit Product Listing' : 'Add New Electronic Item'}</h3>
              <p className="subtitle-card">Fill out details below to post a product directly on the storefront.</p>

              {formError && <div className="error-alert">{formError}</div>}
              {formSuccess && <div className="success-alert">{formSuccess}</div>}

              <form onSubmit={handleProductSubmit} className="add-product-form">
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="form-control"
                    placeholder="e.g. boAt Rockerz 450 Wireless Headphone"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Detailed Description *</label>
                  <textarea
                    required
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    className="form-control"
                    placeholder="Describe technical features, drivers, batteries, compatibility..."
                    rows="4"
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Price (Sale price ₹) *</label>
                    <input
                      type="number"
                      required
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                      className="form-control"
                      placeholder="e.g. 1499"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Original Price (M.R.P ₹) *</label>
                    <input
                      type="number"
                      required
                      value={prodOrigPrice}
                      onChange={(e) => setProdOrigPrice(e.target.value)}
                      className="form-control"
                      placeholder="e.g. 3990"
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      value={prodCategory}
                      onChange={(e) => setProdCategory(e.target.value)}
                      className="form-control"
                    >
                      <option value="Audio">Audio</option>
                      <option value="Wearables">Wearables</option>
                      <option value="Smartphones">Smartphones</option>
                      <option value="Computing">Computing</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Available Inventory Stock *</label>
                    <input
                      type="number"
                      required
                      value={prodStock}
                      onChange={(e) => setProdStock(e.target.value)}
                      className="form-control"
                      placeholder="10"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Product Images (Comma separated URLs) *</label>
                  <textarea
                    required
                    value={prodImages}
                    onChange={(e) => setProdImages(e.target.value)}
                    className="form-control"
                    placeholder="https://image1.url, https://image2.url"
                    rows="2"
                  />
                  <span className="field-hint">Paste 2-3 image URLs from Unsplash for catalog variety.</span>
                </div>

                {/* Dynamic Specifications */}
                <div className="form-group specs-subform">
                  <label className="form-label">Technical Specifications</label>
                  {prodSpecs.map((spec, idx) => (
                    <div className="spec-input-row" key={idx}>
                      <input
                        type="text"
                        placeholder="Feature (e.g. Battery Life)"
                        value={spec.key}
                        onChange={(e) => handleSpecChange(idx, 'key', e.target.value)}
                        className="form-control"
                      />
                      <input
                        type="text"
                        placeholder="Detail (e.g. 15 Hours)"
                        value={spec.value}
                        onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                        className="form-control"
                      />
                      <button type="button" onClick={() => handleRemoveSpecLine(idx)} className="btn-remove-spec">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={handleAddSpecLine} className="btn btn-secondary btn-sm add-spec-btn">
                    + Add Specification Row
                  </button>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {isEditing ? 'Save Changes' : 'Post Product'}
                  </button>
                  <button type="button" onClick={resetForm} className="btn btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 4. Manage Orders tab */}
          {activeTab === 'orders' && (
            <div className="card content-card">
              <h3>Order Fulfilment Queue</h3>
              <p className="subtitle-card">Track customer deliveries and update transit status of your items.</p>

              {sellerOrders.length === 0 ? (
                <p className="no-data">No orders received yet for your items.</p>
              ) : (
                <div className="orders-queue-list">
                  {sellerOrders.map((order) => (
                    <div className="order-queue-row card" key={order._id}>
                      <div className="order-details-head">
                        <div>
                          <strong>Order ID: #{order._id}</strong>
                          <span className="order-date">{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                        </div>
                        <span className="order-sub-total">Earnings: ₹{order.sellerTotal.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="order-items-sublist">
                        {order.items.map((item, idx) => (
                          <div className="order-item-line" key={idx}>
                            <span>• {item.name} x {item.quantity}</span>
                            <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>

                      <div className="order-address-box">
                        <strong>Ship to:</strong> {order.user?.name} | {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                      </div>

                      <div className="order-status-update">
                        <div className="status-current">
                          <span>Delivery Status: </span>
                          <span className={`badge ${order.orderStatus === 'Delivered' ? 'badge-success' : order.orderStatus === 'Cancelled' ? 'badge-warning' : 'badge-primary'}`}>
                            {order.orderStatus}
                          </span>
                        </div>
                        <div className="status-picker">
                          <span>Update: </span>
                          <select
                            value={order.orderStatus}
                            onChange={(e) => handleOrderStatusChange(order._id, e.target.value)}
                            className="status-select"
                          >
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <style>{`
        .dashboard-container {
          padding-top: 2rem;
        }
        .dashboard-header-block {
          padding: 2.5rem;
          margin-bottom: 2rem;
        }
        .welcome-greet {
          color: var(--gray);
          margin-bottom: 1.5rem;
        }
        
        .dashboard-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }
        .stat-card {
          background-color: var(--light);
          padding: 1.25rem;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .stat-icon {
          padding: 0.5rem;
          background-color: var(--white);
          border-radius: 50%;
          box-shadow: var(--shadow-sm);
        }
        .stat-info {
          display: flex;
          flex-direction: column;
        }
        .stat-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--gray);
          text-transform: uppercase;
        }
        .stat-val {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--dark);
        }

        .dashboard-body {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 2rem;
        }
        .dashboard-sidebar-card {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          position: sticky;
          top: 90px;
        }
        .sidebar-btn {
          text-align: left;
          padding: 0.8rem 1rem;
          font-weight: 700;
          font-size: 0.9rem;
          border: none;
          background: none;
          cursor: pointer;
          border-radius: var(--radius-sm);
          color: var(--dark-light);
          transition: var(--transition-fast);
        }
        .sidebar-btn:hover, .sidebar-btn.active {
          background-color: rgba(var(--primary-rgb), 0.05);
          color: var(--primary);
        }

        .content-card {
          padding: 2rem;
        }
        .content-card h3 {
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--dark);
        }
        .subtitle-card {
          font-size: 0.85rem;
          color: var(--gray);
          margin-bottom: 1.5rem;
        }
        .card-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .no-data {
          text-align: center;
          padding: 3rem;
          color: var(--gray);
          font-weight: 600;
        }

        /* Analytics Tab */
        .sales-breakdown-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .sales-breakdown-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background-color: var(--light);
          border-radius: var(--radius-sm);
          font-size: 0.9rem;
        }
        .row-item-details {
          display: flex;
          flex-direction: column;
        }
        .row-item-details strong {
          color: var(--dark);
        }
        .row-item-details span {
          font-size: 0.75rem;
          color: var(--gray);
          font-weight: 700;
        }
        .row-item-revenue {
          font-weight: 800;
          color: var(--primary);
          font-size: 1.05rem;
        }

        /* Inventory List */
        .inventory-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .inventory-row {
          display: grid;
          grid-template-columns: 80px 1fr 100px;
          align-items: center;
          gap: 1.5rem;
          padding: 1rem;
        }
        .inventory-img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: var(--radius-sm);
          background-color: var(--light);
        }
        .inventory-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .inventory-info strong {
          font-size: 0.95rem;
          color: var(--dark);
        }
        .category-tag {
          font-size: 0.7rem;
          color: var(--primary);
          font-weight: 800;
          text-transform: uppercase;
        }
        .prices-stock {
          display: flex;
          gap: 1rem;
          font-size: 0.85rem;
        }
        .prices-stock .price {
          font-weight: 800;
          color: var(--dark);
        }
        .prices-stock .stock {
          color: var(--gray);
        }
        .inventory-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }
        .inventory-actions button {
          border: none;
          background: none;
          padding: 0.5rem;
          cursor: pointer;
          border-radius: var(--radius-sm);
          transition: var(--transition-fast);
        }
        .btn-edit {
          color: var(--secondary);
        }
        .btn-edit:hover {
          background-color: rgba(var(--secondary-rgb), 0.05);
        }
        .btn-delete {
          color: var(--danger);
        }
        .btn-delete:hover {
          background-color: rgba(239, 68, 68, 0.05);
        }

        /* Add Form */
        .add-product-form {
          margin-top: 1rem;
        }
        .field-hint {
          display: block;
          font-size: 0.75rem;
          color: var(--gray);
          margin-top: 0.25rem;
        }
        .specs-subform {
          border: 1px solid var(--light-gray);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          background-color: var(--light);
        }
        .spec-input-row {
          display: grid;
          grid-template-columns: 1fr 1fr 40px;
          gap: 1rem;
          margin-bottom: 0.8rem;
          align-items: center;
        }
        .btn-remove-spec {
          background: none;
          border: none;
          color: var(--danger);
          cursor: pointer;
          padding: 0.5rem;
        }
        .add-spec-btn {
          margin-top: 0.5rem;
        }
        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }
        
        /* Orders Fulfilment */
        .orders-queue-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .order-queue-row {
          padding: 1.5rem;
        }
        .order-details-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--light-gray);
          padding-bottom: 0.8rem;
          margin-bottom: 1rem;
        }
        .order-details-head strong {
          color: var(--primary);
        }
        .order-date {
          display: block;
          font-size: 0.75rem;
          color: var(--gray);
          font-weight: 600;
        }
        .order-sub-total {
          font-weight: 800;
          color: var(--dark);
        }
        .order-items-sublist {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          margin-bottom: 1rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--dark-light);
        }
        .order-item-line {
          display: flex;
          justify-content: space-between;
        }
        .order-address-box {
          background-color: var(--light);
          padding: 0.8rem;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          margin-bottom: 1rem;
          line-height: 1.4;
        }
        .order-status-update {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .status-current {
          font-size: 0.9rem;
          font-weight: 700;
        }
        .status-picker {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 700;
        }
        .status-select {
          padding: 0.4rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--light-gray);
        }

        @media (max-width: 992px) {
          .dashboard-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .dashboard-body {
            grid-template-columns: 1fr;
          }
          .dashboard-sidebar-card {
            position: relative;
            top: 0;
            flex-direction: row;
            overflow-x: auto;
          }
          .sidebar-btn {
            white-space: nowrap;
          }
        }
        @media (max-width: 576px) {
          .dashboard-stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default SellerDashboard;
