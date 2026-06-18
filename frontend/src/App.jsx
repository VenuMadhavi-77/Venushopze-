import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Components & Page Imports
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetails from './pages/ProductDetails';
import CartPage from './pages/CartPage';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import LoginRegister from './pages/LoginRegister';
import SellerDashboard from './pages/SellerDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Route guards
import { ProtectedRoute, SellerRoute, AdminRoute } from './components/ProtectedRoutes';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="app-container">
            {/* Global Navigation Header */}
            <Navbar />

            {/* Main Application Routes */}
            <main className="main-content">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/login" element={<LoginRegister />} />

                {/* Authenticated Customer Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-confirmation" element={<OrderConfirmation />} />
                </Route>

                {/* Seller & Admin Authorized Routes */}
                <Route element={<SellerRoute />}>
                  <Route path="/seller-dashboard" element={<SellerDashboard />} />
                </Route>

                {/* Admin Exclusive Routes */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin-dashboard" element={<AdminDashboard />} />
                </Route>
              </Routes>
            </main>

            {/* Global Footer Information */}
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
