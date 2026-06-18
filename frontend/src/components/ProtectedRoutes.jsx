import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Basic wrapper requiring user to be logged in
export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loader-container"><div className="loader"></div></div>;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

// Wrapper requiring Seller or Admin role
export const SellerRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loader-container"><div className="loader"></div></div>;
  }

  const isSellerOrAdmin = user && (user.role === 'seller' || user.role === 'admin');
  return isSellerOrAdmin ? <Outlet /> : <Navigate to="/" replace />;
};

// Wrapper requiring Admin role
export const AdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loader-container"><div className="loader"></div></div>;
  }

  const isAdmin = user && user.role === 'admin';
  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};
