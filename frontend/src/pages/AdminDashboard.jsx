import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Users, ShoppingCart, ShieldAlert, BarChart3, IndianRupee, Trash2 } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  
  // Tab-views: 'overview', 'users', 'transactions'
  const [activeTab, setActiveTab] = useState('overview');

  // API states
  const [summary, setSummary] = useState({ totalUsers: 0, totalProducts: 0, totalOrders: 0, totalRevenue: 0 });
  const [statusBreakdown, setStatusBreakdown] = useState({ Processing: 0, Shipped: 0, Delivered: 0, Cancelled: 0 });
  const [usersList, setUsersList] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch system statistics
      const statsRes = await axios.get('/api/analytics/admin');
      setSummary(statsRes.data.summary);
      setStatusBreakdown(statsRes.data.statusBreakdown);

      // 2. Fetch all registered users
      const usersRes = await axios.get('/api/analytics/admin/users');
      setUsersList(usersRes.data);

      // 3. Fetch all system orders
      const ordersRes = await axios.get('/api/orders/admin');
      setAllOrders(ordersRes.data);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAdminData();
    }
  }, [user]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`/api/analytics/admin/users/${userId}/role`, { role: newRole });
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating user role');
    }
  };

  const handleUserDelete = async (userId) => {
    if (window.confirm('Are you sure you want to permanently delete this user account? This cannot be undone.')) {
      try {
        await axios.delete(`/api/analytics/admin/users/${userId}`);
        fetchAdminData();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting user');
      }
    }
  };

  if (loading) {
    return <div className="loader-container"><div className="loader"></div></div>;
  }

  return (
    <div className="container admin-container">
      {/* Admin Summary Stats Block */}
      <div className="admin-header-block card">
        <h1>Administrator Dashboard</h1>
        <p className="welcome-greet">Global oversight. Manage user access levels and review transactions.</p>
        
        <div className="admin-stats-grid">
          <div className="stat-card">
            <Users className="stat-icon text-primary" size={24} />
            <div className="stat-info">
              <span className="stat-label">Total Users</span>
              <span className="stat-val">{summary.totalUsers}</span>
            </div>
          </div>
          <div className="stat-card">
            <ShoppingCart className="stat-icon text-secondary" size={24} />
            <div className="stat-info">
              <span className="stat-label">Total Orders</span>
              <span className="stat-val">{summary.totalOrders}</span>
            </div>
          </div>
          <div className="stat-card">
            <IndianRupee className="stat-icon text-success" size={24} />
            <div className="stat-info">
              <span className="stat-label">Gross Sales</span>
              <span className="stat-val">₹{summary.totalRevenue.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="stat-card">
            <ShieldAlert className="stat-icon text-warning" size={24} />
            <div className="stat-info">
              <span className="stat-label">Listed Products</span>
              <span className="stat-val">{summary.totalProducts}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="admin-body">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-card card">
            <button onClick={() => setActiveTab('overview')} className={`sidebar-btn ${activeTab === 'overview' ? 'active' : ''}`}>
              System Overview
            </button>
            <button onClick={() => setActiveTab('users')} className={`sidebar-btn ${activeTab === 'users' ? 'active' : ''}`}>
              Manage Users ({usersList.length})
            </button>
            <button onClick={() => setActiveTab('transactions')} className={`sidebar-btn ${activeTab === 'transactions' ? 'active' : ''}`}>
              All Transactions ({allOrders.length})
            </button>
          </div>
        </aside>

        {/* Tab content boards */}
        <main className="admin-main-content">
          {/* 1. Overview Board */}
          {activeTab === 'overview' && (
            <div className="card content-card">
              <h3>Delivery Logistics Metrics</h3>
              <p className="subtitle-card">Current breakdown of orders status across the e-commerce system</p>
              
              <div className="metrics-list">
                <div className="metric-row">
                  <div className="metric-info">
                    <span>Processing Warehouse Items</span>
                    <strong>{statusBreakdown.Processing || 0} Orders</strong>
                  </div>
                  <div className="progress-bar-container"><div className="progress-bar bg-primary" style={{ width: `${(statusBreakdown.Processing / (summary.totalOrders || 1)) * 100}%` }}></div></div>
                </div>

                <div className="metric-row">
                  <div className="metric-info">
                    <span>In Transit (Shipped)</span>
                    <strong>{statusBreakdown.Shipped || 0} Orders</strong>
                  </div>
                  <div className="progress-bar-container"><div className="progress-bar bg-warning" style={{ width: `${(statusBreakdown.Shipped / (summary.totalOrders || 1)) * 100}%` }}></div></div>
                </div>

                <div className="metric-row">
                  <div className="metric-info">
                    <span>Delivered Successfully</span>
                    <strong>{statusBreakdown.Delivered || 0} Orders</strong>
                  </div>
                  <div className="progress-bar-container"><div className="progress-bar bg-success" style={{ width: `${(statusBreakdown.Delivered / (summary.totalOrders || 1)) * 100}%` }}></div></div>
                </div>

                <div className="metric-row">
                  <div className="metric-info">
                    <span>Cancelled Orders</span>
                    <strong>{statusBreakdown.Cancelled || 0} Orders</strong>
                  </div>
                  <div className="progress-bar-container"><div className="progress-bar bg-danger" style={{ width: `${(statusBreakdown.Cancelled / (summary.totalOrders || 1)) * 100}%` }}></div></div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Manage Users Table */}
          {activeTab === 'users' && (
            <div className="card content-card">
              <h3>Registered User Management</h3>
              <p className="subtitle-card">Review accounts and alter access level credentials.</p>

              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email Address</th>
                      <th>Account Role</th>
                      <th>Registered On</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((usr) => (
                      <tr key={usr._id}>
                        <td><strong>{usr.name}</strong></td>
                        <td>{usr.email}</td>
                        <td>
                          {usr._id === user.id ? (
                            <span className="badge badge-success">You (Admin)</span>
                          ) : (
                            <select
                              value={usr.role}
                              onChange={(e) => handleRoleChange(usr._id, e.target.value)}
                              className="table-select"
                            >
                              <option value="user">User / Buyer</option>
                              <option value="seller">Seller / Merchant</option>
                              <option value="admin">System Admin</option>
                            </select>
                          )}
                        </td>
                        <td>
                          {new Date(usr.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td>
                          {usr._id !== user.id && (
                            <button onClick={() => handleUserDelete(usr._id)} className="btn-table-delete" title="Delete User">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. All Transactions Log */}
          {activeTab === 'transactions' && (
            <div className="card content-card">
              <h3>Transaction Logs</h3>
              <p className="subtitle-card">Overview of all orders made through the shopping application.</p>

              {allOrders.length === 0 ? (
                <p className="no-data">No transactions logged in the system.</p>
              ) : (
                <div className="transactions-queue">
                  {allOrders.map((ord) => (
                    <div className="transaction-log-card card" key={ord._id}>
                      <div className="log-row-head">
                        <div>
                          <strong>Order ID: #{ord._id}</strong>
                          <span className="buyer-name">Buyer: {ord.user?.name} ({ord.user?.email})</span>
                        </div>
                        <span className="amount">₹{ord.totalAmount.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="log-items-list">
                        {ord.items.map((item, idx) => (
                          <div className="log-item-line" key={idx}>
                            <span>{item.name} x {item.quantity}</span>
                            <span>(Seller ID: {item.seller})</span>
                          </div>
                        ))}
                      </div>

                      <div className="log-footer">
                        <span>Payment: <strong>{ord.paymentMethod}</strong> ({ord.paymentStatus})</span>
                        <span>Delivery Status: 
                          <span className={`badge ${ord.orderStatus === 'Delivered' ? 'badge-success' : ord.orderStatus === 'Cancelled' ? 'badge-warning' : 'badge-primary'}`}>
                            {ord.orderStatus}
                          </span>
                        </span>
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
        .admin-container {
          padding-top: 2rem;
        }
        .admin-header-block {
          padding: 2.5rem;
          margin-bottom: 2rem;
        }
        .welcome-greet {
          color: var(--gray);
          margin-bottom: 1.5rem;
        }

        .admin-stats-grid {
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

        .admin-body {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 2rem;
        }
        .admin-sidebar-card {
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

        .no-data {
          text-align: center;
          padding: 3rem;
          color: var(--gray);
          font-weight: 600;
        }

        /* Overview Tab metrics */
        .metrics-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .metric-row {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .metric-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          font-weight: 700;
        }
        .progress-bar-container {
          width: 100%;
          height: 8px;
          background-color: var(--light-gray);
          border-radius: var(--radius-full);
          overflow: hidden;
        }
        .progress-bar {
          height: 100%;
          border-radius: var(--radius-full);
        }
        .bg-primary { background-color: var(--primary); }
        .bg-warning { background-color: var(--warning); }
        .bg-success { background-color: var(--success); }
        .bg-danger { background-color: var(--danger); }

        /* Manage Users Table */
        .table-responsive {
          overflow-x: auto;
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
          text-align: left;
        }
        .admin-table th {
          background-color: var(--light);
          padding: 0.75rem 1rem;
          font-weight: 800;
          color: var(--dark);
          border-bottom: 2px solid var(--light-gray);
        }
        .admin-table td {
          padding: 1rem;
          border-bottom: 1px solid var(--light-gray);
          color: var(--dark-light);
        }
        .table-select {
          padding: 0.35rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--light-gray);
        }
        .btn-table-delete {
          background: none;
          border: none;
          color: var(--danger);
          cursor: pointer;
          padding: 0.4rem;
          border-radius: 4px;
          transition: var(--transition-fast);
        }
        .btn-table-delete:hover {
          background-color: rgba(239, 68, 68, 0.05);
        }

        /* Transactions Log */
        .transactions-queue {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .transaction-log-card {
          padding: 1.25rem;
        }
        .log-row-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--light-gray);
          padding-bottom: 0.6rem;
          margin-bottom: 0.8rem;
        }
        .log-row-head strong {
          color: var(--primary);
        }
        .buyer-name {
          display: block;
          font-size: 0.75rem;
          color: var(--gray);
          font-weight: 600;
        }
        .log-row-head .amount {
          font-weight: 800;
          color: var(--dark);
          font-size: 1.05rem;
        }
        .log-items-list {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          font-size: 0.8rem;
          color: var(--dark-light);
          font-weight: 600;
          margin-bottom: 0.8rem;
        }
        .log-item-line {
          display: flex;
          justify-content: space-between;
        }
        .log-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8rem;
          font-weight: 700;
        }

        @media (max-width: 992px) {
          .admin-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .admin-body {
            grid-template-columns: 1fr;
          }
          .admin-sidebar-card {
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
          .admin-stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
